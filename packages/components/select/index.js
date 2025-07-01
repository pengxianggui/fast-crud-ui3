import FastSelect from './src/fast-select.vue'

FastSelect.install = (app) => {
    app.component(FastSelect.name, FastSelect)
}

export default FastSelect
