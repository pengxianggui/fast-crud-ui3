import {easyOptParse, isUndefined, merge, ternary} from "../../util/util";
import {Opt} from "../../model";

const defaultQueryConfig = {
    component: 'el-input',
    opt: Opt.LIKE,
    val: null, // 默认值
    props: {
        clearable: true,
        placeholder: '请输入...'
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
        class: 'fc-table-inline-edit-component',
        editable: false // fast-table-column不允许编辑
    }
}
export default {
    query: (config, type) => {
        let val = defaultQueryConfig.val;
        const {defaultVal, ...validProps} = config.props;
        if (type === 'quick') {
            val = (isUndefined(defaultVal), val, defaultVal);
        }
        config.val = val;
        config.props = validProps;
        return merge(config, defaultQueryConfig, true, false)
    },
    edit: (config, type) => {
        const {defaultVal, ...validProps} = config.props;
        config.val = ternary(isUndefined(defaultVal), defaultEditConfig.val, defaultVal);
        config.props = validProps;
        return merge(config, defaultEditConfig, true, false)
    }
}
