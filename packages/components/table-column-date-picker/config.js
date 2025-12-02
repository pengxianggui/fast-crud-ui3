import {isUndefined, merge, ternary} from "../../util/util";
import {Cond, Opt} from "../../model";

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const defaultQueryConfig = {
    component: 'el-date-picker',
    opt: Opt.BTW,
    val: [], // 默认值
    props: {
        type: `daterange`,
        clearable: true,
        valueFormat: DEFAULT_DATE_FORMAT,
        // (易用性提升)
        shortcuts: [{
            text: '最近1h',
            value: () => {
                const end = new Date()
                const start = new Date(end)
                start.setTime(start.getTime() - 3600 * 1000)
                return [start, end]
            }
        }, {
            text: '最近1天',
            value: () => {
                const end = new Date()
                const start = new Date(end)
                start.setTime(start.getTime() - 3600 * 1000 * 24)
                return [start, end]
            }
        }, {
            text: '最近1周',
            value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                return [start, end]
            }
        }, {
            text: '最近1月',
            value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                return [start, end]
            }
        }, {
            text: '最近3月',
            value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                return [start, end]
            }
        }, {
            text: '最近1年',
            value: () => {
                const end = new Date()
                const start = new Date(end)
                start.setFullYear(end.getFullYear() - 1)
                return [start, end]
            }
        }]
    },
    condMapFn: (cond) => {
        const conds = []
        const [start, end] = cond.val
        if (start) {
            conds.push(new Cond(cond.col, Opt.GE, start))
        }
        if (end) {
            conds.push(new Cond(cond.col, Opt.LE, end))
        }
        return conds
    }

}
const defaultEditConfig = {
    component: 'el-date-picker',
    opt: Opt.BTW,
    val: null, // 默认值
    props: {
        type: "date",
        clearable: true,
        valueFormat: DEFAULT_DATE_FORMAT,
        class: 'fc-table-inline-edit-component',
        editable: true,
        rules: []
    }
}

export default {
    query: (config, type) => {
        let val = defaultQueryConfig.val;
        const {props: {defaultVal, ...validProps} = {}} = config
        const {type: dateType = 'date'} = validProps;
        if (type === 'quick') {
            val = ternary(isUndefined(defaultVal), val, defaultVal);
        }
        if (type === 'dynamic' || type === 'stored') {
            validProps.teleported = false // 防止动筛二选时popover关闭
        }
        const {valueFormat} = validProps;
        if (config.props.type === 'datetime') {
            if (isUndefined(valueFormat)) {
                validProps.valueFormat = DEFAULT_DATETIME_FORMAT;
            }
            // 限定时分秒的默认区间值(易用性提升)
            validProps.defaultTime = [
                new Date(0, 0, 0, 0, 0 ,0, 0),
                new Date(0, 0, 0, 23, 59, 59, 999)]
        }
        config.val = val;
        config.props = {
            ...validProps,
            type: `${dateType}range`
        }
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {label, props: {defaultVal, ...validProps} = {}} = config;
        const {rules = []} = validProps;
        // 如果含有值不为false的required属性, 则将其转换为rules规则添加到props中
        if (validProps.hasOwnProperty('required') && validProps.required !== false) {
            rules.push({required: true, message: `${label}不能为空`})
        }
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal);
        const {valueFormat} = validProps;
        if (config.props.type === 'datetime' && isUndefined(valueFormat)) {
            validProps.valueFormat = DEFAULT_DATETIME_FORMAT;
        }
        config.props = {
            ...validProps,
            rules: rules
        }
        return merge(config, defaultEditConfig, true, false)
    }
}
