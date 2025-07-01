import FastTableColumnObject from './src/table-column-object.vue'

FastTableColumnObject.install = (app) => {
    app.component(FastTableColumnObject.name, FastTableColumnObject)
}

export default FastTableColumnObject
