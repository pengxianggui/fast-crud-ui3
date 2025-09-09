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
        <div v-if="!canEdit(row, column, $index)">
          <slot name="normal" v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
            <fast-content-dialog :value="showLabel(row)" :show-length="showLength"/>
          </slot>
        </div>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <el-input-number v-model="row['editRow'][prop]"
                           v-bind="row['config'][prop]['props']"
                           :ref="prop + $index"
                           @change="(val) => handleChange(val, {row, column, $index})"
                           @blur="(event) => handleBlur(event, {row, column, $index})"
                           @focus="(event) => handleFocus(event, {row, column, $index})"></el-input-number>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"

export default {
  name: "FastTableColumnNumber",
  mixins: [tableColumn],
  props: {
    minWidth: {
      type: String,
      default: () => '90px'
    }
  }
}
</script>

<style scoped>

</style>
