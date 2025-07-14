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
                            @click="() => item.click(item)">{{ item.label }}
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
import {getBeginOfDate, getBeginOfMonth, getBeginOfWeek, isEmpty} from "../../../util/util.js"
import {buildFinalComponentConfig} from "../../mapping.js"
import FastTableOption from "../../../model.js"

export default {
  name: "stored-filter",
  components: {ArrowDown, Star},
  emits: ['search'],
  props: {
    filters: Array,
    size: String,
    createTimeField: String,
    tableOption: FastTableOption
  },
  data() {
    return {
      createTimeFilter: null,
      storeGroups: [], // 存筛分组列表
      currentGroup: null
    }
  },
  mounted() {
    nextTick(() => {
      this.initCreateTimeFilter()
    })
    // TODO 从localStorage加载数据初始化存筛
  },
  watch: {
    'filters.length'(newLength) {
      if (newLength === 0) {
        this.currentGroup = null
      }
    }
  },
  methods: {
    initCreateTimeFilter() {
      const {createTimeField} = this
      if (isEmpty(createTimeField)) {
        return
      }
      // 构造静态存筛, by createTimeField
      this.createTimeFilter = buildFinalComponentConfig(
          {
            col: this.createTimeField,
            label: '创建时间',
            props: {type: 'datetime'}
          }, 'FastTableColumnDatePicker', 'query', 'dynamic', this.tableOption)
      this.storeGroups.push({
        key: 'CurrentDay', label: '当天新建', click: (item) => {
          this.searchByCreateTime(this.createTimeFilter, item, 'day')
        }
      })
      this.storeGroups.push({
        key: 'CurrentWeek', label: '当周新建', click: (item) => {
          this.searchByCreateTime(this.createTimeFilter, item, 'week')
        }
      })
      this.storeGroups.push({
        key: 'CurrentMonth', label: '当月新建', click: (item) => {
          this.searchByCreateTime(this.createTimeFilter, item, 'month')
        }
      })
    },
    searchByCreateTime(createTimeFilter, item, type) {
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
      this.emitSearch([createTimeFilter], item)
    },
    emitSearch(filters, item) {
      this.filters.length = 0 // important
      if (!this.currentGroup || this.currentGroup.key !== item.key) {
        this.filters.push(...filters)
        this.currentGroup = item
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
