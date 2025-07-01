import FastTable from './src/table.vue'

FastTable.install = (app) => {
    app.component(FastTable.name, FastTable)
}

export default FastTable
