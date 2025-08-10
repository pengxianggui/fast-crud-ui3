# MPJLambdaWrapperBuilder

`MPJLambdaWrapperBuilder`是FastCrud提供的一个builder类: 指定FastDTO类型、指定参数即可构造目标`MPJLambdaWrapper`实例。

> `MPJLambdaWrapper`是MPJ的核心`QueryWrapper`
> ，详见[MPJ官网](https://mybatis-plus-join.github.io/pages/core/lambda/select/distinct.html)

## eg1: 基础

```java
Query query = ...; // 通常是接口传入
MPJLambdaWrapper<Student> wrapper = new MPJLambdaWrapperBuilder<Student>(StudentPageVO.class)
    .query(query)
    .build();
List<StudentPageVO> vos = baseMapper.selectJoinList(StudentPageVO.class, wrapper)
```

这个例子构造一个MPJLambdaWrapper对象，并且其中的`from`、`join`都将从`StudentPageVO`中解析, 而`select`、`where`、`order by`
将从query解析。如此，很方便手写`标准Rest接口`，以满足`FastTable`的接口需求。
> query中cols若为空, 则表示`StudentPageVO`中定义的所有类字段都作为select依据(除了`@JoinIgnore`修饰的)

## eg2: 进阶

有时除了基于`FastDTO`类和`query`，还需要多查询一些关联表, 这时可以自定义一些查询条件以及join信息。

```java
Query query = ...; // 通常是接口传入
MPJLambdaWrapper<Student> wrapper = new MPJLambdaWrapperBuilder<Student>(StudentPageVO.class)
    .query(query)
    .appendSelect(w -> w.selectAs(StudentCertificate::getNumber, StudentPageVO::getStudentNumber))
    .appendJoin(w -> w.leftJoin(StudentCertificate.class, StudentCertificate::getStudentId, Student::getId))
    .appendWhere(w -> w.like(StudentCertificate::getNumber, "123")) // 学号为123 
    .build();
List<StudentPageVO> vos = baseMapper.selectJoinList(StudentPageVO.class, wrapper)
```

如此一来, 在DTO+query构建的`MPJLambdaWrapper`基础上，增加了从StudentCertificate查询学号(number), 并增加针对number的筛选条件。
利用这种扩展方式，可以在基于DTO+query基础构建的`MPJLambdaWrapper`之上, 进一步构造更复杂的查询。

:::warning
`MPJLambdaWrapperBuilder`中的方法注意append*和无append的区别
:::

更多详见此类[源码](https://github.com/pengxianggui/fast-crud/blob/main/fast-crud-spring-boot-starter/src/main/java/io/github/pengxianggui/crud/join/MPJLambdaWrapperBuilder.java)
