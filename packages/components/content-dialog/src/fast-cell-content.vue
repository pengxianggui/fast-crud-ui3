<template>
  <div>
    <!-- TODO 借鉴此机制实现脱敏 -->
    <el-link class="fc-ellipsis" :underline="underline" :type="showAsLink ? 'primary' : 'default'"
             @click="handleClick" v-if="needEllipsis || showAsLink">{{ value }}
    </el-link>
    <span v-else>{{ value }}</span>
  </div>
</template>

<script>
import {version as elVersion} from 'element-plus'
import FastJsonViewer from "../../json-viewer/src/fast-json-viewer.vue"
import * as util from "../../../util/util.js"
import {openDialog} from "../../../util/dialog.js"
import FastTableOption from "../../../model/fastTableOption.js"

export default {
  name: "FastCellContent",
  components: {FastJsonViewer},
  props: {
    value: {
      type: null // 任意类型
    },
    fatRow: Object,
    linkTo: [String, Boolean],
    showLength: {
      type: Number,
      default: () => Number.MAX_VALUE // 不限制
    }
  },
  computed: {
    underline() {
      return util.versionGte(elVersion, '2.9.9') ? 'never' : false // 2.9.9后支持never, 之前是false
    },
    // 是否展示为链接
    showAsLink() {
      return this.linkTo === true || (util.isString(this.linkTo) && !util.isEmpty(this.linkTo))
    },
    // 链接地址
    linkUrl() {
      if (!this.showAsLink) {
        return null;
      }
      return this.linkTo === true ? this.value : this.linkTo
    },
    needEllipsis() {
      return util.isEmpty(this.value) ? false : util.toStr(this.value).length > this.showLength
    },
    row() {
      return this.fatRow.row
    }
  },
  methods: {
    handleClick() {
      if (this.showAsLink) {
        try {
          this.jumpToLink()
        } catch (err) { // 若链接跳转失败, 又需要预览, 则降级弹窗预览
          console.error(err)
          if (this.needEllipsis) {
            this.openViewer()
          }
        }
        return
      }
      this.openViewer()
    },
    // 跳转到目标地址(支持路由名、路由地址、http绝对地址)
    jumpToLink() {
      const {linkUrl} = this
      if (util.isEmpty(linkUrl)) {
        return
      }
      // 转义linkUrl中可能存在的插值表达式
      const url = util.strFormat(linkUrl, this.row)
      if (util.isUrl(url)) {
        window.open(url, '_blank')
        return
      }
      // 提取linkUrl中可能存在的query参数, 作为路由跳转的参数
      const {path: pathOrName, query} = util.extractUrlAndQueryParams(url)
      if (url.startsWith('/')) {
        FastTableOption.$router.push({path: pathOrName, query: query})
        return
      }
      FastTableOption.$router.push({name: pathOrName, query: query})
    },
    // 超长预览
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
