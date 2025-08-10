# 快速开始

## 集成FastCrud

`FastCrud`由前后端分别构成(前后端分离), 集成也需分别进行。

### 后端集成

`FastCrud`后端部分提供了一个`spring-boot-starter`方便开箱即用:

```xml

<dependency>
    <groupId>io.github.pengxianggui</groupId>
    <artifactId>fast-crud-spring-boot-starter</artifactId>
    <version>${fast-crud.version}</version>
</dependency>
```

添加依赖后，后端部分就算集成好了。

> 此外，`FastCrud`还提供了一个**可选**的依赖，其作用是帮助你生成FastCrud推荐的代码(controller、service、mapper、entity),
> 具体介绍详见[代码生成](/latest/server/code-generate)章节

### 前端集成

`FastCrud`前端部分提供了一个npm组件库`fast-crud-ui`

vue2版本:

```bash
npm install fast-crud-ui
```

vue3版本:

```bash
npm install fast-crud-ui3
```

然后在`main.js`中引入并注册即可:

```js
import {createApp} from 'vue'
import FastCrudUI from 'fast-crud-ui3'
import 'fast-crud-ui3/lib/style.css'
import http from '../request.js'

const app = createApp(App)

// FastCrudUI的注册放在ElementPlus之后
app.use(FastCrudUI, {
    $http: http // http是你的axios实例, FastCrud标准功能涉及Rest请求
})

```

> 以上为vue3, vue2同理

至此前端部分已集成。

## 使用FastCrud

以[`fast-crud-demo`](https://github.com/pengxianggui/fast-crud-demo)
中的[EasyDemo](https://github.com/pengxianggui/fast-crud-demo/blob/main/web-ui/src/example/easy/EasyDemo.vue)
———— 开发"一个学生管理模块"为例。

### 开发后端部分

StudentController.java

```java
@RestController
@RequestMapping("student")
public class StudentController extends BaseController<Student> {

    @Resource
    private StudentService studentService;

    public StudentController(StudentService studentService) {
        super(studentService, Student.class);
    }
}
```

StudentService.java

```java
public interface StudentService extends BaseService<Student> {
}
```

StudentServiceImpl.java

```java

@Service
public class StudentServiceImpl extends BaseServiceImpl<StudentMapper, Student> implements StudentService {
}
```

StudentMapper.java

```java
public interface StudentMapper extends BaseMapper<Student> {
}
```

:::warning
注意这里的BaseMapper不是mybatisplus提供的，而是`fast-crud-spring-boot-starter`提供的,
你也可以使用[MPJ](https://mybatis-plus-join.github.io/)中的MPJBaseMapper来替代，事实上`fast-crud-spring-boot-starter`
中的BaseMapper也只是继承了MPJ中的`MPJBaseMapper`而已。
:::

考虑篇幅, Student.java
详见[这里](https://github.com/pengxianggui/fast-crud-demo/blob/main/server/src/main/java/io/github/pengxianggui/crud/demo/domain/Student.java)

至此，学生管理模块的后端部分开发完毕。

### 开发前端部分

> 菜单、路由部分略

编写组件student.vue

```vue

<template>
  <fast-table :option="tableOption">
    <fast-table-column-input prop="name" label="姓名"/>
    <fast-table-column-img prop="avatarUrl" label="头像" :width="100"/>
    <fast-table-column-img prop="gallery" label="相册" :multiple="true" :limit="2"/>
    <fast-table-column-number prop="age" label="年龄"/>
    <fast-table-column-select prop="sex" label="性别"
                              :options="[{label: '男', value: '1'}, {label: '女', value: '0'}]"/>
    <fast-table-column-date-picker prop="createTime" label="创建时间" type="datetime" :editable="false"/>
  </fast-table>
</template>

<script>
  import {FastTableOption} from "fast-crud-ui3";

  export default {
    name: "student",
    data() {
      return {
        tableOption: new FastTableOption({
          module: 'student',
        })
      }
    }
  }
</script>
```

至此，前端部分开发完毕。运行后、前端, 并查看页面:

![img.png](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_1.png)

Nice！你完成了学生管理系统模块的开发，页面中可见的所有功能均已内置实现！实际业务中，接下来你要做的可能是开发一些功能按钮，以便实现特定业务逻辑。
那你需要详细看下"组件介绍"章节。

**不过在那之前，我们先看下已实现的学生管理模块，有那些标准功能? 以及标准功能的使用方式。查看"标准功能介绍"**
