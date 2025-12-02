import {merge, ternary} from "../../util/util";
import {Opt} from "../../model";

const defaultQueryConfig = {
    component: 'fast-select',
    opt: Opt.EQ,
    val: null, // 默认值
    props: {
        clearable: true,
        options: [],
    }
}
const defaultEditConfig = {
    component: 'el-switch',
    val: null,
    props: {
        clearable: true,
        options: [],
        class: 'fc-table-inline-edit-component',
        editable: true,
        inlinePrompt: true,
        activeValue: true,
        inactiveValue: false,
        activeText: '是',
        inactiveText: '否'
    }
}
export default {
    query: (config, type) => {
        const {props: {defaultVal, ...validProps} = {}} = config
        const {activeValue = true, inactiveValue = false, activeText = '是', inactiveText = '否'} = validProps
        let val = defaultQueryConfig.val;
        if (type === 'quick') {
            val = ternary(defaultVal === inactiveValue || defaultVal === activeValue, defaultVal, val);
        }
        const options = [
            {label: inactiveText, value: inactiveValue},
            {label: activeText, value: activeValue}
        ]
        config.val = val;
        config.props = {
            ...validProps,
            options: options
        }
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {props: {defaultVal, ...validProps} = {}} = config
        const {activeValue = true, inactiveValue = false} = validProps
        config.val = ternary(defaultVal === inactiveValue || defaultVal === activeValue, defaultVal, inactiveValue); // 默认值合法校验
        config.props = validProps;
        return merge(config, defaultEditConfig, true, false);
    }

}
