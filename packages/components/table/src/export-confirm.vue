<template>
  <div class="export-confirm">
    <el-table :data="columns">
<!--      <el-table-column prop="col" label="字段"/>-->
      <el-table-column prop="label" :label="t('crud.exports.titleRow')">
        <template #default="{row}">
          <el-input v-model="row.label" size="default" :placeholder="t('crud.exports.enterName')"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="exportable" :label="t('crud.exports.exportable')">
        <template #default="{row}">
          <el-switch v-model="row.exportable"></el-switch>
        </template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <span class="flex"></span>
      <el-button :icon="Download" size="default" type="primary" plain @click="exportData(false)">{{ t('crud.exports.exportCurrentPage') }}</el-button>
      <el-button :icon="Download" size="default" type="primary" @click="exportData(true)">{{ t('crud.exports.exportAll') }}</el-button>
    </div>
  </div>
</template>

<script>
import {Download} from "@element-plus/icons-vue";
import { useI18n } from '../../../i18n/index.js'

export default {
  name: "export-confirm",
  setup() {
    const { t } = useI18n()
    return {
      t
    }
  },
  computed: {
    Download() {
      return Download
    }
  },
  emits: ['ok'],
  props: {
    columns: Array
  },
  methods: {
    exportData(all) {
      this.$emit('ok', { columns: this.columns, all: all })
    }
  }
}
</script>

<style scoped lang="scss">
.footer {
  display: flex;
  margin-top: 10px;

  .flex {
    flex: 1;
  }
}
</style>
