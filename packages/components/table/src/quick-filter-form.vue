<template>
  <el-form ref="quickFilterForm" :inline="true" :label-width="formLabelWidth" class="fc-quick-filter-form"
           :style="formStyle">
    <el-form-item v-for="filter in visibleFilters"
                  :key="filter.col"
                  :prop="filter.col"
                  :label="filter.label + ':'"
                  :style="filter.props && filter.props.quickFilterBlock !== false ? formItemBlockStyle : ''"
                  :class="{'fc-block': filter.props && filter.props.quickFilterBlock !== false}"
                  class="fc-quick-filter-form-item">
      <component :size="size" :is="filter.component" v-model="filter.val" v-bind="filter.props"/>
    </el-form-item>
    <slot></slot>
  </el-form>
</template>

<script>
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import {buildGridTemplateAreas} from "../../../util/util.js";

export default {
  name: "quick-filter-form",
  components: {ArrowDown, ArrowUp},
  props: {
    formLabelWidth: {
      type: String,
      default: () => 'auto'
    },
    filters: {
      type: Array,
      default: () => []
    },
    rowSpan: {
      type: Number,
      default: () => 3
    },
    gridGap: {
      type: String,
      default: () => '10px 20px'
    },
    size: {
      type: String,
      default: () => 'small'
    }
  },
  data() {
    return {
      showNum: 3, // 收缩展示数量
      showFormItems: [] // 显示的formItem, 元素对象格式为 {block: Boolean}
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
      const gridTemplateAreas = buildGridTemplateAreas(this.rowSpan, this.showFormItems)
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${this.rowSpan}, 1fr)`,
        gridTemplateAreas: gridTemplateAreas,
        gap: this.gridGap
      }
    },
    formItemBlockStyle() {
      return {
        gridColumn: `span ${this.rowSpan}`
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.quickFilterForm) {
        const formItemEls = this.$refs.quickFilterForm.$el.querySelectorAll(".el-form-item")
        this.showFormItems = Array.prototype.map.call(formItemEls, e => {
          return {
            block: e.classList.contains('fc-block')
          }
        })
      }
    })
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
