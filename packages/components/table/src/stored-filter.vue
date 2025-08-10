<template>
  <div class="fc-stored-btn">
    <el-dropdown @click="$emit('search')" :size="size">
      <el-button type="primary" :size="size">
        <span v-if="currentGroup">{{ currentGroup.label }}</span>
        <el-icon v-else>
          <Star/>
        </el-icon>&nbsp;
        <el-icon>
          <arrow-down/>
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item in storeGroups" :key="item.key"
                            :style="{color: (currentGroup && (item.key === currentGroup.key)) ? '#3f99f5 !important' : ''}"
                            @click="handleClick(item)">{{ item.label }}
          </el-dropdown-item>
          <!-- TODO 其它自定义存筛 -->
          <el-dropdown-item divided @click="toCustom">自定义</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script>
import {nextTick} from "vue"
import {dayjs, ElMessage} from "element-plus"
import {ArrowDown, Star} from "@element-plus/icons-vue"
import {
  assert,
  getBeginOfDate,
  getBeginOfMonth,
  getBeginOfWeek,
  isArray,
  isEmpty,
  isFunction, isNull, isObject
} from "../../../util/util.js"
import {buildFinalComponentConfig} from "../../mapping.js"
import FastTableOption from "../../../model.js"

export default {
  name: "stored-filter",
  components: {ArrowDown, Star},
  emits: ['search'],
  props: {
    filters: Array,
    size: String,
    tableOption: FastTableOption,
    columnConfig: Object
  },
  data() {
    return {
      storeGroups: [], // 存筛分组列表。元素格式: {label: '存筛名', filters: [{..}], editable: false, disabled: false, compatible: true}
      currentGroup: null
    }
  },
  mounted() {
    nextTick(() => {
      this.initCreateTimeFilter()
      // TODO 解析tableOption.storeFilters，构造开发者预定义的存筛项: 关键在于利用其中配置的conds构造filters
      // TODO 从localStorage加载用户定义的存筛项：关键在于兼容性标记
    })
  },
  watch: {
    'filters.length'(newLength) {
      if (newLength === 0) {
        this.currentGroup = null
      }
    }
  },
  methods: {
    getCustomConfig(col) {
      const {columnConfig} = this
      if (isObject(columnConfig) && isObject(columnConfig[col]) && isObject(columnConfig[col]['customConfig'])) {
        const {customConfig, tableColumnComponentName} = columnConfig[col]
        try {
          return buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'dynamic', this.tableOption)
        } catch (err) {
          console.error(err)
          return null;
        }
      }
      console.warn(`The column is invalid or filtering is not enabled: ${col}`)
      return null
    },
    initCreateTimeFilter() {
      const {createTimeField} = this.tableOption
      if (isEmpty(createTimeField)) {
        return
      }
      const getFilters = (type) => {
        const createTimeFilter = this.getCustomConfig(createTimeField)
        if (isNull(createTimeFilter)) {
          return []
        }
        const {props: {valueFormat}} = createTimeFilter
        const end = new Date()
        let start
        if (type === 'day') {
          start = getBeginOfDate(end)
        } else if (type === 'week') {
          start = getBeginOfWeek(end)
        } else if (type === 'month') {
          start = getBeginOfMonth(end)
        }
        createTimeFilter.val = [dayjs(start).format(valueFormat), dayjs(end).format(valueFormat)]
        return [createTimeFilter]
      }

      this.storeGroups.push({
        key: 'CurrentDay', label: '当天新建', filters: () => {
          return getFilters('day')
        }
      })
      this.storeGroups.push({
        key: 'CurrentWeek', label: '当周新建', filters: () => {
          return getFilters('week')
        }
      })
      this.storeGroups.push({
        key: 'CurrentMonth', label: '当月新建', filters: () => {
          return getFilters('month')
        }
      })
    },
    handleClick(group) {
      this.filters.length = 0 // important
      if (!this.currentGroup || this.currentGroup.key !== group.key) {
        const filters = isFunction(group.filters) ? group.filters.call(this.tableOption.context) : group.filters
        assert(isArray(filters), `the filters prop of group(${group.key}) is wrong type, it should be a array, or a function that return a array`)
        this.filters.push(...filters)
        this.currentGroup = group
      } else {
        this.currentGroup = null
      }
      this.$emit('search')
    },
    toCustom() {
      ElMessage.info('敬请期待..')
    }
  }
}
</script>

<style scoped lang="scss">
.fc-high-light {
  background-color: #9dd3ff;
}
</style>
