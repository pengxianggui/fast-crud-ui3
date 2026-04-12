<template>
  <div class="fc-stored-filter-manager">
    <div class="fc-stored-filter-manager-btns">
      <el-button :icon="Plus" type="primary" plain @click="addStoreGroup">{{ t('crud.filter.add') }}</el-button>
      <el-button type="success" plain @click="saveStoreGroup">{{ t('crud.save') }}</el-button>
    </div>
    <template v-for="g in groups">
      <el-card class="fc-stored-filter-item" shadow="hover" v-if="hiddenBuildIn === false || g.buildIn === false">
        <template #header>
          <div class="fc-stored-filter-item-header">
            <div style="display: flex">
              <el-input class="fc-stored-filter-item-label" :placeholder="t('crud.filter.groupNamePlaceholder')" v-model="g.label"
                        :disabled="g.buildIn"/>&nbsp;
              <el-alert type="warning" :closable="false" show-icon v-if="!g.compatible">{{ t('crud.filter.incompatibleFilter') }}
              </el-alert>
            </div>
            <el-button type="danger" link @click="delStoreGroup(g)" v-if="!g.buildIn">{{ t('crud.delete') }}</el-button>
          </div>
        </template>
        <div class="fc-dynamic-filter-list">
          <el-popover class="fc-stored-filter-item-cond" popper-style="max-width: none; width: auto; z-index: 3000"
                      v-for="(f, index) in g.filters" :key="f.col + '.' + index" :disabled="g.buildIn">
            <template v-slot:reference>
              <div class="fc-dynamic-filter-btns">
                <el-button link class="fc-dynamic-filter-open-btn">
                  {{ f.condMsg }}
                </el-button>
                <el-button link class="fc-dynamic-filter-del-btn" :icon="Close" v-if="!g.buildIn"
                           @click.stop="delConfig(index, g.filters)"></el-button>

                <span style="margin-right: 10px; color: #909090;">{{ t('crud.filter.and') }}</span>
              </div>
            </template>
            <component class="component" :is="f.component" v-model="f.val" v-bind="f.props" :teleported="false" @change="onChange(f)"
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
      {{ hiddenBuildIn ? t('crud.filter.show') : t('crud.filter.hide') }} {{ t('crud.filter.builtInFilterGroups') }}
    </el-button>
  </div>
</template>

<script>
import {Close, Plus} from "@element-plus/icons-vue";
import FastTableOption from '../../../model/fastTableOption.js'
import Opt from '../../../model/opt.js'
import {buildStoredFilterComponent, setCustomFilterGroups} from "./util.js";
import * as util from "../../../util/util.js";
import {ElMessage} from "element-plus";
import { useI18n } from 'vue-i18n'

export default {
  name: "stored-filter-manager",
  emits: ['ok'],
  setup() {
    const { t } = useI18n()
    return {
      t
    }
  },
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
  async created() {
    // 刷新条件显示
    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < this.groups[i].filters.length; j++) {
        await this.groups[i].filters[j].updateCondMsg()
      }
    }
  },
  methods: {
    onChange(filter) {
      filter.updateCondMsg()
    },
    async handleAddCond(col, storeGroup) {
      const filter = buildStoredFilterComponent(col, this.columnConfig, this.tableOption)
      if (!util.isEmpty(filter)) {
        await filter.updateCondMsg()
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
      ElMessage.success(this.t('crud.operation.saveSuccess'))
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
        display: flex;
        align-items: center;

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
