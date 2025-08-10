# FatRow

`FastTable`与`ElTable`最大的不同在于前者还支持表格行内新增和编辑，这意味着每行的数据结构和`ElTable`会有所不同。

`ElTable`的每行数据就是row, 一个row的结构如下:

```json
{
  "id": 1,
  "name": "张三",
  "createTime": "2025-08-01 08:00:00"
}
```

而`FastTable`的row并非这样的结构，它是一个fatRow, 其结构如下:

```json
{
  "row": row,
  "editRow": row,
  "config": Object,
  "status": "normal"
}
```

其中`row`和`editRow`的结构和`ElTable`中的`row`结构一致——即业务数据，也即分页接口返回的业务数据。

额外多出来的`status`代表当前表格的状态, 详见[FastTable状态](/latest/comp/fast-table#status)。

而`config`结构比较复杂，描述了每个列激活编辑时渲染的控件描述，多数情况下，开发者无需关注和使用此值，详细内容可查看源码，这里不进行阐述。
