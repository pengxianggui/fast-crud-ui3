<template>
  <el-form :inline="true" :label-width="formLabelWidth" class="fc-quick-filter-form" :style="formStyle">
    <el-form-item v-for="filter in visibleFilters"
                  :key="filter.col"
                  :prop="filter.col"
                  :label="filter.label + '：'"
                  :style="filter.props && filter.props.quickFilterBlock !== false ? formItemBlockStyle : ''"
                  class="fc-quick-filter-form-item">
      <component :size="size" :is="filter.component" v-model="filter.val" v-bind="filter.props"/>
    </el-form-item>
    <slot></slot>
    <div class="fc-quick-filter-form-btns" v-if="toggleEnable">
      <el-button link :size="size" @click="expColl" v-if="filters.length > toggleNum">
        <span>{{ expand ? '收起' : '展开' }}</span>
        <el-icon>
          <ArrowUp v-if="expand"/>
          <ArrowDown v-else/>
        </el-icon>
      </el-button>
    </div>
  </el-form>
</template>

<script>
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";

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
    toggleEnable: {
      type: Boolean,
      default: false
    },
    toggleNum: {
      type: Number,
      default: 4
    },
    rowSpan: {
      type: Number,
      default: 3
    },
    size: {
      type: String,
      default: () => 'small'
    }
  },
  data() {
    return {
      showNum: 3, // 收缩展示数量
      expand: false // 展开？
    }
  },
  computed: {
    /**
     * quickFilterBlock的独占一行且排前面。注意: 必须浅拷贝
     * @return {*[]}
     */
    visibleFilters() {
      const {toggleEnable, expand, filters = []} = this;
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
      if (!toggleEnable) {
        return filters
      }
      return expand ? filters : filters.slice(0, this.showNum);
    },
    formStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${this.rowSpan}, 1fr)`,
        gap: '10px 20px'
      }
    },
    formItemBlockStyle() {
      return {
        gridColumn: `span ${this.rowSpan}`
      }
    }
  },
  methods: {
    expColl() {
      this.expand = !this.expand;
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
}

</style>
