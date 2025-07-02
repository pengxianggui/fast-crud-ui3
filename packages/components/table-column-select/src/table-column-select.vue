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
            <span>{{ showLabel(row, column) }}</span>
          </slot>
        </div>
        <slot name="edit" v-bind:row="row" v-bind:column="column" v-bind:$index="$index" v-else>
          <fast-select v-model="row['editRow'][prop]"
                       v-bind="row['config'][prop]['props']"
                       :options="options"
                       :label-key="labelKey"
                       :val-key="valKey"
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
import FastTableHeadCell from "../../table-head-cell/src/table-head-cell.vue";
import tableColumn from "../../../mixins/table-column";
import FastSelect from "../../select/src/fast-select.vue";

export default {
  name: "FastTableColumnSelect",
  components: {FastTableHeadCell, FastSelect},
  mixins: [tableColumn],
  emits: ['visibleChange', 'removeTag'],
  props: {
    options: {
      type: Array,
      required: true
    },
    labelKey: {
      type: String,
      default: () => "label"
    },
    valKey: {
      type: String,
      default: () => "value"
    },
    minWidth: {
      type: String,
      default: () => '90px'
    },
    // TODO 快筛显示为checkbox，声明在这里似乎不太恰当
    quickFilterCheckbox: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {}
  },
  methods: {
    showLabel(fatRow, column) {
      const {row, editRow, status} = fatRow;
      const {property} = column;
      let val;
      if (status === 'normal') {
        val = row[property];
      } else {
        val = editRow[property];
      }
      if (this.options) {
        const option = this.options.find(item => item[this.valKey] === val);
        if (option) {
          return option[this.labelKey]
        }
      }
      return val;
    }
  }
}
</script>

<style scoped>

</style>
