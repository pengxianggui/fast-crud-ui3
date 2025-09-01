import FastJsonViewer from './src/fast-json-viewer.vue'

FastJsonViewer.install = (app) => {
    app.component(FastJsonViewer.name, FastJsonViewer)
}

export default FastJsonViewer
