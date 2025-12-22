import {caseToCamel, isBoolean, isEmpty} from "../util/util.js"
import Cond from './cond.js'
import Order from './order.js'

/**
 * 请求参数模型
 */
class Query {
    /**
     * 请求的字段列表。若为空，则表示请求所有字段。字段必须是分页请求返回的字段(且对应数据表字段)
     * @type {[]}
     */
    cols = [];
    /**
     * 查询条件
     * @type {Cond[]}
     */
    conds = [];
    /**
     * 是否distinct去重。默认false
     * @type {boolean}
     */
    distinct = false;
    /**
     * 排序数组
     * @type {Order[]}
     */
    orders = [];
    /**
     * 扩展字段
     * @type {{}}
     */
    extra = {};

    constructor() {
    }

    /**
     * 设置查询字段数组
     * @param cols {string[]} 字段必须是分页请求返回的字段(且对应数据表字段)
     * @return {Query} 返回当前对象
     */
    setCols(cols) {
        this.cols = cols;
        return this;
    }

    /**
     * 添加筛选条件
     * @param cond {Cond} 筛选条件
     * @param repeatable {boolean} 是否允许重复的col, 默认true, 即若多次添加相同col的条件, 只会保留最新的
     * @return {Query} 返回当前对象
     */
    addCond(cond, repeatable = true) {
        if (repeatable === false) {
            this.removeCond(c.col)
        }
        this.conds.push(cond);
        return this;
    }

    /**
     * 按照字段移除已有条件。此字段所有条件都会被移除
     * @param col {string} 字段名
     * @return {Query} 返回当前对象
     */
    removeCond(col) {
        this.conds = this.conds.filter(cond => cond.col !== col);
        return this;
    }

    /**
     * 设置条件。会覆盖已有条件！
     * @param conds {Array[Cond]} 条件数组
     * @return {Query} 返回当前对象
     */
    setConds(conds) {
        this.conds = conds;
        return this;
    }

    /**
     * 获取指定字段的所有条件
     * @param col {string}
     * @return {Cond[]}
     */
    getConds(col) {
        return this.conds.filter(cond => cond.col === col);
    }

    /**
     * 设置distinct去重
     * @return {Query} 返回当前对象
     */
    setDistinct() {
        this.distinct = true;
        return this;
    }

    /**
     * 添加排序规则
     * @param col {string} 字段名
     * @param asc {boolean} 是否升序
     * @return {Query} 返回当前对象
     */
    addOrder(col, asc) {
        if (isEmpty(col) || !isBoolean(asc)) {
            return this;
        }
        this.removeOrder(col)
        this.orders.push(new Order(col, asc));
        return this;
    }

    /**
     * 移除排序规则
     * @param col {string} 字段名
     * @return {Query} 返回当前对象
     */
    removeOrder(col) {
        const idx = this.orders.findIndex(o => o.col === col);
        if (idx > -1) {
            this.orders.splice(idx, 1)
        }
        return this;
    }

    /**
     * 获取排序规则
     * @param col {string}
     * @return {Order} 可能为undefined
     */
    getOrder(col) {
        return this.orders.find(order => order.col === col);
    }

    /**
     * 将当前查询实例转换为json
     * @return {{conds: Cond[], extra: {[p: string]: null|*}, distinct: boolean, orders: Order[], cols: (*)[]}}
     */
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
