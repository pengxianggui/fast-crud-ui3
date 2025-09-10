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
          <fast-object-picker v-model="row['editRow'][prop]"
                              v-bind="row['config'][prop]['props']"
                              :table-option="getTableOption(row, column, $index)"
                              :pick-object="row['editRow']"
                              :ref="prop + $index"
                              @change="(val) => handleChange(val, {row, column, $index})"
                              @blur="(event) => handleBlur(event, {row, column, $index})"
                              @focus="(event) => handleFocus(event, {row, column, $index})"
                              @input="(val) => handleInput(val, {row, column, $index})"
                              @clear="() => handleClear({row, column, $index})">
          </fast-object-picker>
        </slot>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import tableColumn from "../../../mixins/table-column"
import {FastTableOption} from "../../../index"
import {isFunction} from "../../../util/util"
import FastObjectPicker from "../../object-picker/src/fast-object-picker.vue"

export default {
  name: "FastTableColumnObject",
  components: {FastObjectPicker},
  mixins: [tableColumn],
  props: {
    minWidth: {
      type: String,
      default: () => '100px'
    },
    tableOption: {
      type: [FastTableOption, Function],
      required: true
    }
  },
  methods: {
    getTableOption(fatRow, column, $index) {
      if (isFunction(this.tableOption)) {
        return this.tableOption(fatRow, column, $index);
      }
      return this.tableOption;
    }
  }
}
</script>

<style scoped>

</style>
