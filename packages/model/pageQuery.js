import Query from "./query.js";

/**
 * 分页请求参数模型
 */
class PageQuery extends Query {
    /**
     * 当前页，默认1
     * @type {number}
     */
    current = 1;
    /**
     * 每页条数，默认20条
     * @type {number}
     */
    size = 20;

    /**
     * 构造器
     * @param current 当前页(默认1)
     * @param size 每页条数(默认20)
     */
    constructor(current = 1, size = 20) {
        super();
        this.current = current;
        this.size = size;
    }

    /**
     * 设置每页大小
     * @param size
     */
    setSize(size) {
        this.size = size;
        return this;
    }

    /**
     * 将当前对象转为json
     * @return {{current: number, size: number, conds: *, extra: {[p: string]: null|*}, distinct: *, orders: *, cols: *}}
     */
    toJson() {
        const json = super.toJson();
        return {
            ...json,
            current: this.current,
            size: this.size
        }
    }
}

export default PageQuery
