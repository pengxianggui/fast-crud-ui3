import {isArray, isSampleType, isUndefined, merge, ternary} from "../../util/util";
import Cond from '../../model/cond.js'
import Opt from '../../model/opt.js'

const defaultQueryConfig = {
    component: 'fast-select',
    opt: Opt.IN,
    val: [], // 默认值
    props: {
        clearable: true,
        filterable: true,
        multiple: true,
        placeholder: '请选择..'
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
    component: 'fast-select',
    val: null,
    props: {
        clearable: true,
        class: 'fc-table-inline-edit-component',
        editable: true,
        rules: []
    }
}
export default {
    query: (config, type) => {
        const {props: {defaultVal, ...validProps} = {}} = config
        let val = []
        let component = 'fast-select';

        if (type === 'quick') {
            val = ternary(isUndefined(defaultVal), defaultQueryConfig.val, defaultVal);
            if (validProps.quickFilterCheckbox !== false) {
                component = 'fast-checkbox-group';
            }
        }
        config.val = val;
        config.component = component;
        config.props = validProps;
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {label, props = {}} = config;
        const {defaultVal, rules = [], ...validProps} = props
        // 如果含有值不为false的required属性, 则将其转换为rules规则添加到props中
        if (validProps.hasOwnProperty('required') && validProps.required !== false) {
            rules.push({required: true, message: `${label}不能为空`})
        }
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal)
        config.props = {
            ...validProps,
            rules: rules
        }
        return merge(config, defaultEditConfig, true, false)
    }
}
