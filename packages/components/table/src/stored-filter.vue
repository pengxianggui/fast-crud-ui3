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
          <el-dropdown-item v-for="item in storeGroups" :key="item.label"
                            :style="{color: (currentGroup && (item.label === currentGroup.label)) ? '#3f99f5 !important' : ''}"
                            :disabled="!item.compatible"
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
import {dayjs} from "element-plus"
import {ArrowDown, Star} from "@element-plus/icons-vue"
import * as util from "../../../util/util.js"
import FastTableOption from "../../../model.js"
import {openDialog} from "../../../util/dialog.js";
import StoredFilterManager from "./stored-filter-manager.vue";
import {buildFilterGroups, getFilterComponent, getCustomFilterGroups} from "./util.js";

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
      storeGroups: [], // 存筛分组列表。元素格式: {label: '存筛名', filters: [{..}], buildIn: false, compatible: true}
      currentGroup: null
    }
  },
  mounted() {
    nextTick(() => this.init())
  },
  watch: {
    'filters.length'(newLength) {
      if (newLength === 0) {
        this.currentGroup = null
      }
    }
  },
  methods: {
    init() {
      this.storeGroups.length = 0
      this.initCreateTimeFilter() // 基于创建时间构造内置存筛
      this.initDevCustomFilter() // 构造开发者预定义存筛
      this.initUserCustomFilter() // 构造用户自定义存筛
      this.storeGroups.sort((a, b) => b.compatible - a.compatible)
    },
    initCreateTimeFilter() {
      const {createTimeField} = this.tableOption
      if (util.isEmpty(createTimeField)) {
        return
      }
      const getFilters = (type) => {
        const createTimeFilter = getFilterComponent(createTimeField, this.columnConfig, this.tableOption)
        if (util.isNull(createTimeFilter)) {
          return []
        }
        const {props: {valueFormat}} = createTimeFilter
        const end = new Date()
        let start
        if (type === 'day') {
          start = util.getBeginOfDate(end)
        } else if (type === 'week') {
          start = util.getBeginOfWeek(end)
        } else if (type === 'month') {
          start = util.getBeginOfMonth(end)
        }
        createTimeFilter.val = [dayjs(start).format(valueFormat), dayjs(end).format(valueFormat)]
        return [createTimeFilter]
      }

      this.storeGroups.push({
        label: '当天新建', buildIn: true, compatible: true, filters: () => {
          return getFilters('day')
        }
      })
      this.storeGroups.push({
        label: '当周新建', buildIn: true, compatible: true, filters: () => {
          return getFilters('week')
        }
      })
      this.storeGroups.push({
        label: '当月新建', buildIn: true, compatible: true, filters: () => {
          return getFilters('month')
        }
      })
    },
    initDevCustomFilter() {
      const {condGroups = []} = this.tableOption
      const filterGroups = buildFilterGroups(this.tableOption, this.columnConfig, condGroups, true)
      this.storeGroups.push(...filterGroups)
    },
    initUserCustomFilter() {
      const filterGroups = getCustomFilterGroups(this.tableOption, this.columnConfig)
      this.storeGroups.push(...filterGroups)
    },
    handleClick(group) {
      this.filters.length = 0 // important
      if (!this.currentGroup || this.currentGroup.label !== group.label) {
        const filters = util.isFunction(group.filters) ? group.filters.call(this.tableOption.context) : group.filters
        util.assert(util.isArray(filters), `the filters prop of group(${group.label}) is wrong type, it should be a array, or a function that return a array`)
        this.filters.push(...filters)
        this.currentGroup = group
      } else {
        this.currentGroup = null
      }
      this.$emit('search')
    },
    toCustom() {
      openDialog({
        component: StoredFilterManager,
        props: {
          tableOption: this.tableOption,
          columnConfig: this.columnConfig,
          storeGroups: this.storeGroups
        },
        dialogProps: {
          title: '自定义组合筛选',
          width: '60%'
        }
      }).then(() => {
        this.init()
      })

    }
  }
}
</script>

<style scoped lang="scss">
.fc-high-light {
  background-color: #9dd3ff;
}
</style>
