# Fast DTO

在上一章节的末尾, 针对——“`fast-table`维护跨表数据, 后端需要怎么做？”——引出了答案：定义一个Fast DTO类。

一个FastDTO类只是一个普通的POJO类，或者当做一个VO类。不同的是，它得用`fast-crud-spring-boot-starter`提供的一套注解来声明跨表信息，
以及字段取值信息。

先看下面这两个例子。

## 案例

### StudentPageVO

```java
/**
 * 学生分页视图模型
 */
@Data
@JoinMain(Student.class)
@LeftJoin(value = StudentSensitive.class, on = {@OnCond(field = "studentId", targetClazz = Student.class, targetField = "id")})
public class StudentPageVO {

    private Integer id;

    @ApiModelProperty("头像地址")
    private String avatarUrl;

    @ApiModelProperty("相册")
    private List<FileItem> gallery;

    @ApiModelProperty("姓名")
    private String name;

    @ApiModelProperty("年龄")
    private Integer age;

    @ApiModelProperty("生日")
    private LocalDate birthday;

    @ApiModelProperty("性别")
    private String sex;

    @ApiModelProperty("属国")
    private String state;

    @ApiModelProperty("仰慕者id")
    private Integer loveId;

    @ApiModelProperty("仰慕者姓名")
    private String loveName;

    @ApiModelProperty("简介")
    private String info;

    @ApiModelProperty("已毕业")
    private Boolean graduated;

    @ApiModelProperty("幸运时刻")
    private LocalTime luckTime;

    @ApiModelProperty("简历地址")
    private List<FileItem> resumeUrl;

    @ApiModelProperty("创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty("更新时间")
    private LocalDateTime updateTime;

    // ------------------ 以下字段来自关联实体
    @ApiModelProperty("身份证号")
    @RelateTo(value = StudentSensitive.class)
    private String idCard;

    @ApiModelProperty("地址")
    @RelateTo(value = StudentSensitive.class)
    private String address;

    @ApiModelProperty("联系电话")
    @RelateTo(value = StudentSensitive.class)
    private String phone;
}

```

上述DTO是一个典型的分页VO, 它描述了跨表信息, 以查询为例，它可以解析出如下查询语句:

```sql
select t.id,
       ..., -- 略:t中的其它字段
       t1.id_card as idCard, -- StudentSensitive中的属性
       t1.address as address, -- StudentSensitive中的属性
       t1.phone as phone -- StudentSensitive中的属性
from student t
left join student_sensitive t1 on t1.student_id = t.id
where ...
```

再看一个存在一对多关联关系的例子。

### StudentDetailVO

```java
/**
 * 学生详情视图模型
 */
@Data
@JoinMain(Student.class)
@LeftJoin(value = StudentSensitive.class, on = {@OnCond(field = "studentId", targetClazz = Student.class, targetField = "id")})
@LeftJoin(value = StudentScore.class, on = {@OnCond(field = "studentId", targetClazz = Student.class, targetField = "id")})
public class StudentDetailVO {

    private Integer id;

    @ApiModelProperty("头像地址")
    private String avatarUrl;

    @ApiModelProperty("相册")
    private List<FileItem> gallery;

    @ApiModelProperty("姓名")
    private String name;

    @ApiModelProperty("年龄")
    private Integer age;

    @ApiModelProperty("生日")
    private LocalDate birthday;

    @ApiModelProperty("性别")
    private String sex;

    @ApiModelProperty("属国")
    private String state;

    @ApiModelProperty("仰慕者id")
    private Integer loveId;

    @ApiModelProperty("仰慕者姓名")
    private String loveName;

    @ApiModelProperty("简介")
    private String info;

    @ApiModelProperty("已毕业")
    private Boolean graduated;

    @ApiModelProperty("幸运时刻")
    private LocalTime luckTime;

    @ApiModelProperty("简历地址")
    private List<FileItem> resumeUrl;

    @ApiModelProperty("创建时间")
    private LocalDateTime createTime;

    @ApiModelProperty("更新时间")
    private LocalDateTime updateTime;

    // ------------------ 以下字段来自关联实体: StudentSensitive ------------------
    @ApiModelProperty("身份证号")
    @RelateTo(value = StudentSensitive.class)
    private String idCard;

    @ApiModelProperty("地址")
    @RelateTo(value = StudentSensitive.class)
    private String address;

    @ApiModelProperty("联系电话")
    @RelateTo(value = StudentSensitive.class)
    private String phone;
    
    // ------------------ 一对多关联子表: StudentScore ------------------
    @ApiModelProperty("学科")
    @RelateTo(value = StudentScore.class, dbField = false)
    private List<StudentScore> scores;
}

```

上面这个Fast DTO是一个典型的详情VO。它可以代表:

```sql
select t.id,
       ..., -- 略
       t1.id_card as idCard, -- StudentSensitive中的属性
       t1.address as address, -- StudentSensitive中的属性
       t1.phone as phone, -- StudentSensitive中的属性
       t2.student_id as studentId, -- StudentScore中的属性
       t2.subject as subject, -- StudentScore中的属性
       t2.score as score -- StudentScore中的属性
from student t
left join student_sensitive t1 on t1.student_id = t.id
left join student_score t2 on t2.student_id = t.id
where ...
```

> 由于在`StudentDetailVO`这个FastDTO里声明的scores属性类型是集合，因此会视为一对多查询`student_score`表，关联的多条score会被塞进
> scores这个集合属性中。

在上面两个例子中可以看到一些FastCrud提供的注解(类级别、字段级别)，这些注解共同描述了是如何跨表的。

## 跨表注解

### `@JoinMain`

**这个是Fast DTO类必不可少的注解**，它声明了当前DTO类的主类——即主表对应的类。
> 以分页查询为例, 主类即 sql中`from`的表。

当前DTO类的属性中，未声明`@RelateTo`的字段都将视为主类中的同名字段。

### `@LeftJoin`

声明`left join`信息，告诉FastCrud要left join什么实体类, 以及on条件是什么。

### `@RightJoin`

声明`right join`信息, 告诉FastCrud要right join什么实体类, 以及on条件是什么。

### `@InnerJoin`

声明`inner join`信息, 告诉FastCrud要inner join什么实体类, 以及on条件是什么。

> 当前@*Join注解的on条件暂不支持静态常量值。例如: `left join xx t1 on t1.id = 1`。

### `@RelateTo`

声明DTO中某个字段，关联的哪个实体类中的哪个字段。以跨表查询——`select t.id, ..., t1.address from student t ...`
为例，相当于其中的`t1.address`，蕴含了两个信息: 字段名是address, 它来自t1表。
> 若某个DTO未声明此注解, 则默认为主类中的字段。

### `@JoinIgnore`

修饰在DTO字段上，用于声明某个字段并不关联相关实体类中的什么字段。比如某个属性的值需要在程序里自行赋值，则可以用这个注解修饰，以免FastCrud找不到
表字段。

## 原理

### 跨表查询

针对跨表查询, `FastCrud`提供了一个[`MPJLambdaWrapperBuilder`](/latest/server/mpj-lambda-wrapper-builder)类，可解析此DTO类,
构造分页查询、列表查询、详情查询所需的`MPJLambdaWrapper`对象，看这个例子：

```java
PageQuery query = ...; // 通常是接口传入的
Page<StudentPageVO> pager = new Page<>(query.getCurrent(), query.getSize());
MPJLambdaWrapper<Student> wrapper = new MPJLambdaWrapperBuilder<Student>(StudentPageVO.class)
        .query(query)
        .build();
return baseMapper.selectJoinPage(pager, StudentPageVO.class, wrapper);
```

> 关于`MPJLambdaWrapperBuilder`类更多细节,详见[MPJLambdaWrapperBuilder章节](/latest/server/mpj-lambda-wrapper-builder)

### 跨表更新

而针对跨表更新, `FastCrud`则提供了一个[`UpdateJoinWrapperBuilder`](/latest/server/update-join-wrapper-builder)
类，可解析此DTO类，构造更新所需的`UpdateJoinWrapper`对象:

```java
StudentPageVO model = ...; // 往往是前端传入，或后端自行构造的，set的键值依据
UpdateJoinWrapper<Student> wrapper = new UpdateJoinWrapperBuilder<Student, StudentPageVO>(StudentPageVO.class)
        .set(model)
        .where(w -> Student::getId, 1))
        .updateNull(false)
        .build();
return baseMapper.updateJoin(null, wrapper);
```

> 关于`UpdateJoinWrapperBuilder`
> 类更多细节,详见[UpdateJoinWrapperBuilder章节](/latest/server/update-join-wrapper-builder)

**借助`MPJLambdaWrapperBuilder`和`UpdateJoinWrapperBuilder`, 你完全可以自行开发`FastTable`
功能所需的[标准Rest接口](/latest/server/standard-api)**, 从而完全脱离`fast-crud-spring-boot-starter`
提供的`BaseController/BaseService/BaseServiceImpl`。

:::tip
事实上, `BaseController`里标准Rest接口也完全是通过这两个类实现的。
:::
