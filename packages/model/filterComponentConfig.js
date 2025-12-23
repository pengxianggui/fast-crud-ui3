import _ from 'lodash-es'
import {isString, isUndefined} from "../util/util.js"
import {escapeValToLabel} from "../util/escape.js"
import Cond from './cond.js'
import Opt from './opt.js'

/**
 * 筛选组件配置
 * @typedef {typeof Opt[keyof typeof Opt]} OptValue
 */
class FilterComponentConfig {
    component; // 渲染组件
    col; // 字段名
    opt; // 操作符
    val; // 值
    label; // 显示中文名
    props; // 组件对应的props
    defaultVal; // 默认值
    disabled; // 是否禁用: 表示该筛选项是否可用
    type; // quick, easy, dynamic
    condMapFn = (cond) => [cond];
    index = 99; // 排序
    condMsg = ''; // 条件文本描述

    /**
     * 构造函数
     * @param component {string} 组件名
     * @param col {string} 字段名
     * @param opt {OptValue} 操作符
     * @param val {any} 值
     * @param label {string} 中文名
     * @param props {Object} 组件对应的props
     * @param condMapFn {Function} 条件获取过滤函数
     * @param type {string} quick|easy|dynamic
     */
    constructor({
                    component,
                    col,
                    opt = Opt.LIKE,
                    val,
                    label,
                    props,
                    condMapFn = (cond) => [cond],
                    type
                }) {
        this.component = component;
        this.col = col;
        this.opt = opt;
        this.label = label;
        this.condMsg = `${label} ${opt}`
        const {disabled, ...validProps} = props; // 移除props中的disabled属性,disabled属性对查询时无效
        this.props = validProps;
        if (!isUndefined(condMapFn)) {
            this.condMapFn = condMapFn;
        }
        const finalVal = isString(val) ? _.trim(val) : val
        this.defaultVal = finalVal;
        this.disabled = false;
        this.type = type;
        this.val = finalVal;
    }

    /**
     * 值为默认值
     */
    isDefaultVal() {
        return this.val === this.defaultVal
    }

    /**
     * 此筛选项是否有效
     * @returns {boolean}
     */
    isEffective() {
        if (this.opt === Opt.NULL || this.opt === Opt.NNULL || this.opt === Opt.EMPTY || this.opt === Opt.NEMPTY) {
            return true;
        }
        return this.val !== null && this.val !== undefined && this.val !== '' && this.val.length !== 0;
    }

    /**
     * 返回值是否变更
     * @return {boolean}
     */
    reset() {
        const valChanged = (this.val !== this.defaultVal)
        this.val = this.defaultVal
        return valChanged
    }

    getConds() {
        if (this.opt === Opt.NULL || this.opt === Opt.NNULL || this.opt === Opt.EMPTY || this.opt === Opt.NEMPTY) {
            return [new Cond(this.col, this.opt, null)]
        }
        if (isString(this.val)) {
            this.val = _.trim(this.val)
        }
        return this.condMapFn(new Cond(this.col, this.opt, this.val));
    }

    /**
     * 更新条件的文本描述, 例如用于回显在dynamic-filter-list上
     */
    updateCondMsg() {
        return new Promise((resolve, reject) => {
            const component = this.component
            const label = this.label
            const props = this.props
            if (!this.isEffective()) {
                this.disabled = true
                this.condMsg = `[${label}]无有效值`
                resolve()
                return
            }
            const conds = this.getConds();
            const allPromises = []
            for (let i = 0; i < conds.length; i++) {
                let {opt, val} = conds[i];
                const promise = new Promise((resolve, reject) => {
                    let text
                    escapeValToLabel(component, val, props).then(showVal => {
                        switch (opt) {
                            case Opt.EQ:
                            case Opt.NE:
                            case Opt.GT:
                            case Opt.GE:
                            case Opt.LT:
                            case Opt.LE:
                                text = `${label} ${opt} ${showVal}`;
                                break;
                            case Opt.LIKE:
                                text = `${label} 包含'${showVal}'`;
                                break;
                            case Opt.LLIKE:
                                text = `${label}以'${showVal}'结尾`
                                break;
                            case Opt.RLIKE:
                                text = `${label}以'${showVal}'打头`
                                break;
                            case Opt.NLIKE:
                                text = `${label} 不包含'${showVal}'`;
                                break;
                            case Opt.IN:
                                text = `${label} 包含 ${showVal}`;
                                break;
                            case Opt.NIN:
                                text = `${label} 不包含 ${showVal}`;
                                break;
                            case Opt.NULL:
                                text = `${label} 为null`;
                                break;
                            case Opt.NNULL:
                                text = `${label} 不为null`;
                                break;
                            case Opt.EMPTY:
                                text = `${label} 为空`;
                                break;
                            case Opt.NEMPTY:
                                text = `${label} 不为空`;
                                break;
                            case Opt.BTW:
                                text = `${label} 在${showVal}之间`;
                                break;
                            default:
                                text = `${label}未知的比较符`
                                break
                        }
                        resolve(text)
                    }).catch(err => {
                        console.error(err)
                        resolve(`${label} ${opt} ${val}`)
                    })
                })
                allPromises.push(promise)
            }
            Promise.all(allPromises).then(texts => {
                let condMsg = '';
                for (let i = 0; i < texts.length; i++) {
                    condMsg += texts[i]
                    if (i !== texts.length - 1) {
                        condMsg += " 且 "
                    }
                }
                this.condMsg = condMsg
                resolve()
            })
        })
    }
}

export default FilterComponentConfig
