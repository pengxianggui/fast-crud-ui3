import {easyOptParse, isArray, isSampleType, isUndefined, merge, ternary} from "../../util/util";
import {Cond, Opt} from "../../model";

const defaultQueryConfig = {
    component: 'fast-object-picker',
    opt: Opt.EQ,
    val: null, // 默认值
    props: {
        clearable: true,
        placeholder: '请点选..',
        options: [] // 用以控件回显(val和label不一致时)
    },
    condMapFn: (cond) => {
        if (isArray(cond.val) && cond.val.length > 0) {
            return [new Cond(cond.col, Opt.IN, cond.val)]
        }
        if (isSampleType(cond.val)) {
            return [new Cond(cond.col, Opt.EQ, cond.val)]
        }
        return []
    }
}
const defaultEditConfig = {
    component: 'fast-object-picker',
    val: null,
    props: {
        class: 'fc-table-inline-edit-component',
        clearable: true,
        multiple: false, // 默认单选
        title: '请点选...',
        editable: true,
        options: [] // 用以控件回显(val和label不一致时)
    }
}
export default {
    query: (config, type) => {
        let val = defaultQueryConfig.val;
        const {defaultVal, ...validProps} = config.props;
        if (type === 'quick') {
            val = (isUndefined(defaultVal), val, defaultVal);
        } else {
            config.component = 'el-input' // 除了快筛，其它(简筛、动筛、存筛)里输入控件都采用输入框，提升体验
        }
        config.val = val;
        config.props = validProps;
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {label, props} = config;
        const {defaultVal, rules = [], ...validProps} = props;
        // 如果含有值不为false的required属性, 则将其转换为rules规则添加到props中
        if (validProps.hasOwnProperty('required') && validProps.required !== false) {
            rules.push({required: true, message: `${label}不能为空`})
        }
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal);
        config.props = {
            ...validProps,
            rules: rules
        };
        return merge(config, defaultEditConfig, true, false)
    }
}
