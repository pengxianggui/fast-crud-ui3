import {
    addStartWith,
    easyOptParse,
    isUndefined,
    merge,
    ternary
} from "../../util/util";
import {Opt} from "../../model"

const defaultQueryConfig = {
    component: 'el-input',
    opt: Opt.LIKE,
    val: null, // 默认值
    props: {
        clearable: true
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
    component: 'fast-upload',
    val: null,
    props: {
        action: '/',
        listType: 'picture-card',
        accept: 'image/*',
        class: 'fc-table-inline-edit-component',
        multiple: false, // 默认单选文件
        editable: true
    }
}
export default {
    query: (config, type) => {
        let val = defaultQueryConfig.val;
        const {defaultVal, ...validProps} = config.props;
        if (type === 'quick') {
            val = ternary(isUndefined(defaultVal), val, defaultVal);
        }
        config.val = val;
        config.props = validProps;
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type, tableOption) => {
        const {label, props} = config;
        const {defaultVal, rules = [], ...validProps} = props;
        if (validProps.hasOwnProperty('required') && validProps.required !== false) {
            rules.push({required: true, message: `${label}不能为空`})
        }
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal)
        config.props = {
            ...validProps,
            rules: rules
        }
        const finalConfig = merge(config, defaultEditConfig, true, false);
        finalConfig.props.action = addStartWith(tableOption.uploadUrl, '/');
        finalConfig.props.listType = 'picture-card'; // 固定避免被自定义覆盖
        return finalConfig;
    }
}
