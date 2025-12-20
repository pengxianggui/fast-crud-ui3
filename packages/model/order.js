class Order {
    col;
    asc;

    constructor(col, asc = false) {
        this.col = col;
        this.asc = asc;
    }

    setAsc(asc) {
        this.asc = asc;
        return this;
    }
}

export default Order
