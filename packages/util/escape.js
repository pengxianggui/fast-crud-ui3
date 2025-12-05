import * as util from "./util.js";
import FastTableOption, {Query} from "../model.js";

// 需要转义值的组件
const components = ['fast-checkbox-group', 'fast-select']

/**
 * 根据组件判断将值转义为显示值
 * @param component 组件名
 * @param val 待转义的原始值, 如果是数组，返回的label也是对应的数组
 * @param props 转义依据的配置
 */
export function escapeValToLabel(component, val, props) {
    return new Promise((resolve, reject) => {
        if (components.indexOf(component) === -1) {
            resolve(val);
            return
        }
        const {options, valKey = 'value', labelKey = 'label'} = props
        if (util.isArray(options)) {
            const label = util.escapeLabel(val, options, valKey, labelKey)
            resolve(label)
        } else if (options instanceof FastTableOption) {
            const query = new Query().setDistinct().setCols([valKey, labelKey])
            options._buildSelectOptions(query, valKey, labelKey).then(optionList => {
                const label = util.escapeLabel(val, optionList, valKey, labelKey)
                resolve(label)
            }).catch(err => {
                reject(err)
            })
        }
    })
}
