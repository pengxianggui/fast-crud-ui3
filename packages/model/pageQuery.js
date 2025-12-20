import Query from "./query.js";
class PageQuery extends Query {
    current = 1;
    size = 20;

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
