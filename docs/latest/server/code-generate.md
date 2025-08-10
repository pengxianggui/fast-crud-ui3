# 代码生成

在[`快速开始`](/latest/getting-started)章节中，通过如下继承关系:

```java
public class StudentController extends BaseController<Student> {}
public class StudentService extends BaseService<Student> {}
public class StudentServiceImpl extends BaseServiceImpl<StudentMapper, Student> implements StudentService {}
public class StudentMapper extends BaseMapper<Student> {}
```

快速实现了`标准Rest接口`的接口定义(controller中)和实现(service中)。

可能很多模块都是这么继承的，因此FastCrud提供了另一个maven构件——`fast-crud-auto-generator`,
借助[`Mybatis-plus代码生成器`](https://baomidou.com/guides/code-generator/)的能力, 生成这面提到的这些类。

:::warning
`fast-crud-auto-generator`完全是可选的，如果你的代码类组织形式较为相似，建议使用。
:::

## 添加依赖

```xml

<dependency>
    <groupId>io.github.pengxianggui</groupId>
    <artifactId>fast-crud-auto-generator</artifactId>
    <version>${fast-crud.version}</version>
</dependency>
```

## 自定义main方法——代码生成程序入口

```java
public class CodeGenerator {
    public static void main(String[] args) {
        CodeAutoGenerator.builder()
                .module("demo") // 项目为maven多模块时, 指定是哪个模块 
                .author("pengxg") // 生成类的@author
                .url("jdbc:mysql://127.0.0.1:3306/fast-crud") // 数据库地址
                .username("root") // 数据库账号
                .password("xxxxxx") // 数据库密码
                .parentPkg("io.github.pengxianggui.crud.demo") // 生成的类文件所在的根包路径
                .entitySuperClass(BaseEntity.class) // 实体类继承父类: 很多时候针对id, createTime等字段会放到一个基础实体类里。不需要时此行注释。
                .build()
                .generate();
    }
```

每次需要针对某个表——如:`student`,
新建`StudentController`、`StudentService`、`StudentServiceImpl`、`Student`、`StudentMapper`时，即可执行上面的main方法。

## 交互式按需生成

![img_17](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_17.png)

> `stu`代表生成的类文件将放在`stu`包下, 例如StudentController放在`io.github.pengxianggui.crud.demo.controller.stu`包下,
> 其它类文件同理。
