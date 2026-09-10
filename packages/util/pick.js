import {h, defineComponent, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {FastTableOption} from "../index";
import {defaultIfEmpty, isEmpty, isFunction} from "./util";
import {openDialog} from "./dialog";
import FastTable from '../components/table'
import {t} from '../i18n/index.js'

/**
 * pick方法的按钮配置
 * @typedef {Object} PickButton
 * @property {string} text 按钮文案
 * @property {string} [type] 按钮类型, 同el-button的type
 * @property {string} [size] 按钮尺寸, 同el-button的size
 * @property {(instance: any) => any} [onClick] 按钮点击回调, 返回Promise才会关闭弹窗并resolve
 */

/**
 * pick方法的dialog配置, 除buttons外均为el-dialog的props
 * @typedef {Object} PickDialogProps
 * @property {string} [width] 弹窗宽度
 * @property {PickButton[]} [buttons] 自定义按钮, 不配置则使用内置的确定/取消
 */

/**
 * pick方法参数
 * @typedef {Object} PickParams
 * @property {FastTableOption} option FastTableOption实例
 * @property {boolean} [multiple] 是否多选, 默认false
 * @property {PickDialogProps} [dialog] 弹窗配置, 默认{width: '70%'}
 */

/**
 * pick弹窗选择表格数据
 * @param {PickParams} params pick参数
 * @returns {Promise<any>} 返回Promise, then中为选中的数据(多选时为数组), catch表示用户取消
 */
export function pick(params) {
    const {option, multiple = false, dialog = {width: '70%'}} = params
    const _this = this
    if (isEmpty(option)) {
        throw new Error("option 不能为空!");
    }
    if (!(option instanceof FastTableOption)) {
        throw new Error("option 必须是 FastTableOption实例");
    }

    option.insertable = false
    option.updatable = false
    option.deletable = false
    option.enableMulti = (multiple === true)
    option.enableFilterCache = false
    const title = option.title
    option.showTitle = false

    const DynamicFastTable = defineComponent({
        name: 'DynamicFastTable',
        data() {
            return {
                option: option
            }
        },
        methods: {
            getTableRef() {
                return this.$refs.table
            }
        },
        render() {
            const slotContent = isFunction(option.render) ? option.render.call(_this) : []
            return h(FastTable, {
                    ref: 'table',
                    option: this.option,
                    height: '460px'
                },
                {
                    default: () => slotContent
                }
            )
        }
    });

    const buttons = defaultIfEmpty(dialog.buttons, [
            {
                text: '确定',
                type: 'primary',
                size: option.style.size,
                onClick: (instance) => {
                    const tableRef = instance.getTableRef();
                    const data = multiple ? tableRef.getCheckedRows() : tableRef.getChoseRow();
                    if (isEmpty(data)) {
                        ElMessage.warning(t('crud.operation.pleaseSelectData'));
                        return; // 返回非Promise则不会关闭对话框
                    }
                    return Promise.resolve(data);
                }
            },
            {
                text: '取消',
                size: option.style.size,
                onClick: (instance) => {
                    return Promise.reject();
                }
            }
        ]
    );

    return openDialog.call(this, {
        component: DynamicFastTable,
        props: {},
        dialogProps: {
            ...dialog,
            title: title,
            buttons: buttons
        }
    })
}
