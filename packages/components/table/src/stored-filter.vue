<template>
  <div class="fc-stored-btn">
    <el-dropdown :size="size">
      <el-button type="primary" :size="size">
        <span v-if="showLabel">{{ showLabel }}</span>
        <el-icon v-else>
          <Star/>
        </el-icon>&nbsp;
        <el-icon>
          <arrow-down/>
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <!--          <el-dropdown-item @click="clear">清空</el-dropdown-item>-->
          <el-dropdown-item v-for="item in storeGroups" :key="item.label"
                            :style="{color: (groupLabels.indexOf(item.label) > -1) ? '#3f99f5 !important' : ''}"
                            :disabled="!item.compatible"
                            @click="handleClick(item, $event)">
            <el-icon v-show="groupLabels.indexOf(item.label) > -1">
              <Select/>
            </el-icon>
            <span>{{ item.label }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="toCustom">自定义</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script>
import {nextTick} from "vue"
import {dayjs} from "element-plus"
import {ArrowDown, Star, Select} from "@element-plus/icons-vue"
import * as util from "../../../util/util.js"
import FastTableOption from "../../../model/fastTableOption.js"
import {openDialog} from "../../../util/dialog.js";
import StoredFilterManager from "./stored-filter-manager.vue";
import {buildFilterGroups, buildStoredFilterComponent, getCustomFilterGroups} from "./util.js"

export default {
  name: "stored-filter",
  components: {ArrowDown, Star, Select},
  emits: ['change', 'update:modelValue'],
  props: {
    // 存筛label名组成的数组, 表示勾选项
    groupLabels: Array,
    size: String,
    tableOption: FastTableOption,
    columnConfig: Object
  },
  data() {
    return {
      storeGroups: [], // 存筛分组列表。元素格式: {label: '存筛名', filters: [{..}], buildIn: false, compatible: true}
    }
  },
  computed: {
    showLabel() {
      if (util.isEmpty(this.groupLabels)) {
        return ''
      }
      const firstLabel = this.groupLabels[0]
      return firstLabel + (this.groupLabels.length > 1 ? `+${this.groupLabels.length - 1}` : '')
    }
  },
  mounted() {
    nextTick(() => this.init())
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
        const createTimeFilter = buildStoredFilterComponent(createTimeField, this.columnConfig, this.tableOption)
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
    handleClick(group, e) {
      const idx = this.groupLabels.indexOf(group.label)
      if (idx > -1) { // 取消
        this.groupLabels.splice(idx, 1)
      } else {
        if (!(e.ctrlKey || e.metaKey)) { // 支持按住ctrl/command点击可以选多个
          this.groupLabels.length = 0
        }
        this.groupLabels.push(group.label)
      }
      this.$emit('change')
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

    },
    clear() {
      this.groupLabels.length = 0
      this.$emit('change')
    },
    /**
     * 获取生效的筛选项, 通过勾选的存筛组(groupLabels)，从storeGroups中解析出生效的filters并返回
     * @return {*[]}
     */
    getStoreFilters() {
      const effectFilters = []
      if (util.isEmpty(this.storeGroups)) {
        this.init()
      }
      for (const g of this.storeGroups) {
        if (this.groupLabels.indexOf(g.label) === -1) {
          continue
        }
        const filters = util.isFunction(g.filters) ? g.filters.call(this.tableOption.context) : g.filters
        util.assert(util.isArray(filters), `the filters prop of group(${g.label}) is wrong type, it should be a array, or a function that return a array`)
        effectFilters.push(...filters)
      }
      return effectFilters
    }
  }
}
</script>
