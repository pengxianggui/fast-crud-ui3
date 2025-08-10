# Cond

FastCrud针对查询条件参数提供了一个自定义类: `Cond`。

```js
import {Cond} from 'fast-crud-ui3'
```

它代表了一个where条件，例如:

```js
import {Cond, Opt} from 'fast-crud-ui3'

// eg1: name = '张三'
new Cond('name', Opt.EQ, '张三')
// eg2: name like '%张%'
new Cond('name', Opt.LIKE, '张')
// eg3: age > 23
new Cond('age', Opt.GT, 23)
// eg4: sex in ('1', '0')
new Cond('sex', Opt.IN, ['1', '0'])
// eg5: name is null
new Cond('name', Opt.NULL) // 第三个值任意
```

## Opt
Opt取值如下:
```js
Opt.EQ; // 等于
Opt.NE; // 不等于
Opt.GT; // 大于
Opt.GE; // 大于等于
Opt.LT; // 小于
Opt.LE; // 小于等于
Opt.IN; // in
Opt.NIN; // not in
Opt.LIKE; // like
Opt.NLIKE; // not like
Opt.NULL; // is null
Opt.NNULL; // is not null
Opt.EMPTY; // (is null or 空串)
Opt.NEMPTY; // (is not null and 非空串)
```
