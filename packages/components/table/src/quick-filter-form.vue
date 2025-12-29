<template>
  <el-form ref="quickFilterForm" :inline="true" :label-width="option.style.formLabelWidth" class="fc-quick-filter-form"
           :style="formStyle">
    <el-form-item v-for="(filter, index) in visibleFilters"
                  :key="filter.col"
                  :prop="filter.col"
                  :label="filter.label + ':'"
                  :style="getStyle(filter, index)"
                  class="fc-quick-filter-form-item">
      <component :ref="filter.col" :size="option.style.size" :is="filter.component" v-model="filter.val" v-bind="filter.props"
                 @change="handleChange(filter)" @click="handleClick(filter)"/>
    </el-form-item>
    <slot></slot>
  </el-form>
</template>

<script>
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import {isFunction, unwrapArr} from "../../../util/util.js";
import {FastTableOption} from "../../../index.js";

export default {
  name: "quick-filter-form",
  components: {ArrowDown, ArrowUp},
  props: {
    option: FastTableOption,
    filters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  computed: {
    /**
     * quickFilterBlock的独占一行且排前面。注意: 必须浅拷贝
     * @return {*[]}
     */
    visibleFilters() {
      const {filters = []} = this;
      // 确保独占一行的快筛项排前面
      filters.sort((a, b) => {
        const {props: propsA} = a;
        const {props: propsB} = b;
        if (propsA.quickFilterBlock !== false && propsB.quickFilterBlock === false) {
          return -1
        } else if (propsA.quickFilterBlock === false && propsB.quickFilterBlock !== false) {
          return 1
        }
        return 0;
      });
      return filters
    },
    formStyle() {
      const rowSpan = this.option.style.quickFilterSpan
      const gridGap = this.option.style.quickFilterGridGap
      // 1.5.18 利用grid实现自动适应列数(quickFilterSpan=auto)，并修复部分组件(如select)被挤压
      const gridTemplateColumns = (rowSpan === 'auto' ? 'repeat(auto-fill, minmax(380px, 1fr))' : `repeat(${rowSpan}, minmax(0, 1fr))`);
      return {
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns,
        gap: gridGap
      }
    },
    formItemBlockStyle() {
      return {
        gridColumn: `1 / -1` // grid独占一行
      }
    },
    formModel() {
      const model = {}
      this.filters.forEach(f => model[f.col] = f.val)
      return model
    }
  },
  methods: {
    getStyle(filter, index) {
      const style = {
        order: (index + 1) * 10
      }
      if (filter.props && filter.props.quickFilterBlock !== false) {
        return {
          ...style,
          ...this.formItemBlockStyle
        }
      }
      return style
    },
    handleChange(filter) {
      const {props: {quickFilterConfig = {}}} = filter
      const {onChange} = quickFilterConfig
      if (!isFunction(onChange)) {
        return
      }
      const _this = this
      const filters = {}
      const refs = {}
      this.visibleFilters.forEach(filter => {
        const col = filter.col
        filters[col] = filter
        refs[col] = unwrapArr(_this.$refs[col])
      })
      const context = this.option.context
      onChange.call(context, {val: filter.val, model: this.formModel, filter: filter, filters: filters, refs: refs})
    },
    handleClick(filter) {
      const {props: {quickFilterConfig = {}}} = filter
      const {onClick} = quickFilterConfig
      if (!isFunction(onClick)) {
        return
      }
      const _this = this
      const filters = {}
      const refs = {}
      this.visibleFilters.forEach(filter => {
        const col = filter.col
        filters[col] = filter
        refs[col] = unwrapArr(_this.$refs[col])
      })
      const context = this.option.context
      onClick.call(context, {val: filter.val, model: this.formModel, filter: filter, filters: filters, refs: refs})
    }
  }
}
</script>

<style lang="scss">
.fc-quick-filter-form > .el-form-item {
  margin: 0 !important;
}
</style>
<style scoped lang="scss">
.fc-quick-filter-form {
  .fc-quick-filter-form-btns {
    margin-left: 10px;
  }
  :deep(.el-form-item__content > *) {
    flex: 1;
  }
}

</style>
