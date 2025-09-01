<template>
  <div>
    <!-- TODO 借鉴此机制实现脱敏 -->
    <el-link class="fc-ellipsis" underline="never" v-if="needEllipsis" @click="openViewer">{{ value }}</el-link>
    <span v-else>{{ value }}</span>
  </div>
</template>

<script>
import FastJsonViewer from "../../json-viewer/src/fast-json-viewer.vue"
import * as util from "../../../util/util.js"
import {openDialog} from "../../../util/dialog.js"

export default {
  name: "FastContentDialog",
  components: {FastJsonViewer},
  props: {
    value: {
      type: null // 任意类型
    },
    showLength: {
      type: Number,
      default: () => Number.MAX_VALUE // 不限制
    }
  },
  computed: {
    needEllipsis() {
      return util.isEmpty(this.value) ? false : util.toStr(this.value).length > this.showLength
    }
  },
  methods: {
    openViewer() {
      openDialog({
        component: FastJsonViewer,
        props: {
          value: (util.isObject(this.value) || util.isJsonStr(this.value)) ? util.toJson(this.value) : this.value
        },
        dialogProps: {
          title: '值预览',
          width: '500px'
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.fc-ellipsis, .fc-ellipsis * {
  white-space: nowrap;
  overflow: hidden;
  overflow: clip;
  text-overflow: ellipsis;
  display: inline-block;
  width: 100%;
}
</style>
