<template>
  <div class="fc-stored-filter-manager">
    <div class="fc-stored-filter-manager-btns">
      <el-button :icon="Plus" type="primary" plain @click="addStoreGroup">添加</el-button>
      <el-button type="success" plain @click="saveStoreGroup">保存</el-button>
    </div>
    <template v-for="g in groups">
      <el-card class="fc-stored-filter-item" shadow="hover" v-if="hiddenBuildIn === false || g.buildIn === false">
        <template #header>
          <div class="fc-stored-filter-item-header">
            <div style="display: flex">
              <el-input class="fc-stored-filter-item-label" placeholder="请输入组合名" v-model="g.label"
                        :disabled="g.buildIn"/>&nbsp;
              <el-alert type="warning" :closable="false" show-icon v-if="!g.compatible">此筛选组不兼容, 请修改
              </el-alert>
            </div>
            <el-button type="danger" link @click="delStoreGroup(g)" v-if="!g.buildIn">删除</el-button>
          </div>
        </template>
        <div class="fc-dynamic-filter-list">
          <el-popover class="fc-stored-filter-item-cond" popper-style="max-width: none; width: auto; z-index: 3000"
                      v-for="(f, index) in g.filters" :key="f.col + '.' + index" :disabled="g.buildIn">
            <template v-slot:reference>
              <div class="fc-dynamic-filter-btns">
                <el-button link class="fc-dynamic-filter-open-btn">
                  {{ label(f) }}
                </el-button>
                <el-button link class="fc-dynamic-filter-del-btn" :icon="Close" v-if="!g.buildIn"
                           @click.stop="delConfig(index, g.filters)"></el-button>
              </div>
            </template>
            <component class="component" :is="f.component" v-model="f.val" v-bind="f.props" :teleported="false"
                       v-if="f.opt !== Opt.NULL && f.opt !== Opt.NNULL && f.opt !== Opt.EMPTY && f.opt !== Opt.NEMPTY"/>
          </el-popover>

          <el-dropdown max-height="200px" @command="(col) => handleAddCond(col, g)" v-if="!g.buildIn">
            <el-link :icon="Plus"></el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="col in colsOption" :command="col.value">{{ col.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-card>
    </template>
    <el-button style="text-decoration: underline;" link @click="() => hiddenBuildIn = !hiddenBuildIn">
      {{ hiddenBuildIn ? '显示' : '隐藏' }}内置的组合筛选项
    </el-button>
  </div>
</template>

<script>
import {Close, Plus} from "@element-plus/icons-vue";
import FastTableOption, {Opt} from '../../../model.js'
import {label, getFilterComponent, setCustomFilterGroups} from "./util.js";
import * as util from "../../../util/util.js";
import {ElMessage} from "element-plus";

export default {
  name: "stored-filter-manager",
  emits: ['ok'],
  props: {
    tableOption: FastTableOption,
    columnConfig: Object,
    storeGroups: Array
  },
  data() {
    const groups = util.deepClone(this.storeGroups) // 避免修改外部
    groups.forEach(g => {
      if (util.isFunction(g.filters)) { // 瞬化某些filter
        g.filters = g.filters()
      }
    })
    return {
      hiddenBuildIn: true,
      groups: groups.sort((a, b) => a.buildIn - b.buildIn)
    }
  },
  computed: {
    Plus() {
      return Plus
    },
    Close() {
      return Close
    },
    Opt() {
      return Opt
    },
    colsOption() {
      return Object.entries(this.columnConfig).map(([col, config]) => {
        const {customConfig: {label}} = config
        return {value: col, label: label}
      })
    },
  },
  methods: {
    label,
    handleAddCond(col, storeGroup) {
      const filter = getFilterComponent(col, this.columnConfig, this.tableOption)
      if (!util.isEmpty(filter)) {
        storeGroup.filters.push(filter)
      }
    },
    delConfig(index, filters) {
      filters.splice(index, 1)
    },
    addStoreGroup() {
      this.groups.unshift({
        label: '',
        filters: [],
        buildIn: false,
        compatible: true
      })
    },
    /**
     * 删除存筛: 只能删除自定义
     */
    delStoreGroup(group) {
      this.groups = this.groups.filter(g => g !== group)
    },
    /**
     * 保存自定义存筛到localStorage中，注意: 只保存自定义的
     */
    saveStoreGroup() {
      const toBeSavedGroups = this.groups.filter(g => g.buildIn === false)
      const labels = this.groups.map(g => g.label)
      const duplicateLabel = labels.filter((l, i) => labels.indexOf(l) !== i)
      // check
      util.assertTip(util.isEmpty(duplicateLabel), '组合名重复,请修改:' + [...new Set(duplicateLabel)])
      for (let i = 0; i < toBeSavedGroups.length; i++) {
        const {label, filters} = toBeSavedGroups[i]
        util.assertTip(!util.isEmpty(label), '请填写组合名')
        util.assertTip(label.length <= 10, `组合名长度不得超过10:${label}`)
        util.assertTip(!util.isEmpty(filters), `请为“${label}”配置筛选项`)
        util.assertTip(filters.every(f => f.isEffective()), `“${label}”存在无效筛选项`)
      }
      setCustomFilterGroups(this.tableOption, toBeSavedGroups)
      ElMessage.success('保存成功')
      this.$emit('ok')
    }
  }
}
</script>

<style scoped lang="scss">
.fc-stored-filter-manager {
  .fc-stored-filter-manager-btns {
    margin-bottom: 20px;
  }

  .fc-stored-filter-item {
    margin: 10px 0;

    :deep(.fc-stored-filter-item-header) {
      display: flex;
      justify-content: space-between;
    }

    .fc-stored-filter-item-label {
      width: 200px;
    }


    .fc-dynamic-filter-list {
      display: flex;
      flex-wrap: wrap;
      column-gap: 5px;
      align-items: center;

      .fc-dynamic-filter-btns {
        &:hover {
          .fc-dynamic-filter-open-btn {
            text-decoration: underline;
          }

          .fc-dynamic-filter-del-btn {
            //display: inline-block;
            visibility: visible;
          }
        }
      }

      .fc-dynamic-filter-open-btn {
        color: gray;
        padding: 3px 5px;
        border: 1px solid #cacaca;
        border-radius: 3px;
        font-size: 15px !important;
      }

      .fc-dynamic-filter-del-btn {
        visibility: hidden;
        margin-left: 5px;
        padding: 5px 0;
        color: #8d4343;
        font-size: 13px !important;
      }

      .fc-dynamic-filter-clear-btn {
        font-size: 13px !important;
        margin-left: 3px;
      }
    }

    .component {
      margin: 10px 0;
      max-width: 420px;
      max-height: 300px;
      overflow: auto;

      :deep(.fc-checkbox-group) {
        display: block;
      }

      :deep(.fc-checkbox-group .el-checkbox) {
        display: block;
      }

    }
  }
}
</style>
