# 导入

导入功能入口在“更多 > 导入”。点击后弹出导入面板, 面板中可拖拽(或点击选择)一个excel文件,
并可通过面板下方的“下载导入模板”文本按钮下载模板:

- 导入模板借助已有的导出接口实现(导出参数`template=true`), 因此模板的表头(含下拉选项、日期格式等)与导出完全一致, 且只包含`importable`不为`false`的列;
- 前端不限制文件大小, 由后端Spring MVC的`spring.servlet.multipart.max-file-size`控制;
- 一次仅支持导入一个文件: 已选择文件后不能再次拖入/选择, 需先移除(叉掉)已选文件;
- 导入未做进度反馈, 提交期间按钮处于loading状态, 避免重复点击。

导入请求为`multipart/form-data`, 其中列配置与额外参数作为body中的json部分提交(对标导出接口的`ExportParam`):

| part名   | 内容                                                                   |
|---------|----------------------------------------------------------------------|
| `param` | json, 形如`{"columns": [...与导出列元数据同构...], "extra": {...}}`               |
| `file`  | excel文件                                                              |

## 新增与更新

导入被视作一次事务内的“批量新增 + 批量更新”, 逐行触发后端的`beforeInsert/afterInsert`或`beforeUpdateById/afterUpdateById`钩子。每一行按下述规则决定新增还是更新:

1. 行内主键(如`id`)有值: 按主键更新;
2. 无主键, 但配置了`importUnique`的列: 使用所有`importUnique`列组合(AND)匹配已有记录, 命中则更新, 未命中则新增;
3. 既无主键也未配置`importUnique`: 一律新增。

例如, 希望按“物料编码”导入更新, 则:

```html
<fast-table-column-prop prop="code" label="物料编码" importUnique></fast-table-column-prop>
```

> 更新时**只更新excel中真正填了值的列**, 未导入的列(如`create_time`等审计字段、`importable=false`的列、模板中未出现的列)保持原值,
> 不会被置空。因此导入也无法把某列清空; 若业务确实需要把null也更新到库里, 可在Service中覆写`importUpdateNull()`返回`true`(注意此时未导入的列会被置空)。

## 数据校验与错误提示

导入前会对所有行做一次整批校验(复用与新增/更新一致的校验注解与分组), 任一环节失败都会整批回滚(不写入任何数据),
并在导入弹窗中展示每一处错误的行号、字段与原因, 便于修正后重新导入。

## 额外参数

某些场景下, 希望本次导入的数据都归属于某个业务对象(例如全部归属于某个客户), 可通过`importExtra`向导入请求追加参数,
后端在`beforeImport`钩子中获取后自行处理:

```js
const option = new FastTableOption({
  baseUrl: '/material',
  // 对象或函数(scope为{columns, pageQuery})
  importExtra: {customerId: 1},
  beforeImport: ({columns, pageQuery}) => Promise.resolve(),
  importSuccess: ({columns, pageQuery, result}) => Promise.resolve(),
  importFail: ({columns, pageQuery, result, error}) => Promise.resolve()
})
```

```java
@Service
public class MaterialServiceImpl extends BaseServiceImpl<MaterialMapper, Material> {

    @Override
    protected <DTO> void beforeImport(ImportContext<DTO> context) {
        Object customerId = context.getExtra().get("customerId");
        // 回填到每一行, 或在此做自定义业务校验; 抛出异常将终止导入并整批回滚
        context.getRows().forEach(row -> ((MaterialPageVO) row.getModel()).setCustomerId((Integer) customerId));
    }
}
```

## 相关配置

| 配置                       | 说明                                                                 | 类型                                   | 默认值                        |
|--------------------------|--------------------------------------------------------------------|--------------------------------------|----------------------------|
| importUrl                | 导入接口地址(下载导入模板复用`exportUrl`)                                        | `String`                             | `${baseUrl}/import`        |
| importable               | 是否可导入。若为false则关闭导入入口(也不会出现在导入模板中)                                 | `Boolean`/`Function<() => Boolean>`  | `true`                     |
| importExtra              | 导入时额外携带的参数, 会以json字符串随请求提交, 后端可在beforeImport钩子中获取                  | `Object`/`Function`                  | `{}`                       |
| beforeImport             | 【钩子】导入请求前执行。返回reject则阻断导入                                          | `Function<({columns, pageQuery}) => Promise>` | `Promise.resolve()` |
| importSuccess            | 【钩子】导入成功后执行(此时列表已刷新)                                              | `Function<({columns, pageQuery, result}) => Promise>` | `Promise.resolve()` |
| importFail               | 【钩子】导入失败后执行(含校验失败与请求失败)                                          | `Function<({columns, pageQuery, result, error}) => Promise>` | `Promise.resolve()` |

列组件上的`importable`(默认`true`, 图片/文件列默认`false`)与`importUnique`(默认`false`)详见[FastTableColumn*](/latest/comp/fast-table-column)。

> 后端需为业务Controller继承`BaseController`以自动获得`${baseUrl}/import`接口, 并可在Service中覆写`beforeImport`钩子。
