/**
 * 排序对象
 */
class Order {
    /**
     * 排序字段(英文字段),需要和后端分页响应的字段名对应
     * @type {string}
     */
    col;
    /**
     * 是否升序
     * @type {boolean}
     */
    asc;

    /**
     * 构造器
     * @param col 排序字段
     * @param asc 是否升序，默认false，即降序
     */
    constructor(col, asc = false) {
        this.col = col;
        this.asc = asc;
    }

    /**
     * 设置是否升序
     * @param asc
     * @return {Order}
     */
    setAsc(asc) {
        this.asc = asc;
        return this;
    }
}

export default Order
