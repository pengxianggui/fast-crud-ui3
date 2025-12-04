<template>
  <div class="fc-dynamic-filter-form">
    <div class="fc-dynamic-filter-sort-btn">
      <el-radio v-model="asc" label="" border :size="size">不排序</el-radio>
      <el-radio v-model="asc" :label="true" border :size="size">升序</el-radio>
      <el-radio v-model="asc" :label="false" border :size="size">降序</el-radio>
    </div>
    <div class="fc-dynamic-filter-component-wrapper">
      <div class="title">输入过滤：</div>
      <div class="fc-dynamic-filter-component">
        <component :is="localFilter.component" v-model="localFilter.val" v-bind="localFilter.props"/>
      </div>
    </div>
    <div class="fc-dynamic-filter-distinct-wrapper">
      <div class="title">
        <div>
          <span>去重筛选：</span>
          <el-checkbox size="small" type="info" v-model="reuseCond" @change="distinctLoad">复用已生效的条件
          </el-checkbox>
        </div>
        <el-button link
                   :style="{'color': distinctOptionAsc === '' ? 'gray': '#409EFF', 'padding': 0}"
                   :icon="distinctOptionsAscIcon"
                   @click="() => distinctOptionAsc = !distinctOptionAsc"
                   v-if="distinctLoaded"></el-button>
      </div>
      <!-- 由于distinct查询可能比较慢, 因此由用户点击触发展示 -->
      <div class="fc-dynamic-filter-distinct" v-loading="distinctLoading">
        <!-- distinct 勾选项 -->
        <el-input size="small" v-model="distinctOptionFilterKeyword" :clearable="true" placeholder="输入过滤.."
                  v-if="distinctLoaded"></el-input>
        <fast-checkbox-group :options="distinctFilteredOptions" :show-chose-all="false"
                             class="fc-dynamic-filter-distinct-options"
                             v-model="distinctCheckedValue"
                             v-if="distinctLoaded"></fast-checkbox-group>
        <div style="display: flex; justify-content: center;" v-if="!distinctLoaded">
          <el-button link style="color: gray;" @click="distinctLoad">请点击加载</el-button>
        </div>
        <el-empty v-if="distinctLoaded && distinctOptions.length === 0">
          <template #image><span></span></template>
        </el-empty>
      </div>
    </div>
    <div class="fc-dynamic-filter-form-btn">
      <el-button :size="size" @click="getEmpty">查空值</el-button>
      <el-button :size="size" @click="getNotEmpty">查非空值</el-button>
      <span style="flex: 1;"></span>
      <el-button type="primary" :size="size" @click="ok">确认</el-button>
      <el-button :size="size" @click="close">关闭</el-button>
    </div>
  </div>
</template>

<script>
import FastTableOption, {FilterComponentConfig, Query, Opt} from "../../../model"
import {escapeValToLabel} from "../../../util/escape.js"
import {isEmpty, isObject, toStr} from "../../../util/util"
import FastCheckboxGroup from "../../checkbox-group/src/fast-checkbox-group.vue"
import {Sort, SortUp, SortDown} from "@element-plus/icons-vue"

export default {
  name: "dynamic-filter-form",
  components: {FastCheckboxGroup},
  emits: ['ok', 'cancel'],
  props: {
    option: FastTableOption,
    filter: FilterComponentConfig,
    order: [String],
    conds: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    console.log(this.localFilter)
  },
  computed: {
    size() {
      return this.option.style.size
    },
    distinctOptionsAscIcon() {
      return this.distinctOptionAsc === '' ? Sort : (this.distinctOptionAsc === true ? SortUp : SortDown)
    },
    distinctFilteredOptions() {
      const {distinctOptionFilterKeyword, distinctOptionAsc} = this
      return this.distinctOptions.filter(item => isEmpty(distinctOptionFilterKeyword) || toStr(item.label).indexOf(distinctOptionFilterKeyword) !== -1)
          .sort((a, b) => {
            const label1 = toStr(a.label), label2 = toStr(b.label);
            return distinctOptionAsc ? label1.localeCompare(label2) : label2.localeCompare(label1)
          })
    }
  },
  data() {
    const localFilter = new FilterComponentConfig({...this.filter})
    return {
      localFilter: localFilter,
      asc: this.order === 'asc' ? true : (this.order === 'desc' ? false : ''),
      reuseCond: true, // 复用已生效的条件
      distinctLoaded: false, // 是否distinct query loaded
      distinctLoading: false, // 是否distinct query loading中
      distinctOptions: [], // 检索出的distinct选项
      distinctOptionAsc: '', // distinct选项排序, 默认不排序
      distinctOptionFilterKeyword: null, // distinct选项过滤关键词
      distinctCheckedValue: [], // 勾选的distinct值
      distinctAbortCtrl: null // distinct请求终止控制器
    }
  },
  methods: {
    distinctLoad() {
      this.distinctLoading = true;
      this.distinctAbortCtrl = new AbortController();
      const {col, component, props} = this.localFilter;

      const distinctQuery = new Query().setDistinct().setCols([col]);
      if (this.reuseCond) {
        distinctQuery.setConds(this.conds);
      }
      this.option._list(distinctQuery, {signal: this.distinctAbortCtrl.signal}).then((res) => {
        if (res.length > 1000) { // 为防止页面卡死, 最多显示1000个
          res.splice(1001);
        }
        const distinctValues = res.filter(item => isObject(item) && item.hasOwnProperty(col)).map(item => item[col])
        this.distinctOptions.length = 0 // 清空
        distinctValues.map((v) => {
          escapeValToLabel(component, v, props).then(label => {
            this.distinctOptions.push({
              value: v,
              label: label
            })
          }).catch(err => {
            console.error(err)
            this.distinctOptions.push({
              value: v,
              label: v
            })
          })
        })
        this.distinctLoaded = true;
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.distinctLoading = false;
      })
    },
    getEmpty() {
      this.$emit('ok', {
        filter: new FilterComponentConfig({...this.localFilter, opt: Opt.EMPTY}),
        order: {
          col: this.localFilter.col,
          asc: this.asc
        }
      })
    },
    getNotEmpty() {
      this.$emit('ok', {
        filter: new FilterComponentConfig({...this.localFilter, opt: Opt.NEMPTY}),
        order: {
          col: this.localFilter.col,
          asc: this.asc
        }
      })
    },
    ok() {
      let filterConfig;
      if (this.distinctCheckedValue.length > 0) {
        filterConfig = {
          component: 'fast-checkbox-group',
          col: this.localFilter.col,
          label: this.localFilter.label,
          opt: 'in',
          val: this.distinctCheckedValue,
          disabled: false,
          props: {
            options: this.distinctOptions,
            labelKey: 'label',
            valKey: 'value',
            showChoseAll: true
          }
        }
      } else {
        filterConfig = {...this.localFilter};
      }
      this.$emit('ok', {
        filter: new FilterComponentConfig(filterConfig),
        order: {
          col: this.localFilter.col,
          asc: this.asc
        }
      })
    },
    close() {
      this.$emit('cancel')
    }
  },
  beforeUnmount() {
    if (this.distinctAbortCtrl) {
      this.distinctAbortCtrl.abort()
    }
  }
}
</script>

<style scoped lang="scss">
.fc-dynamic-filter-form {
  & > * {
    margin-bottom: 10px;
  }

  & .title {
    margin-bottom: 5px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .fc-dynamic-filter-sort-btn, .fc-dynamic-filter-component {
    display: flex;
    justify-content: space-between;

    & > * {
      flex: 1;
    }
  }

  .fc-dynamic-filter-component-wrapper {
    margin: 20px 0;
  }

  .fc-dynamic-filter-distinct {
    border: 1px solid #e1e1e1;
    padding: 10px;
    overflow: auto;
    max-height: 300px;

    .fc-dynamic-filter-distinct-options {
      margin-top: 10px;

      :deep(.el-checkbox) {
        display: block;
      }
    }
  }

  .fc-dynamic-filter-form-btn {
    display: flex;
  }
}

</style>
