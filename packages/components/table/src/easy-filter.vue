<template>
  <div class="fc-easy-filter">
    <template v-if="activeFilter">
      <fast-select class="fc-easy-filter-column" :options="filters" v-model="activeFilterCol" label-key="label"
                   val-key="col"
                   :size="size"
                   :filterable="true"
                   @change="changeField"/>
      <component ref="easyFilterComp" class="fc-easy-filter-value" :is="activeFilter.component"
                 v-model="activeFilter.val"
                 v-bind="activeFilter.props"
                 :size="size"
                 @clear="handleClear"
                 @keydown.enter="handleEnter"/>
    </template>
  </div>
</template>

<script>
import {nextTick} from "vue";
import FastSelect from "../../select/src/fast-select.vue";
import {RefreshLeft, Search} from "@element-plus/icons-vue";
import {isEmpty, isFunction, isUndefined} from "../../../util/util.js";

export default {
  name: "easy-filter",
  components: {FastSelect},
  emits: ['search'],
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: () => 'small'
    }
  },
  computed: {
    RefreshLeft() {
      return RefreshLeft
    },
    Search() {
      return Search
    },
    activeFilter() {
      if (this.filters.length === 0 || isEmpty(this.activeFilterCol)) {
        return null
      }
      const activeFilter = this.filters.find(filter => filter.col === this.activeFilterCol)
      activeFilter.disabled = false // 启用此列
      return activeFilter
    }
  },
  data() {
    return {
      activeFilterCol: null
    }
  },
  created() {
    this.initActiveFilterCol()
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.easyFilterComp && isFunction(this.$refs.easyFilterComp.focus)) {
        setTimeout(() => {
          this.$refs.easyFilterComp.focus()
        }, 50) // 如果当前FastTable在ElDialog中,会因为visible之后的动画二导致渲染会稍晚一点, 只nextTick不够，这里稍等会会
      }
    })
  },
  watch: {
    'filters.length': function () {
      this.initActiveFilterCol()
    }
  },
  methods: {
    initActiveFilterCol() {
      if (!isEmpty(this.filters)) {
        const activeFilter = this.filters.find(f => f.disabled === false)
        this.activeFilterCol = isUndefined(activeFilter) ? this.filters[0].col : activeFilter.col
      }
    },
    changeField() {
      this.filters.map(filter => {
        filter.disabled = (filter.col !== this.activeFilterCol) // 保证只有activeFilter生效， 这样就不用清理切换之前的控件值了，使用体验更好
      })
    },
    handleClear() {
      nextTick(() => {
        this.$emit('search')
      })
    },
    handleEnter() {
      nextTick(() => {
        this.$emit('search')
      })
    }
  }
}
</script>

<style scoped lang="scss">
.fc-easy-filter {
  display: flex;

  .fc-easy-filter-column {
    width: 100px;

    :deep(.el-select__wrapper),
    :deep(.el-input__wrapper) {
      box-shadow: inset 0 1px 0 0 #DCDFE6, inset 0 -1px 0 0 #DCDFE6, inset 1px 0 0 0 #DCDFE6; // 阴影模拟边框, 无"右边框"
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  .fc-easy-filter-value {
    width: 280px;
  }

  .fc-easy-filter-value :deep(.el-input__wrapper),
  :deep(.fc-easy-filter-value.el-input__wrapper),
  :deep(.fc-easy-filter-value .el-select__wrapper) {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
}
</style>
