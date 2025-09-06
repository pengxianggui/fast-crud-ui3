import {h, defineComponent, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {FastTableOption} from "../index";
import {defaultIfEmpty, isEmpty, isFunction} from "./util";
import {openDialog} from "./dialog";
import FastTable from '../components/table'

/**
 * pick弹窗选择表格数据
 * @param option FastTableOption实例
 * @param multiple 是否多选
 * @param dialog 弹窗配置
 * @returns {Promise<*>|*}
 */
export function pick({option, multiple = false, dialog = {width: '70%'}}) {
    const _this = this
    if (isEmpty(option)) {
        throw new Error("option 不能为空!");
    }
    if (!(option instanceof FastTableOption)) {
        throw new Error("option 必须是 FastTableOption实例");
    }

    option.insertable = false;
    option.updatable = false;
    option.deletable = false;
    option.enableMulti = (multiple === true);
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
                    option: this.option
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
                        ElMessage.warning('请选择数据');
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
