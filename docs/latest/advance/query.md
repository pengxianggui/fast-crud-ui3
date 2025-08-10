# Query/PageQuery

FastCrud灵活强大的查询能力得益于灵活的查询参数，为此FastCrud定义了查询参数的结构。

> 你几乎不需要构造Query或PageQuery, 此章节仅帮助理解查询的原理所在。

## Query

查看Query的定义:

```js
export class Query {
    cols = []; // 查询出的字段
    conds = []; // 条件, 结构参考Cond章节
    distinct = false; // 是否distinct去重
    orders = []; // 排序
    extra = {}; // 扩展字段

    constructor() {
    }
}
```

## PageQuery

PageQuery在Query基础上增加了两个分页相关的属性

```js
export class PageQuery {
    cols = []; // 查询出的字段
    conds = []; // 条件, 结构参考Cond章节
    distinct = false; // 是否distinct去重
    orders = []; // 排序
    extra = {}; // 扩展字段
    current = 1;
    size = 20;

    constructor() {
    }
}
```

:::tip

- `FastTable`分页查询即构造`PageQuery`对象作为参数请求分页接口;
- `FastTable`中动筛的distinct就是通过构造`Query`对象作为参数请求列表接口;
  :::
