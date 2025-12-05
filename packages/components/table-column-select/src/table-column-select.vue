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
import FastTableOption, {Query} from "../../../model.js";

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
  data() {
    return {
      options: []
    }
  },
  async created() {
    await this.loadOptions()
  },
  methods: {
    /**
     * 从属性中加载options(如果传入的options是FastTableOption类型, 则可能涉及异步加载)
     */
    async loadOptions() {
      const {options, valKey = 'value', labelKey = 'label'} = this.columnProp
      if (util.isArray(options)) {
        this.options = options
      } else if (options instanceof FastTableOption) {
        const query = new Query().setDistinct().setCols([valKey, labelKey])
        this.options = await options._buildSelectOptions(query, valKey, labelKey)
      }
    },
    showLabel(fatRow) {
      const {row, editRow, status, config} = fatRow
      const {props = {}} = config[this.prop]
      const {labelKey = 'label', valKey = 'value'} = props
      let val;
      if (status === 'normal') {
        val = row[this.prop];
      } else {
        val = editRow[this.prop];
      }
      return util.escapeLabel(val, this.options, valKey, labelKey)
    }
  }
}
</script>

<style scoped>

</style>
