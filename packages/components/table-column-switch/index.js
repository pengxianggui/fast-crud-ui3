import FastTableColumnSwitch from './src/table-column-switch.vue'

FastTableColumnSwitch.install = (app) => {
    app.component(FastTableColumnSwitch.name, FastTableColumnSwitch)
}

export default FastTableColumnSwitch
