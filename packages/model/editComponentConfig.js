import {isEmpty, isFunction, isNull, isUndefined} from "../util/util.js";
import FastTableOption from "./fastTableOption.js";
import Opt from './opt.js'

/**
 * 编辑组件配置
 */
class EditComponentConfig {
    component;
    col;
    label;
    props;
    val;
    editable; // 是否可编辑, true 表示可编辑, false表示不可编辑, insert-表示新增时可编辑, update-表示更新时可编辑. 默认为true.
    type; // inline, form
    eventMethods; // 组件事件触发时调用其中的方法，例如参数验证

    constructor({component, col, label, props, val, eventMethods, type, unique, tableOption}) {
        this.component = component;
        this.col = col;
        this.label = label;
        const {editable, ...validProps} = props; // 移除props中的editable属性,避免editable对组件影响
        this.props = validProps;
        this.val = val;
        this.editable = editable;
        this.eventMethods = eventMethods;
        this.type = type;
        // 将unique转换为 props.rules一部分
        if (unique !== false && (tableOption instanceof FastTableOption)) {
            const pkField = tableOption.idField
            const uniqueValidator = async (rule, value, callback, source, options) => {
                if (isNull(value) || isUndefined(value)) {
                    return Promise.resolve()
                }

                const {getRow} = rule
                if (!isFunction(getRow)) {
                    // 无法获取当前行
                    console.error('无法进行唯一性校验:无法获取当前记录完整数据')
                    return Promise.resolve()
                }
                const currentRow = getRow()
                const pkVal = currentRow[pkField]
                if (type === 'inline') {
                    if (isEmpty(tableOption.ref?.editRows)) {
                        return Promise.resolve()
                    }
                    const editRows = tableOption.ref.editRows.map(fatRow => fatRow.editRow)
                    const duplicates = editRows.filter(row => row[rule.field] === value && row[pkField] !== pkVal)
                    if (duplicates.length > 0) {
                        return Promise.reject(`【${label}】${value}已存在于其它编辑行`)
                    }
                }

                // 后端唯一性校验
                const result = await tableOption._exist([
                    {col: pkField, opt: Opt.NE, val: pkVal}, // 避免自身编辑时误报
                    {col: col, opt: Opt.EQ, val: value}
                ])
                if (result) { // 表示存在
                    return Promise.reject(`【${label}】${value}已存在`)
                }
                return Promise.resolve()
            }
            props?.rules.push({
                validator: uniqueValidator, trigger: 'blur'
            })
        }
    }
}

export default EditComponentConfig
