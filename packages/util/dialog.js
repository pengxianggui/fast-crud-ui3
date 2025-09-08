import {h, defineComponent, reactive, createVNode, render} from 'vue'
import {ElDialog, ElButton} from 'element-plus'
import {getAppContext} from "../index.js"

/**
 * 动态打开弹窗
 * @param component 弹窗中的组件，可通过emit('ok', data)触发后续then, 或者 通过emit('cancel')取消弹窗触发catch
 * @param props 传递给component的props
 * @param dialogProps 传递给dialog的props, 其中还支持自定义的buttons数组，描述dialog按钮
 * @example
 * openDialog({
 *  component: YourComponent,
 *  props: {
 *      model: {...}
 *  },
 *  dialogProps: {
 *      width: '50%',
 *      // dialog支持的props...
 *      ...
 *      // 自定义的配置
 *      okClose: true, // 弹出组件如果emit ok后是否关闭dialog, 默认关闭
 *      buttons: [
 *          {
 *              text: '确定',
 *              type: 'primary',
 *              onClick: (component) => { // component是你传入的YourComponent组件实例
 *                  if (!component.validate()) { // YourComponent里提供的校验方法
 *                      ElMessage.warning('校验不通过!')
 *                      return // 返回非Promise则不会关闭对话框
 *                  }
 *                  return Promise.resolve(component.getModel()) // YourComponent提供的getModel获取表单数据, 走resolve逻辑
 *              }
 *          },
 *          {
 *              text: '取消',
 *              onClick: (component) => {
 *                  return Promise.reject() // 走catch逻辑
 *              }
 *          }
 *          // 其它自定义按钮
 *      ]
 *  }
 * })
 * @returns {Promise<unknown>}
 */
export function openDialog({component, props = {}, dialogProps = {}}) {
    // TODO 即使okClose设置为false, 第二次及之后触发ok事件并执行resolve后，外部仍然无法第二次走then逻辑, 因为promise已经成为终态了。
    //  若未来这个问题必须解决，一个可行的方案是：由promise改成传入回调函数: handleOk和handleCancel
    const {buttons = [], okClose = true, ...validDialogProps} = dialogProps

    return new Promise((resolve, reject) => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const state = reactive({visible: true})
        let componentRef = null

        const DialogWrapper = defineComponent({
            setup() {
                const handleClose = (who) => {
                    state.visible = false
                    cleanup()
                    reject(who)
                }

                const handleOk = (data) => {
                    if (okClose === true) {
                        state.visible = false
                        cleanup()
                    }
                    resolve(data)
                }

                const cleanup = () => {
                    render(null, container) // 卸载 vnode
                    container.remove()      // 清理 DOM
                }

                return () => h(ElDialog, {
                    modelValue: state.visible,
                    'update:modelValue': (val) => {
                        state.visible = val
                        if (!val) cleanup()
                    },
                    onClose: () => handleClose('dialog'),
                    ...validDialogProps
                }, {
                    default: () => h(component, {
                        ref: (el) => (componentRef = el),
                        ...props,
                        onOk: (data) => handleOk(data),
                        onCancel: () => handleClose('component')
                    }),
                    footer: () => buttons.map(btn =>
                        h(ElButton, {
                            type: btn.type,
                            icon: btn.icon,
                            size: btn.size,
                            onClick: () => {
                                const returnVal = btn.onClick?.(componentRef)
                                if (!(returnVal instanceof Promise)) return
                                returnVal.then(handleOk).catch(() => handleClose('dialog'))
                            }
                        }, () => btn.text)
                    )
                })
            }
        })

        const vnode = createVNode(DialogWrapper)
        vnode.appContext = getAppContext() // 集成app的上下文，保证<component :is="" /> 可以找到全局注册的组件
        render(vnode, container)
    })
}
