import {assert, defaultIfBlank, isEmpty, isObject, isString} from "../util/util.js";
import Opt from "./opt.js";

class Cond {
    col;
    opt;
    val;

    constructor(col, opt, val) {
        assert(isString(col) && !isEmpty(col), 'col必须为有效字符串')
        assert(Object.values(Opt).indexOf(opt) > -1, `opt无效:${opt}`)
        this.col = col;
        this.opt = opt;
        this.val = val;
    }

    setOpt(opt) {
        this.opt = opt;
        return this;
    }

    setVal(val) {
        this.val = val;
        return this;
    }

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
