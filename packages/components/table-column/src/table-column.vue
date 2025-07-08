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
        <span>{{ showLabel(row) }}</span>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import FastTableHeadCell from '../../table-head-cell/src/table-head-cell.vue'
import tableColumn from "../../../mixins/table-column"

export default {
  name: "FastTableColumn",
  components: {FastTableHeadCell},
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
