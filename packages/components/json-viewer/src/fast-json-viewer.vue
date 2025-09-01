<template>
  <div>
    <JsonViewer :value="value"
                :copyable="copyable"
                :boxed="boxed"
                :expandDepth="expandDepth"
                :theme="theme"
                v-if="isJson"></JsonViewer>
    <span v-else>{{ value }}</span>
  </div>
</template>

<script>
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/vue3-json-viewer.css"
import {isObject} from "../../../util/util.js";

export default {
  name: "fast-json-viewer",
  components: {JsonViewer},
  props: {
    value: null,
    copyable: {
      type: Boolean,
      default: () => true
    },
    boxed: {
      type: Boolean,
      default: () => true
    },
    expandDepth: {
      type: Number,
      default: () => Number.MAX_VALUE
    },
    theme: {
      type: String,
      default: () => 'light' // light/dark
    }
  },
  computed: {
    isJson() {
      return isObject(this.value)
    }
  }
}
</script>

<style scoped lang="scss">

</style>
