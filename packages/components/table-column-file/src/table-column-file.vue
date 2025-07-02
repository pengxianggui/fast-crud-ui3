<template>
  <el-table-column class-name="fc-table-column"
                   :prop="prop"
                   :label="label"
                   :min-width="minWidth"
                   :show-overflow-tooltip="showOverflowTooltip"
                   v-bind="$attrs">
    <template #header="{column, $index}">
      <fast-table-head-cell :column="columnProp" @click="headCellClick(column)">
        <slot name="header" v-bind:column="column" v-bind:$index="$index">
          <span>{{ label }}</span>
        </slot>
      </fast-table-head-cell>
    </template>

    <template #default="{row, column, $index}">
      <slot v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
        <template v-if="!canEdit(row, column, $index)">
          <slot name="normal" v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
            <fast-upload v-model="row[row.status === 'normal' ? 'row' : 'editRow'][prop]"
                         v-bind="row['config'][prop]['props']"
                         list-type="text"
                         :disabled="true"
                         class="fc-fast-upload-file"></fast-upload>
          </slot>
        </template>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <fast-upload v-model="row['editRow'][prop]"
                       :row="row['editRow']" :col="prop"
                       v-bind="row['config'][prop]['props']"
                       :ref="prop + $index"
                       :on-preview="(file) => onPreview(file, {row, column, $index})"
                       :before-remove="(file, files) => handleBeforeRemove(file, files, {row, column, $index})"
                       :on-remove="(file, files) => isFunction(onRemove) ? onRemove(file, files, {row, column, $index}) : null"
                       :response-handler="(response, file, files) => isFunction(responseHandler) ? responseHandler(response, file, files, {row, column, $index}) : response"
                       :on-success="(response, file, files) => isFunction(onSuccess) ? onSuccess(response, file, files, {row, column, $index}) : null"
                       :on-progress="(event ,file, files) => isFunction(onProgress) ? onProgress(event, file, files, {row, column, $index}) : null"
                       :on-change="(file, files) => isFunction(onChange) ? onChange(file, files, {row, column, $index}) : null"
                       :on-exceed="(file, files) => isFunction(onExceed) ? onExceed(file, files, {row, column, $index}) : null"
                       class="fc-fast-upload-file"/>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import FastTableHeadCell from "../../table-head-cell/src/table-head-cell.vue";
import FastUpload from "../../upload/src/fast-upload.vue";
import tableColumn from "../../../mixins/table-column";
import UploadMixin from "../../../mixins/upload.js";
import {isFunction} from "../../../util/util.js";

export default {
  name: "FastTableColumnFile",
  components: {FastTableHeadCell, FastUpload},
  mixins: [tableColumn, UploadMixin],
  props: {
    minWidth: {
      type: String,
      default: () => '300px'
    },
  },
  data() {
    return {}
  },
  methods: {
    isFunction,
    handleBeforeRemove(file, files, scope) {
      return isFunction(this.beforeRemove) ? this.beforeRemove(file, files, scope) : Promise.resolve(true)
    }
  }
}
</script>

<style scoped lang="scss">
.fc-fast-upload-file {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
