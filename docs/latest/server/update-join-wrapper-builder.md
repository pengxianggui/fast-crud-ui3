# UpdateJoinWrapperBuilder

`UpdateJoinWrapperBuilder`是FastCrud提供的一个builder类: 指定FastDTO类型、指定参数即可构造目标`UpdateJoinWrapper`实例。
> `UpdateJoinWrapper`
> 是MPJ中用于更新的wrapper，详见[MPJ官网](https://mybatis-plus-join.github.io/pages/core/api/updateJoin.html)

## eg1: 基础

```java
StudentPageVO model = ...; // 接口传入或手动构造
UpdateJoinWrapper<Student> wrapper = new UpdateJoinWrapperBuilder<Student, StudentPageVO>(StudentPageVO.class)
                .set(model)
                .where(w -> w.eq(Student::getId, 1))
                .build();
baseMapper.updateJoin(null, wrapper);
```

这个例子构造一个UpdateJoinWrapper对象, 并且其中的`from`、`join`都将从`StudentPageVO`中解析, 而update语句中的`set`、`where`
为自定义, set——将把model中的所有属性值持久化到数据库。

## eg2: 进阶

有时我们希望在上面基础上关联更多的表(这些表并没有在`StudentPageVO`中声明`join`信息), 并且更新这些表的字段值。

```java
StudentPageVO model = ...; // 接口传入或手动构造
UpdateJoinWrapper<Student> wrapper = new UpdateJoinWrapperBuilder<Student, StudentPageVO>(StudentPageVO.class)
                .set(model)
                .appendSet(w -> w.set(Student::getName, "李四")
                        .set(StudentSensitive::getAddress, "浙江省嘉兴市")
                        .set(StudentCertificate::getNumber, "124"))
                .appendJoin(w -> w.leftJoin(StudentCertificate.class, StudentCertificate::getStudentId, Student::getId))
                .where(w -> w.eq(Student::getId, 1))
                .build();
baseMapper.updateJoin(null, wrapper);
```

上面这个例子中, `Student`和`StudentSensitive`在`StudentPageVO`中是有声明的, 而`StudentCertificate`是没有声明的,
这里通过`appendSet`扩展了set部分。

:::warning

1. model中如果name值为"张三", 最终更新的name值将为"李四"。appendSet是后定义的，将覆盖set(model)。
2. `UpdateJoinWrapperBuilder`中的方法注意append*和无append的区别
   :::

更多详见此类[源码](https://github.com/pengxianggui/fast-crud/blob/main/fast-crud-spring-boot-starter/src/main/java/io/github/pengxianggui/crud/join/UpdateJoinWrapperBuilder.java)

