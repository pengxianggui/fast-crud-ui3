<template>
  <el-upload :file-list="files"
             ref="uploadRef"
             v-bind="$attrs"
             :action="actionValue"
             :limit="limit"
             :list-type="listType"
             :show-file-list="true"
             :on-preview="onPreview"
             :on-remove="onRemove"
             :on-success="handleSuccess"
             :on-progress="onProgress"
             :on-change="onChange"
             :on-exceed="onExceed"
             :before-remove="beforeRemove"
             class="fc-fast-upload"
             :class="{'fc-fast-upload__hidden': hideUploadButton, 'fc-fast-upload__disable': disabled}">
    <template #default>
      <el-icon>
        <Plus/>
      </el-icon>
    </template>
    <template #file="{file}">
      <!-- 图片 -->
      <template v-if="isPicture">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="preview(file)">
            <el-icon>
              <ZoomIn/>
            </el-icon>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
            <el-icon><Delete/></el-icon>
          </span>
        </span>
      </template>
      <!-- 普通文件 -->
      <div style="word-break: break-all; display: inline-flex;" v-else>
        <el-icon v-if="disabled">
          <Paperclip/>
        </el-icon>
        <el-button link icon="Delete" @click="handleRemove(file)" style="padding: 2px; color: #f56c6c;" v-else/>
        <el-link :href="file.url" style="margin-left: 3px;">{{ file.name }}</el-link>
      </div>
    </template>
  </el-upload>
</template>

<script>
import {h, defineComponent} from "vue"
import {
  isArray,
  isEmpty,
  isFunction,
  getNameFromUrl,
  getFirstUrlFromFileItems,
  defaultIfBlank,
  cutPrefix,
  isString
} from "../../../util/util"
import UploadMixin from "../../../mixins/upload.js"
import FastTableOption from "../../../model"
import {openDialog} from "../../../util/dialog"

export default {
  name: "fast-upload",
  mixins: [UploadMixin],
  emits: ['update:modelValue'],
  props: {
    /**
     * 是否支持多文件
     */
    multiple: {
      type: Boolean,
      default: () => false
    },
    // multiple为true则应当是单个url地址, 否则为url数组
    modelValue: {
      type: [String, Array],
      default: () => null
    },
    action: {
      type: String,
      default: () => '/'
    },
    listType: {
      type: String,
      default: () => 'text'
    },
    limit: {
      type: Number,
      default: () => 1
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    files() {
      const value = this.modelValue
      let files = []
      if (this.multiple) {
        if (isArray(value)) {
          files = value
        } else {
          if (!isEmpty(value)) {
            files.push({name: getNameFromUrl(value), url: value})
          }
        }
      } else {
        const url = isArray(value) ? getFirstUrlFromFileItems(value) : value;
        if (!isEmpty(url)) {
          files.push({name: getNameFromUrl(value), url: url})
        }
      }
      // 处理代理前缀
      return files.map(f => {
        return {name: f.name, url: this.disposeUrl(f.url, true)}
      })
    },
    actionValue() {
      return this.apiPrefix + this.action;
    },
    isPicture() {
      return this.listType === 'picture-card';
    },
    hideUploadButton() {
      return this.disabled || (!isEmpty(this.files) && this.files.length >= this.limit);
    }
  },
  data() {
    return {
      apiPrefix: defaultIfBlank(FastTableOption.$http.defaults.baseURL, '')
    }
  },
  methods: {
    /**
     * emit值
     * @param fileList
     */
    emitValue(fileList) {
      if (isEmpty(fileList)) {
        this.$emit('update:modelValue', null)
        return
      }
      const {multiple} = this
      let val
      if (multiple) {
        val = fileList.map(f => {
          return {
            name: f.name,
            url: this.disposeUrl(f.url, false)
          }
        })
      } else {
        val = this.disposeUrl(fileList[0].url, false)
      }
      this.$emit('update:modelValue', val)
    },
    handleSuccess(response, file, fileList) {
      const responseHandler = isFunction(this.responseHandler) ? this.responseHandler : (response) => response
      const url = responseHandler(response, file, fileList);
      this.files.push({
        name: file.name,
        url: url
      })
      this.emitValue(this.files)
      this.onSuccess(response, file, fileList)
    },
    /**
     * 自定义移除，实现外部透传的beforeRemove和onRemove
     * @param file
     */
    handleRemove(file) {
      console.log(this.beforeRemove)
      const beforeRemove = isFunction(this.beforeRemove) ? this.beforeRemove : () => Promise.resolve(true)
      beforeRemove(file, this.files).then(flag => {
        if (flag) {
          const index = this.files.findIndex(f => f.url === file.url);
          this.files.splice(index, 1);
          this.emitValue(this.files)
          this.onRemove(file, this.files)
        }
      })
    },
    /**
     * 预览图片
     * @param file
     * @return {VNode}
     */
    preview(file) {
      const imgPreviewComponent = defineComponent({
        render() {
          return h('img', {
            src: file.url,
            width: '100%'
          })
        }
      })
      openDialog({
        component: imgPreviewComponent
      })
    },
    /**
     * 处理url
     * @param url 待处理的url
     * @param append 添加前缀? 若true则追加this.apiPrefix前缀; false则移除前面可能得前缀
     * @return {*}
     */
    disposeUrl(url, append) {
      if (!isString(url) || isEmpty(url) || url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      return append ? this.apiPrefix + url : cutPrefix(url, this.apiPrefix)
    }
  }
}
</script>

<style scoped lang="scss">
.fc-fast-upload {
  :deep(.el-upload-list--picture-card) {
    display: grid;
    grid-template-columns: repeat(auto-fill, 48px);
    grid-gap: 2px;
  }

  :deep(.el-upload-list--text .el-upload-list__item) {
    margin: 3px 0 !important;
  }

  .el-upload-list__item-actions {
    display: flex;
    align-items: center;
    justify-content: space-around;

    & > * {
      margin: 0 !important;

      & i {
        font-size: 14px;
      }
    }

    &::after {
      display: none;
    }
  }

  img {
    height: 100%;
    object-fit: cover;
  }
}

.fc-fast-upload.fc-fast-upload__hidden {
  :deep(.el-upload) {
    display: none;
  }
}

.fc-fast-upload.fc-fast-upload__disable {
  border: none !important;
}
</style>
