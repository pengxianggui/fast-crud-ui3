<template>
  <el-table-column class-name="fc-table-column" :prop="prop" :label="label" :min-width="minWidth" v-bind="$attrs">
    <template #header="{column, $index}">
      <fast-table-head-cell :column="columnProp" @click="headCellClick(column)">
        <slot name="header" v-bind:column="column" v-bind:$index="$index">
          <span>{{ column.label }}</span>
        </slot>
      </fast-table-head-cell>
    </template>

    <template #default="{row, column, $index}">
      <slot v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
        <template v-if="!canEdit(row, column, $index)">
          <slot name="normal" v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
            <fast-upload v-model="row[row.status === 'normal' ? 'row' : 'editRow'][prop]"
                         v-bind="row['config'][prop]['props']"
                         list-type="picture-card"
                         :disabled="true"></fast-upload>
          </slot>
        </template>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <fast-upload v-model="row['editRow'][prop]"
                       :row="row['editRow']" :col="prop"
                       v-bind="row['config'][prop]['props']"
                       :ref="prop + $index"
                       @change="(val) => handleChange(val, {row, column, $index})"
                       @success="(componentScope) => $emit('success', componentScope, {row, column, $index})"
                       @fail="(componentScope) => $emit('fail', componentScope, {row, column, $index})"
                       @exceed="(componentScope) => $emit('exceed', componentScope, {row, column, $index})"></fast-upload>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import FastTableHeadCell from "../../table-head-cell/src/table-head-cell.vue";
import FastUpload from "../../upload/src/fast-upload.vue";
import tableColumn from "../../../mixins/table-column";

export default {
  name: "FastTableColumnImg",
  components: {FastTableHeadCell, FastUpload},
  mixins: [tableColumn],
  emits: ['success', 'fail', 'exceed'],
  props: {
    minWidth: {
      type: String,
      default: () => '100px'
    },
  },
  data() {
    return {}
  }
}
</script>

<style scoped lang="scss">
.img-list {
  display: flex;
  flex-wrap: wrap;
  padding: 3px 0;
}

img {
  object-fit: cover;
}
</style>
