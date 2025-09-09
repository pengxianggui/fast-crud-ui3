<template>
  <el-table-column class-name="fc-table-column"
                   :prop="prop"
                   :label="label"
                   :min-width="minWidth"
                   :show-overflow-tooltip="showOverflowTooltip"
                   v-bind="$attrs"
                   v-if="!hidden">
    <template #header="{column, $index}">
      <fast-table-head-cell :column="columnProp" @click="headCellClick(column)">
        <slot name="header" v-bind:column="column" v-bind:$index="$index">
          <span>{{ label }}</span>
        </slot>
      </fast-table-head-cell>
    </template>

    <template #default="{row, column, $index}">
      <slot v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
        <fast-content-dialog :value="showLabel(row)" :show-length="showLength"/>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"
import FastContentDialog from "../../content-dialog/src/fast-content-dialog.vue";

export default {
  name: "FastTableColumn",
  components: {FastContentDialog},
  mixins: [tableColumn],
  props: {
    minWidth: {
      type: String,
      default: () => '150px'
    }
  }
}
</script>

<style scoped lang="scss">

</style>
