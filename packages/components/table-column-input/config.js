import {easyOptParse, isUndefined, merge, ternary} from "../../util/util";
import {Opt} from "../../model";

const defaultQueryConfig = {
    component: 'el-input',
    opt: Opt.LIKE,
    val: null, // 默认值
    props: {
        clearable: true,
        placeholder: '请输入..'
    },
    condMapFn: (cond) => {
        const operators = {
            '^!=': {
                opt: Opt.NE,
                valExtract: (cond) => cond.val.substring(2)
            },
            '^=': {
                opt: Opt.EQ,
                valExtract: (cond) => cond.val.substring(1)
            },
            '^~': {
                opt: Opt.NLIKE,
                valExtract: (cond) => cond.val.substring(1)
            },
            '^\\*': {
                opt: Opt.LLIKE,
                valExtract: (cond) => cond.val.substring(1)
            },
            '\\*$': {
                opt: Opt.RLIKE,
                valExtract: (cond) => cond.val.substring(0, cond.val.length - 1)
            }
        }
        easyOptParse(cond, operators)
        return [cond]
    }
}

const defaultEditConfig = {
    component: 'el-input',
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
        let val = defaultQueryConfig.val;
        const {props: {defaultVal, ...validProps} = {}} = config
        if (type === 'quick') {
            val = ternary(isUndefined(defaultVal), val, defaultVal);
        }
        config.val = val;
        config.props = validProps;
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {label, props = {}} = config;
        const {defaultVal, rules = [], ...validProps} = props;
        // 如果含有值不为false的required属性, 则将其转换为rules规则添加到props中
        if (validProps.hasOwnProperty('required') && validProps.required !== false) {
            rules.push({required: true, message: `${label}不能为空`})
        }
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal);
        config.props = {
            ...validProps,
            rules: rules
        }
        return merge(config, defaultEditConfig, true, false)
    }

}
