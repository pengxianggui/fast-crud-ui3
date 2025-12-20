import {caseToCamel, isBoolean, isEmpty} from "../util/util.js"
import Cond from './cond.js'
import Order from './order.js'

class Query {
    cols = [];
    conds = [];
    distinct = false;
    orders = [];
    extra = {}; // 扩展字段

    constructor() {
    }

    setCols(cols) {
        this.cols = cols;
        return this;
    }

    /**
     * @param cond
     * @param repeatable 是否允许重复的col, 默认true, 即若多次添加相同col的条件, 只会保留最新的
     * @return {Query}
     */
    addCond(cond, repeatable = true) {
        if (repeatable === false) {
            this.removeCond(c.col)
        }
        this.conds.push(cond);
        return this;
    }

    removeCond(col) {
        this.conds = this.conds.filter(cond => cond.col !== col);
        return this;
    }

    setConds(conds) {
        this.conds = conds;
        return this;
    }

    getCond(col) {
        return this.conds.find(cond => cond.col === col);
    }

    setDistinct() {
        this.distinct = true;
        return this;
    }

    addOrder(col, asc) {
        if (isEmpty(col) || !isBoolean(asc)) {
            return;
        }
        this.removeOrder(col)
        this.orders.push(new Order(col, asc));
        return this;
    }

    removeOrder(col) {
        const idx = this.orders.findIndex(o => o.col === col);
        if (idx > -1) {
            this.orders.splice(idx, 1)
        }
        return this;
    }

    getOrder(col) {
        return this.orders.find(order => order.col === col);
    }

    toJson() {
        // 防止后端序列化策略为下划线, 这里将col、conds、orders中涉及的字段全部转换为驼峰, 因为这些值接口传输给后端时不受反序影响
        //  为了保证后端能正常对应到entity中的字段, 因此转为驼峰(这里是坚信entity中属性是驼峰命名).
        const cols = this.cols.map(col => caseToCamel(col, '_'));
        const conds = this.conds.map(cond => new Cond(caseToCamel(cond.col, '_'), cond.opt, cond.val));
        const orders = this.orders.map(order => new Order(caseToCamel(order.col, '_'), order.asc));
        // 将扩展参数中的"空值"都转换为null, 避免后端获取时参数类型不符引起问题
        const extra = Object.fromEntries(
            Object.entries(this.extra).map(([key, value]) => [key, isEmpty(value) ? null : value])
        );
        return {
            cols: cols,
            conds: conds,
            orders: orders,
            distinct: this.distinct,
            extra: extra
        };
    }
}

export default Query
