import {colEditable} from "../components/table/src/util"
import FastTableHeadCell from "../components/table/src/table-head-cell.vue"
import FastContentDialog from "../components/content-dialog/src/fast-content-dialog.vue";

export default {
    inject: ['openDynamicFilterForm', 'tableStyle', 'context'],
    emits: ['change', 'focus', 'blur', 'input', 'clear'],
    components: {FastTableHeadCell, FastContentDialog},
    props: {
        prop: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        filter: {
            type: [Boolean, Number],
            default: () => true
        },
        quickFilter: {
            type: [Boolean, Number],
            default: () => false
        },
        // deprecated: 1.6.0
        firstFilter: {
            type: Boolean,
            default: () => false
        },
        showOverflowTooltip: {
            type: Boolean,
            default: () => false
        },
        quickFilterBlock: {
            type: Boolean,
            default: () => false
        },
        /**
         * 显示的字符长度, 超长时会显示"...", 并支持弹窗预览完整信息
         */
        showLength: {
            type: Number,
            default: () => Number.MAX_VALUE
        }
    },
    data() {
        return {
            columnProp: {
                ...this.$attrs,
                prop: this.prop,
                label: this.label,
                filter: this.filter,
                order: '' // '', 'asc', 'desc'
            }
        }
    },
    methods: {
        /**
         * 是否展示编辑模式
         * @param fatRow
         * @param column element原生列配置
         * @param $index 当前行索引
         * @returns {boolean}
         */
        canEdit(fatRow, column, $index) {
            return colEditable.call(this.context !== null && this.context !== undefined ? this.context : this, fatRow, column.property);
        },
        showLabel(fatRow) {
            const {row, editRow, status} = fatRow;
            return status === 'normal' ? row[this.prop] : editRow[this.prop];
        },
        headCellClick(column) {
            if (this.filter !== false) {
                this.openDynamicFilterForm(this.columnProp)
            }
        },
        // change事件上抛并触发验证
        handleChange(val, scope) {
            this.$emit('change', val, scope);
            const {column, $index, row: {config}} = scope;
            const {property} = column;
            const ref = this.$refs[property + $index];
            const {eventMethods: {valid} = {}, props} = config[property]
            if (valid) {
                valid(val, ref, props);
            }
        },
        handleFocus(event, scope) {
            this.$emit('focus', event, scope)
        },
        handleBlur(event, scope) {
            this.$emit('blur', event, scope)
        },
        handleInput(val, scope) {
            this.$emit('input', val, scope);
        },
        handleClear(scope) {
            this.$emit('clear', scope);
        }
    }
}
