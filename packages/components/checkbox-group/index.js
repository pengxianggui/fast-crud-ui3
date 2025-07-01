import FastCheckboxGroup from './src/fast-checkbox-group.vue'

FastCheckboxGroup.install = (app) => {
    app.component(FastCheckboxGroup.name, FastCheckboxGroup)
}

export default FastCheckboxGroup
