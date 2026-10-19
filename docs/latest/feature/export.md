# 导出

导出功能入口在“更多 > 导出”:
![img_14](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_14.png)

点击导出，进入导出面板：
![img_15](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_15.png)

你可以定制导出excel的表头，以及设置某些列不导出，最后根据需要导出已勾选、当前页或全部数据。
表格启用多选时，已勾选导出的范围会跨页累计；若勾选记录中包含尚未保存的新增行，请先保存或取消勾选。

## 自定义Java类型的导出值

默认情况下，导出会使用 Jackson 将字段值序列化后写入 Excel。如果业务字段是文件对象、枚举包装对象等需要特殊文本表达的
Java 类型，可以注册一个 `ExcelValueConverter<T>` Spring Bean。FastCrud 会按字段声明的 Java 类型自动匹配转换器，
前端列配置和 Controller 无需修改。

例如，将所有 `IS3File` 字段导出为文件名：

```java
@Component
public class DefaultS3FileExcelValueConverter
        implements ExcelValueConverter<IS3File> {

    @Override
    public Class<IS3File> supportedType() {
        return IS3File.class;
    }

    @Override
    public Object convert(IS3File value) {
        return value.getFilename();
    }
}
```

- 多个转换器可使用 `@Order` 或实现 `Ordered` 指定优先级，首个匹配字段声明类型的转换器生效。
- 返回 `null` 会导出为空单元格；转换器抛出异常时终止导出，并进入 `exportFail` 流程。
- 无匹配转换器时，字符串、数字、日期等 EasyExcel 可写值保持原值；对象序列化为 Map 等不可写类型时记录错误日志，
  并仅将该单元格导出为空串，避免整个 Excel 下载失败。
- 转换器只作用于数据导出，不参与导入解析和空模板导出。
- 当前按字段声明的直接 Java 类型匹配，不解析 `List<MyType>` 中的泛型元素类型。

> 由于excel单个单元格难以支持多图/多文件，因此`FastTableColumnImg`和`FastTableColumnFile`配置为multiple时, 导出的内容不渲染图片，
> 为原始json数据。

> 下拉列(`FastTableColumnSelect`/`FastTableColumnSwitch`)会带上数据校验下拉。excel的内联下拉列表以英文逗号分隔且总长不能超过255字符，
> 因此当某个选项文案含英文逗号或选项总长超限时，后端会自动降级为"引用隐藏sheet区间"的下拉校验，确保一个选项不会被拆成两个。
> 该隐藏sheet(`__fc_options__`)仅在出现上述情况时才生成，并被标记为隐藏。
