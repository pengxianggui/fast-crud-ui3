import FastUpload from "./src/fast-upload.vue";

FastUpload.install= (app) => {
    app.component(FastUpload.name, FastUpload)
}

export default FastUpload;
