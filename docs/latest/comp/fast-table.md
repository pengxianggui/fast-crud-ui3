# FastTable

**FastTable是FastCrud最核心的组件，没有之一**。之前介绍过，FastCrud是基于表格形式维护的，因此使用`fast-crud`前端组件库，无可避免要使用它。

FastTable提供了丰富的配置、插槽、方法。

## 配置

由于FastTable配置项非常多, 因此没有采用都通过prop进行配置，而是提供一个唯一的prop——`option`
，其类型为FastCrud自定义类`FastTableOption`。

```vue

<template>
  <fast-table :option="tableOption"></fast-table>
</template>
<script>
  import {FastTableOption} from "fast-crud-ui3";

  export default {
    data() {
      return {
        tableOption: new FastTableOption({
          // 在这里提供FastTable支持的丰富配置项
        })
      }
    }
  }
</script>
```

### FastTableOption配置项

| 属性      | 说明               | 类型        | 默认值 |
|---------|------------------|-----------|-----|
| context | 当前组件的引用，一般给值this | Component | -   |
| module  | 模块，也即后端接口的根path  | String    | -   |

