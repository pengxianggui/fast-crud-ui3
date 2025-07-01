import FastTableColumn from './src/table-column.vue'

FastTableColumn.install = (app) => {
    app.component(FastTableColumn.name, FastTableColumn)
}

export default FastTableColumn
