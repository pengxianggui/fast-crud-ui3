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
            <fast-cell-content :value="showLabel(row)" :fat-row="row" :show-length="showLength" :linkTo="link"/>
          </slot>
        </div>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <fast-select v-model="row['editRow'][prop]"
                       v-bind="row['config'][prop]['props']"
                       :ref="prop + $index"
                       @change="(val) => handleChange(val, {row, column, $index})"
                       @blur="(event) => handleBlur(event, {row, column, $index})"
                       @focus="(event) => handleFocus(event, {row, column, $index})"
                       @clear="() => handleClear({row, column, $index})"
                       @visible-change="(visible) => $emit('visibleChange', visible, {row, column, $index})"
                       @remove-tag="(tagVal) => $emit('removeTag', tagVal, {row, column, $index})"></fast-select>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"
import FastSelect from "../../select/src/fast-select.vue"
import * as util from "../../../util/util.js"
import FastTableOption from "../../../model.js";
import {escapeValToLabel} from "../../../util/escape.js";

export default {
  name: "FastTableColumnSelect",
  components: {FastSelect},
  mixins: [tableColumn],
  emits: ['visibleChange', 'removeTag'],
  props: {
    minWidth: {
      type: String,
      default: () => '90px'
    },
    quickFilterCheckbox: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    showLabel(fatRow) {
      const {row, editRow, status, config} = fatRow
      const {component, props = {}} = config[this.prop]
      const {options, labelKey = 'label', valKey = 'value'} = props
      let val;
      if (status === 'normal') {
        val = row[this.prop];
      } else {
        val = editRow[this.prop];
      }
      // TODO 1.5.17 利用 escapeValToLabel 转义。 问题是这里是个异步, 没办法直接返回结果即使await可能渲染出来依然是Promise.toString
      //  escapeValToLabel(component, val, props)

      if (util.isArray(options)) { // 转义
        const option = options.find(item => item[valKey] === val);
        if (option) {
          return option[labelKey]
        }
      } else if (options instanceof FastTableOption) {

      }
      return val;
    }
  }
}
</script>

<style scoped>

</style>
