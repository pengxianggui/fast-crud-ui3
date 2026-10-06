<template>
  <div class="import-confirm">
    <el-upload
      ref="upload"
      class="fc-import-upload"
      drag
      action="#"
      :auto-upload="false"
      :limit="1"
      :disabled="loading"
      accept=".xlsx,.xls"
      :on-change="onChange"
      :on-remove="onRemove"
      :on-exceed="onExceed">
      <el-icon class="el-icon--upload">
        <UploadFilled/>
      </el-icon>
      <div class="el-upload__text">{{ t('crud.imports.dragTip') }}</div>
      <template #tip>
        <div class="el-upload__tip">{{ t('crud.imports.supportTip') }}</div>
      </template>
    </el-upload>

    <div class="fc-import-template">
      <el-link type="primary" :underline="true" :disabled="loading" @click="downloadTemplate">
        {{ t('crud.imports.downloadTemplate') }}
      </el-link>
    </div>

    <div class="fc-import-errors" v-if="errors && errors.length > 0">
      <div class="fc-import-errors-title">{{ t('crud.imports.errorTitle', {count: errors.length}) }}</div>
      <el-table :data="errors" size="small" border max-height="240">
        <el-table-column prop="row" :label="t('crud.imports.row')" width="80">
          <template #default="{row}">
            <span>{{ row.row > 0 ? row.row : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="label" :label="t('crud.imports.col')" width="140">
          <template #default="{row}">
            <span>{{ row.label || row.col || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="message" :label="t('crud.imports.reason')" show-overflow-tooltip/>
      </el-table>
    </div>

    <div class="footer">
      <el-button size="default" :disabled="loading" @click="cancel">{{ t('crud.cancel') }}</el-button>
      <el-button size="default" type="primary" :loading="loading" :disabled="!file" @click="submit">
        {{ t('crud.imports.import') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import {ElMessage} from "element-plus";
import {UploadFilled} from "@element-plus/icons-vue";
import {postForm} from "../../../util/http.js";
import {useI18n} from "../../../i18n/index.js";

export default {
  name: "import-confirm",
  components: {UploadFilled},
  setup() {
    const {t} = useI18n()
    return {t}
  },
  emits: ['ok', 'cancel', 'fail'],
  props: {
    /**
     * 导入列配置(与导出列元数据同构)
     */
    columns: Array,
    /**
     * 导入接口
     */
    importUrl: {
      type: String,
      required: true
    },
    /**
     * 额外参数, 会以json字符串随请求提交
     */
    extra: {
      type: Object,
      default: () => ({})
    },
    /**
     * 下载导入模板的回调(由fastTableOption提供)
     */
    templateDownload: Function
  },
  data() {
    return {
      file: null,
      loading: false,
      errors: []
    }
  },
  methods: {
    onChange(uploadFile) {
      this.file = uploadFile.raw
      this.errors = []
    },
    onRemove() {
      this.file = null
      this.errors = []
    },
    /**
     * 仅支持一个文件: 已选择文件后不允许再次拖入/选择, 需先手动移除(叉掉)已选文件
     */
    onExceed() {
      ElMessage.warning(this.t('crud.imports.singleFileOnly'))
    },
    downloadTemplate() {
      if (typeof this.templateDownload === 'function') {
        this.templateDownload()
      }
    },
    submit() {
      if (!this.file) {
        ElMessage.warning(this.t('crud.imports.pleaseSelectFile'))
        return
      }
      const formData = new FormData()
      formData.append('file', this.file, this.file.name)
      // 参考导出接口的ExportParam, 将列配置与额外参数作为body中的json部分提交
      const param = {
        columns: this.columns || [],
        extra: this.extra || {}
      }
      formData.append('param', new Blob([JSON.stringify(param)], {type: 'application/json'}))
      this.loading = true
      this.errors = []
      postForm(this.importUrl, {}, formData).then((result) => {
        if (result && result.success) {
          ElMessage.success(this.t('crud.imports.importSuccess', {
            inserted: result.inserted || 0,
            updated: result.updated || 0
          }))
          this.$emit('ok', result)
          return
        }
        this.errors = (result && result.errors) || []
        if (this.errors.length === 0) {
          ElMessage.error((result && result.message) || this.t('crud.imports.importFail'))
        }
        this.$emit('fail', {result: result})
      }).catch((err) => {
        ElMessage.error(typeof err === 'string' ? err : ((err && err.message) || this.t('crud.imports.importFail')))
        this.$emit('fail', {error: err})
      }).finally(() => {
        this.loading = false
      })
    },
    cancel() {
      if (this.loading) {
        return
      }
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="scss">
.import-confirm {
  .fc-import-upload {
    width: 100%;
  }

  .fc-import-template {
    margin-top: 12px;
    text-align: center;
  }

  .fc-import-errors {
    margin-top: 12px;

    .fc-import-errors-title {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-color-danger);
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
