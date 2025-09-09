<template>
  <el-table-column class-name="fc-table-column"
                   :prop="prop"
                   :label="label"
                   :show-overflow-tooltip="showOverflowTooltip"
                   :min-width="minWidth"
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
        <template v-if="!canEdit(row, column, $index)">
          <slot name="normal" v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
            <fast-content-dialog :value="showLabel(row)" :show-length="showLength"/>
          </slot>
        </template>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <el-input v-model="row['editRow'][prop]"
                    v-bind="row['config'][prop]['props']"
                    :ref="prop + $index"
                    @change="(val) => handleChange(val, {row, column, $index})"
                    @blur="(event) => handleBlur(event, {row, column, $index})"
                    @focus="(event) => handleFocus(event, {row, column, $index})"
                    @input="(val) => handleInput(val, {row, column, $index})"
                    @clear="() => handleClear({row, column, $index})"></el-input>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"

export default {
  name: "FastTableColumnTextarea",
  mixins: [tableColumn],
  props: {
    minWidth: {
      type: String,
      default: () => '200px'
    }
  }
}
</script>

<style scoped>

</style>
