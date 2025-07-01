import FastTableHeadCell from './src/table-head-cell.vue'

FastTableHeadCell.install = (app) => {
    app.component(FastTableHeadCell.name, FastTableHeadCell)
}

export default FastTableHeadCell
