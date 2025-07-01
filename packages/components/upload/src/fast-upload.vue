<template>
  <el-upload v-model="value"
             v-bind="$attrs"
             :action="actionValue"
             :data="formData"
             :limit="limit"
             :list-type="listType"
             :file-list="files"
             :show-file-list="true"
             :on-success="handleSuccess"
             :on-error="handleError"
             :on-change="handleChange"
             :on-exceed="handleExceed"
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
import {nextTick, h, defineComponent} from "vue";
import {ElMessage} from 'element-plus';
import {
  isArray,
  isEmpty,
  isFunction,
  getNameFromUrl,
  getFirstUrlFromFileItems,
  defaultIfBlank,
  ellipsis,
  cutPrefix, isString
} from "../../../util/util";
import FastTableOption from "../../../model";
import {openDialog} from "../../../util/dialog";

export default {
  name: "fast-upload",
  emits: ['update:modelValue', 'success', 'fail', 'change', 'exceed'],
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
    },
    col: {
      type: String,
      default: () => ''
    },
    // optimized: 优化下面两个参数，跟表格耦合太强
    row: {
      type: Object,
      default: () => {
        return {}
      }
    },
    data: {
      type: Object,
      default: () => {
        return {}
      }
    },
    /**
     * 上传成功后的回调, 必须解析出并返回url地址
     */
    responseHandler: {
      type: Function,
      default: (response, file, fileList) => response
    }
  },
  computed: {
    value: {
      get() {
        return this.fillBackFiles(this.modelValue)
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    },
    actionValue() {
      return this.apiPrefix + this.action;
    },
    isPicture() {
      return this.listType === 'picture-card';
    },
    hideUploadButton() {
      return this.disabled || (!isEmpty(this.value) && this.files.length >= this.limit);
    },
    formData() {
      return {
        row: JSON.stringify(this.row),
        col: this.col,
        ...this.data
      }
    }
  },
  data() {
    return {
      files: [],
      apiPrefix: defaultIfBlank(FastTableOption.$http.defaults.baseURL, '')
    }
  },
  methods: {
    ellipsis,
    /**
     * 回显files并返回modelValue值
     * @param value
     */
    fillBackFiles(value) {
      // TODO 如果类型不变，则继续返回value引用，防止每次el-upload显示的文件都会因刷新而闪动
      const multiple = this.multiple
      const files = []
      if (multiple) {
        if (isArray(value)) {
          files.push(...value)
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
      this.files = files.map(f => {
        return {name: f.name, url: this.disposeUrl(f.url, true)}
      });
      if (multiple) {
        return files
      }
      return isEmpty(files) ? null : files[0].url
    },
    handleSuccess(response, file, fileList) {
      const url = this.responseHandler(response, file, fileList);
      if (this.multiple === false) {
        this.value = url;
      } else {
        this.value.push({name: file.name, url: url});
        this.value = [...this.value]
      }
      try {
        if (this.$attrs.hasOwnProperty('on-success')) {
          const customOnSuccess = this.$attrs['on-success'];
          if (isFunction(customOnSuccess)) {
            customOnSuccess(response, file, fileList);
          }
        }
      } catch (err) {
        console.error(err);
      }
      this.$emit('success', {response, file, fileList})
    },
    handleError(err, file, fileList) {
      this.$emit('fail', {err, file, fileList})
    },
    handleChange(file, fileList) {
      nextTick(() => { // 延迟执行, 等待modelValue更新
        this.$emit('change', this.value);
      })
    },
    handleExceed(files, fileList) {
      ElMessage.warning('文件数量超过限制');
      this.$emit('exceed', {files, fileList})
    },
    handleRemove(file) {
      const index = this.files.findIndex(f => f.url === file.url);
      this.files.splice(index, 1);
      if (this.multiple === false) {
        const url = getFirstUrlFromFileItems(this.files);
        this.value = this.disposeUrl(url, false)
      } else {
        this.value = this.files.map(f => {
          return {name: f.name, url: this.disposeUrl(f.url, false)}
        })
      }
    },
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
