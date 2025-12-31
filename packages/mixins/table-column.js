import {colEditable} from "../components/table/src/util"
import FastTableHeadCell from "../components/table/src/table-head-cell.vue"
import FastCellContent from "../components/content-dialog/src/fast-cell-content.vue";
import {convertKeyFromCaseToCamel, replaceKey} from "../util/util.js";

export default {
    inject: ['openDynamicFilterForm', 'tableStyle', 'context'],
    emits: ['change', 'focus', 'blur', 'input', 'clear'],
    components: {FastTableHeadCell, FastCellContent},
    props: {
        prop: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        // 值为Boolean且为true时, 则将单元格内容作为链接地址; 值为字符串其非空时，将值作为跳转地址,且以超链接的形式展示单元格内容, 并支持点击, 值支持路由地址、路由名、绝对地址
        link: {
            type: [Boolean, String],
            default: () => false
        },
        // 以实现某一列不显示, 仍然可以参与生成筛选项
        hidden: {
            type: Boolean,
            default: () => false
        },
        // 此列是否支持过滤. 若为false, 则简筛、快筛、动筛都将不支持。此优先级高于quickFilter和dynamicFilter
        filter: {
            type: [Boolean, Number],
            default: () => true
        },
        /**
         * 此列是否支持快筛。若为数字，则表示快筛项目的排序(值越小，优先级越高)
         */
        quickFilter: {
            type: [Boolean, Number],
            default: () => false
        },
        /**
         * 快筛项是否独占一行
         */
        quickFilterBlock: {
            type: Boolean,
            default: () => false,
            dispatch: true // 分发到底层组件里
        },
        /**
         * @type {import('vue').PropType<{
         *  onChange?: (ctx: {val: any, model: Object, filter: import('../model/filterComponentConfig').default, filters: Object, refs: Object}) => void,
         *  onClick?: (ctx: {model: Object, filter: Object, filters: Object, refs: Object}) => void
         * }>}
         */
        quickFilterConfig: {
            type: Object,
            default: () => ({}),
            dispatch: true // 分发到底层组件里
        },
        // 此列是否支持动筛: 若为false, 则列头不可点击
        dynamicFilter: {
            type: Boolean,
            default: () => true
        },
        /**
         * 1.5.12 是否唯一, 若为true, 新增或更新时, 会校验此值的唯一性(前后端均校验)
         */
        unique: {
            type: Boolean,
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
        /**
         * 显示的字符长度, 超长时会显示"...", 并支持弹窗预览完整信息
         */
        showLength: {
            type: Number,
            default: () => Number.MAX_VALUE
        }
    },
    data() {
        let attrs = convertKeyFromCaseToCamel(this.$attrs, '-');
        attrs = replaceKey(attrs, '_q')
        attrs = replaceKey(attrs, '_e')
        return {
            columnProp: {
                ...attrs,
                prop: this.prop,
                label: this.label,
                filter: this.filter,
                dynamicFilter: this.dynamicFilter,
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
            if (this.filter !== false && this.dynamicFilter !== false) {
                this.openDynamicFilterForm(this.columnProp)
            }
        },
        // change事件上抛并触发验证
        handleChange(val, scope) {
            this.$emit('change', val, scope);
            const {column, $index, row: {editRow, config}} = scope;
            const {property} = column;
            const ref = this.$refs[property + $index];
            const {eventMethods: {valid} = {}, props} = config[property]
            if (valid) {
                valid(val, editRow, ref, props);
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
