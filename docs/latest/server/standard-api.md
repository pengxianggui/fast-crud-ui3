# 标准Rest接口

## 标准Rest接口指的是什么?

**这里的`标准Rest接口`指的是[`FastTable`](/latest/comp/fast-table)组件的完整功能所需的接口。**

回想前面[标准功能介绍](/latest/feature/summery), `FastTable`的完整功能当中需要后端提供哪些接口？

1. 分页接口
2. 新增接口/批量新增接口
3. 更新接口/批量更新接口
4. 删除接口
5. 导出接口
6. 动筛面板里涉及的distinct 的列表接口

因此标准的Rest接口就是上面这些(未来可能持续追加..)

以一个`StudentController`为例：

```java
@Api(tags = "学生")
@RestController
@RequestMapping("student")
public class StudentController extends BaseController<Student> {
    public StudentController(StudentService studentService) {
        super(studentService, Student.class);
    }
}
```

查看接口文档:
![img_16](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_16.png)

可以看到, 这些接口`BaseController`已经提供，你也可以在StudentController重写这些接口方法。

## 标准Rest接口列表

| 接口path          | 接口名   | 对应FastTable功能                                  |
|-----------------|-------|------------------------------------------------|
| `/page`         | 分页查询  | 其灵活的接口入参支持FastTable丰富的查询功能                     |
| `/insert`       | 插入    | 插入单行时                                          |
| `/insert/batch` | 批量插入  | 多行插入时                                          |
| `/update`       | 更新    | 单行更新时                                          |
| `/update/batch` | 批量更新  | 多行更新时                                          |
| `/list`         | 列表    | 动筛面板中distinct查询时                               |
| `/delete`       | 删除    | 删除单条记录时                                        |
| `/delete/batch` | 批量删除  | 删除多条记录时                                        |
| `/export`       | 导出    | 更多 > 导出                                        |
| `/upload`       | 上传    | 涉及上传的列(FastTableColumnImg和FastTableColumnFile) |
| `/download`     | 下载-预览 | 涉及下载的列(FastTableColumnFile)                    |
| `/exists`       | 存在性查询 | -                                              |
| `/detail/{id}`  | 详情    | -                                              |

> 可以看到`BaseController`中还提供了几个`FastTable`暂未、或未必用到的接口：
> 1. 上传: **未必用到**，这个接口只有当存在`FastTableColumnImg`或`FastTableColumnFile`时会用到。
> 2. 下载-预览: **未必用到**，这个接口只有当存在`FastTableColumnImg`或`FastTableColumnFile`时、且图片/文件为本地存储时会用到
     (如果是oss存储地址一般是绝对地址)。
> 3. 详情: **暂未用到**。
> 4. 存在性查询: **暂未用到**, 未来计划`FastTableColumn*`提供`unique`配置项。

:::warning
任何时候，继承`BaseController`都**不是必须**的，只是每个`FastTable`组件实例的完整功能都需要这么一组接口，所以FastCrud内置给你提供了这样一个类
——继承它就实现了这组标准接口。

你大可以自行实现`FastTable`组件所需的所有接口。当然, 对于没有用到的接口完全可以不提供, 例如你只使用了`FastTable`
的分页查询功能，那么只需要自行实现分页接口即可。
:::

## 如何实现标准Rest接口?

这些接口开发者大可以自行实现——只要出入参满足`FastTable`的要求即可。

但FastCrud依然通过一个maven构件——`fast-crud-spring-boot-starter`
帮助开发者快速实现标准Rest接口, 它提供了两种实践达成这一目的:

1. 继承内置的`BaseController`: 它已预定义好了前端`<fast-table>`
   组件所需的所有接口。详细步骤参考[快速开始](/latest/getting-started)中"后端集成"和"开发后端部分"。
2. 借助[`MPJLambdaWrapperBuilder`](/latest/server/mpj-lambda-wrapper-builder)
   和[`UpdateJoinWrapperBuilder`](/latest/server/update-join-wrapper-builder)
   完全自行实现这些接口。可不必继承FastCrud提供的`BaseController`和`BaseService/BaseServiceImpl`类，也不限你的代码类组织形式。

:::tip
比较推荐两者结合的方式, 在项目或模块初期使用方案1, 后续通过方法重写, 借助方案2支持更多复杂场景。
:::

## 接下来

你可能发现了`BaseController`提供了一个泛型参数，在上面的`StudentController`中，声明的泛型类型是`Student`
——它直接映射数据表`student`。这意味着与`StudentController`对接的`FastTable`表格维护的是一个单表，未涉及跨表的数据分页显示，以及跨表的增删改功能。

FastCrud还能支持跨表吗? **是的，FastCrud完全支持，并且跨表与否对前端完全无感**

那对于后端呢，FastCrud如何实现通过`fast-table`维护一个跨表数据？

只需要定义一个特别的DTO类——称之为`FastDTO`——并声明为BaseController的泛型类型即可，而跨表的信息均在这个Fast DTO类里注明，
具体请参考章节[Fast DTO](/latest/server/fast-dto)。
