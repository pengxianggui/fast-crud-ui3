import {assert, defaultIfBlank, isEmpty, isObject, isString} from "../util/util.js";
import Opt from "./opt.js";

/**
 * @typedef {typeof Opt[keyof typeof Opt]} OptValue
 */
class Cond {
    /**
     * 字段名
     * @type {string}
     */
    col;
    /**
     * 操作符
     * @type {OptValue}
     */
    opt;
    /**
     * 值
     * @type {object}
     */
    val;

    /**
     * 构造函数
     * @param col 字段
     * @param opt {OptValue} 操作符,可以使用常量
     * @param val 值
     */
    constructor(col, opt, val) {
        assert(isString(col) && !isEmpty(col), 'col必须为有效字符串')
        assert(Object.values(Opt).indexOf(opt) > -1, `opt无效:${opt}`)
        this.col = col;
        this.opt = opt;
        this.val = val;
    }

    /**
     * 设置操作符
     * @param opt {string}
     * @return {Cond}
     */
    setOpt(opt) {
        this.opt = opt;
        return this;
    }

    /**
     * 设置值
     * @param val {object}
     * @return {Cond}
     */
    setVal(val) {
        this.val = val;
        return this;
    }

    /**
     * 通过json构建一个Cond条件对象
     * @param condJson {object} 条件的json
     * @return {Cond}
     */
    static build(condJson) {
        if (condJson instanceof Cond) {
            return condJson;
        }
        assert(isObject(condJson), 'cond不是json格式!')
        const {col, opt = Opt.EQ, val} = condJson
        assert(!isEmpty(col), 'cond格式不正确: 无col属性或其值为空!')
        return new Cond(col, defaultIfBlank(opt, Opt.EQ), val);
    }
}

export default Cond
