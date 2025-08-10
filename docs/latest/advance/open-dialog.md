# openDialog

`openDialog`方法是FastCrud提供的一个纯js的弹窗API。

## 为什么要提供这个方法?

我们在使用`el-dialog`时，通常要在template里写`<el-dialog>`这样的代码, 有时这个弹窗逻辑可能只是一个局部方法里的，不希望弹窗相关的代码
蔓延的组件全局去。请看这个例子:

```vue

<template>
  <div>
    <el-button @click="check">核查</el-button>
    ...
    <el-dialog v-model="dialogVisible" title="信息核查" width="80%">
      <CheckPannel :propA="1" :propB="true" ...></CheckPannel>
      <template #footer>
        <el-button @click="checkOk">确认</el-button>
        <el-button @click="checkCancel">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
  import {ref} from "vue"
  import {CheckPannel} from '...'

  const dialogVisible = ref(false)

  const check = () => {
    dialogVisible.value = true
  }
  const checkOk = () => {
    // 确认逻辑
  }
  const checkCancel = () => {
    dialogVisible.value = false
    // 取消逻辑
  }
</script>
```

上面这个简单的例子中, `dialogVisible`以及`<el-dialog ..>`标签其实都是`check`里的逻辑, 它们应该内聚在`check`
里才对, 但是为了定义弹窗, 我们不得不在template里写`<el-dailog ...>`标签, 然后为了控制弹窗显隐,
不得不在组件全局定义`dialogVisible`变量。 **而事实上它们不应该污染组件全局**。

FastCrud提供的`openDialog`方法可以让你直接以js驱动一个弹窗, 不需要定义`el-dialog`和`visible`
。上面这个例子使用FastCrud提供的`openDialog`改造后如下:

```vue

<template>
  <div>
    <el-button @click="check">核查</el-button>
    ...
  </div>
</template>
<script setup>
  import {openDialog} from 'fast-crud-ui3'
  import {CheckPannel} from '...'

  const check = () => {
    openDialog({
      component: CheckPannel,
      props: {
        propA: 1,
        propB: true
      },
      dialogProps: {
        title: '信息核查',
        width: '80%'
      }
    }).then(() => {
      // 确认逻辑, 这里无需再控制弹窗显隐
    }).catch(() => {
      // 取消逻辑, 这里无需再控制弹窗显隐
    })
  }
</script>
```

在上面这个例子中, 弹窗的逻辑都内聚在`check`内, 非常Nice！

**但细心的朋友可能会发现: `then`和`catch`是怎么定义的呢?上面并没有定义dialog中的"确认"和"取消"按钮!**

是的, FastCrud提供的这个`openDialog`方法，支持两种方式定义"确认"和"取消":

1. 在自己的组件`CheckPannel`中定义事件: `ok`和`cancel`, 按钮在`CheckPanel`中自行定义(形式不限, 也不一定就是按钮)。`ok`
   事件被触发后,走`then`, `then`可以有参数, 就是`ok`事件传递的参数, `catch`同理。
2. 在`openDialog`方法里通过参数定义按钮, 具体语法见[下文](#dialogProps)。

## openDialog参数

`openDialog`支持一个对象参数, 这个对象里支持三个配置项, 分别是:

1. component: 要弹出的组件
2. props: 要弹出的组件的prop配置
3. dialogProps: 弹窗自身的prop配置

`component`和`props`非常好理解, 针对`dialogProps`, 下面具体说明下。

### dialogProps {#dialogProps}

除了`el-dialog`自带的props外, 还额外支持两个配置项

| 属性      | 说明                   | 类型              | 默认值    |
|---------|----------------------|-----------------|--------|
| buttons | 定义dialog的#footer里的按钮 | `Array<Object>` | `[]`   |
| okClose | 触发ok事件后,弹窗是否要关闭      | `Boolean`       | `true` |

`okClose`很好理解, 有时ok事件触发后我们也不希望弹窗关闭, 而是希望用户主动去关弹窗, 就可以设置为false。

#### buttons

直接看例子:

```js
import {CircleCheckFilled} from '@element-plus/icons-vue'

openDialog({
    component: CheckPannel,
    props: {
        propA: 1,
        propB: true
    },
    dialogProps: {
        title: '信息核查',
        width: '80%',
        buttons: [
            {
                text: '确定',
                type: 'primary',
                size: 'default',
                icon: CircleCheckFilled,
                onClick: (component) => { // component就是传入的CheckPannel组件
                    // 这里可以利用component做更多事, 例如校验和获取数据并上抛—— 需要在CheckPannel里自行定义validate和getModel方法
                    if (!component.validate()) { // 校验
                        ElMessage.warning('校验不通过!')
                        return // 返回非Promise不会关闭弹窗
                    }
                    return Promise.resolve(component.getModel()) // 走then逻辑, 利用component获取数据并上抛
                }
            },
            {
                text: '取消',
                onClick: (component) => {
                    return Promise.reject() // 走catch逻辑
                }
            }
        ]
    }
}).then(model => {
    // 确认逻辑
}).catch(() => {
    // 取消逻辑
})
```

如此, 弹窗实现就更内聚而合理, 你可以轻松的弹任何一个已有的component组件。

:::tip
但如此也有一个显而易见的弊端, 就是弹出的内容必须独立到一个组件里。但换个方式理解，这恰恰有助于组件的合理抽取。
:::
