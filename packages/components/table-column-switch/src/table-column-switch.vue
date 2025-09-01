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
        <div v-if="!canEdit(row, column, $index)">
          <slot name="normal" v-bind:row="row" v-bind:column="column" v-bind:$index="$index">
            <fast-content-dialog :value="showLabel(row)" :show-length="showLength"/>
          </slot>
        </div>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <el-switch v-model="row['editRow'][prop]"
                     v-bind="row['config'][prop]['props']"
                     :ref="prop + $index"
                     @change="(val) => handleChange(val, {row, column, $index})"></el-switch>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"

export default {
  name: "FastTableColumnSwitch",
  mixins: [tableColumn],
  props: {
    minWidth: {
      type: String,
      default: () => '100px'
    }
  },
  methods: {
    showLabel(fatRow) {
      const {row, editRow, status, config} = fatRow
      const {
        props: {
          activeValue = true,
          activeText = '是',
          inactiveValue = false,
          inactiveText = '否'
        } = {}
      } = config[this.prop]
      const options = [
        {label: inactiveText, value: inactiveValue},
        {label: activeText, value: activeValue}
      ]
      let val;
      if (status === 'normal') {
        val = row[this.prop];
      } else {
        val = editRow[this.prop];
      }
      if (options) {
        const option = options.find(item => item.value === val);
        if (option) {
          return option.label
        }
      }
      return val;
    }
  }
}
</script>

<style scoped>

</style>
