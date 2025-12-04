<template>
  <div class="fc-fast-table">
    <div ref="title" class="fc-fast-table-title" v-if="showTitle && option.title">{{ option.title }}</div>
    <div ref="quick" class="fc-quick-filter-wrapper" :style="quickFilterWrapperStyle" v-if="queryable">
      <!-- 快筛 -->
      <quick-filter-form ref="quickForm" :filters="quickFilters" :option="option">
        <slot name="quickFilter" v-bind="scopeParam"></slot>
      </quick-filter-form>
    </div>
    <div ref="operation" class="fc-fast-table-operation-bar">
      <div class="fc-operation-filter" v-if="queryable">
        <!-- 简筛区 -->
        <easy-filter :filters="easyFilters" :size="option.style.size" @search="pageLoad"/>
        <el-button type="primary" class="fc-easy-filter-btn" :size="option.style.size" :icon="Search"
                   @click="pageLoad"/>
        <el-button type="info" plain :size="option.style.size" :icon="RefreshLeft" @click="resetFilter"/>
        <!-- 存筛区 -->
        <stored-filter class="fc-stored-btn-wrapper"
                       ref="storedFilter"
                       :group-labels="storedLabels"
                       :table-option="option"
                       :column-config="columnConfig"
                       :size="option.style.size"
                       @change="pageLoad"/>
      </div>
      <div class="fc-fast-table-expand-button">
        <slot name="button" v-bind="scopeParam"></slot>
      </div>
      <!-- 按钮功能区 -->
      <div class="fc-fast-table-operation-btn">
        <template v-if="status === 'normal'">
          <el-button :size="option.style.size" @click="toInsert"
                     v-if="insertable">新建
          </el-button>
          <el-button type="danger" plain :size="option.style.size" @click="deleteRow"
                     v-if="deletable">删除
          </el-button>
        </template>
        <template v-if="(updatable && status === 'update') || (insertable && status === 'insert')">
          <el-button type="danger" plain @click="removeNewRows" v-if="status === 'insert' && editRows.length > 0">移除
          </el-button>
          <el-button type="primary" :size="option.style.size" @click="saveEditRows">保存</el-button>
          <el-button :size="option.style.size" @click="toInsert" v-if="status === 'insert' && insertable">继续新建
          </el-button>
          <el-button :size="option.style.size" @click="cancelEditStatus">取消</el-button>
        </template>
        <!-- 下拉按钮-更多 -->
        <el-dropdown class="fc-fast-table-operation-more" :size="option.style.size" v-if="showMoreBtn">
          <el-button type="primary" plain :size="option.style.size">
            <span>更多</span>
            <el-icon class="el-icon--right">
              <ArrowDown/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="activeBatchEdit" v-if="updatable">
                <el-icon>
                  <Edit/>
                </el-icon>
                <span>批量编辑</span>
              </el-dropdown-item>
              <!-- TODO 1.6 批量修改: 指定一些记录，批量将某些字段修改为指定值 -->
              <!--  <el-dropdown-item @click="activeBatchUpdate" >批量修改</el-dropdown-item>-->
              <el-dropdown-item @click="exportData" v-if="exportable">
                <el-icon>
                  <Download/>
                </el-icon>
                <span>导出</span>
              </el-dropdown-item>
              <template v-for="button in moreButtons">
                <el-dropdown-item :disabled="getBoolVal(button.disable, false)"
                                  @click="() => executeInContext(button.click)"
                                  v-if="getBoolVal(button.showable, true)">
                  <el-icon v-if="button.icon">
                    <component :is="button.icon"/>
                  </el-icon>
                  <span>{{ button.label }}</span>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div ref="dynamic" class="fc-dynamic-filter-wrapper">
      <!-- 动筛列表 -->
      <dynamic-filter-list :filters="dynamicFilters" :size="option.style.size" @search="pageLoad"></dynamic-filter-list>
    </div>
    <div class="fc-fast-table-wrapper">
      <el-table v-bind="$attrs"
                :data="list"
                ref="table"
                :row-style="rowStyle"
                highlight-current-row
                @current-change="handleCurrentChange"
                @row-click="handleRowClick"
                @row-dblclick="handleRowDblclick"
                @select="handleSelect"
                @selection-change="handleSelectionChange"
                @select-all="handleSelectAll"
                v-loading="loading"
                :key="tableKey"
                :height="heightTable"
                :size="option.style.size"
                border>
        <el-table-column type="selection" width="55" v-if="enableMulti"/>
        <el-table-column label="序号" :min-width="indexWith" v-if="enableIndex">
          <template #default="{ $index }">
            {{ $index + 1 + pageQuery.size * (pageQuery.current - 1) }}
          </template>
        </el-table-column>
        <slot></slot>
      </el-table>
    </div>
    <div ref="pagination" class="fc-pagination-wrapper">
      <div class="fc-footer-wrapper">
        <div class="fc-check-tip" v-if="queryable && checkedRows.length > 0">
          <el-link underline="always" @click="clearCheckedRows">清除</el-link>
          <el-text>已勾选的</el-text>
          <el-link underline="always" @click="viewCheckedRows">{{ checkedRows.length }}</el-link>
          <el-text>条记录</el-text>
        </div>
        <slot name="foot" v-bind="scopeParam"></slot>
      </div>
      <el-pagination v-model:page-size="pageQuery.size"
                     v-model:current-page="pageQuery.current"
                     :page-sizes="option.pagination['page-sizes']"
                     :total="total"
                     @current-change="pageLoad"
                     @size-change="() => pageLoad()"
                     :layout="option.pagination.layout"
                     v-if="queryable"></el-pagination>
    </div>
  </div>
</template>

<script>
import {nextTick} from "vue"
import {ElMessage, ElMessageBox} from 'element-plus'
import {remove} from 'lodash-es'
import QuickFilterForm from "./quick-filter-form.vue"
import EasyFilter from "./easy-filter.vue"
import StoredFilter from "./stored-filter.vue"
import DynamicFilterForm from "./dynamic-filter-form.vue"
import DynamicFilterList from "./dynamic-filter-list.vue"
import RowForm from "./row-form.vue"
import RowConfirm from "./RowConfirm.vue"
import {PageQuery} from '../../../model'
import FastTableOption from "../../../model"
import {
  calLength,
  getFullHeight, getInnerHeight,
  ifBlank,
  isBoolean,
  isEmpty,
  isFunction,
  isNull,
  isNumber,
  noRepeatAdd
} from "../../../util/util"
import * as cache from '../../../util/cache.js'
import {getEditConfig, iterBuildComponentConfig, rowValid, toTableRow, buildParamForExport, isFatRow} from "./util"
import {openDialog} from "../../../util/dialog"
import {buildFinalQueryComponentConfig} from "../../mapping"
import {ArrowDown, Download, Edit, RefreshLeft, Search} from "@element-plus/icons-vue";
import {post} from "../../../util/http.js";
import * as util from "../../../util/util.js";

export default {
  name: "FastTable",
  components: {ArrowDown, Download, Edit, QuickFilterForm, EasyFilter, StoredFilter, DynamicFilterList},
  emits: ['currentChange', 'select', 'selectionChange', 'selectAll', 'rowClick', 'rowDblclick'],
  props: {
    option: {
      type: FastTableOption,
      required: true
    },
    data: { // 初始化数据(必须是fatRow)
      type: Array,
      default: () => [],
      validator: (value) => util.isArray(value) && value.every(row => isFatRow(row))
    }
  },
  computed: {
    RefreshLeft() {
      return RefreshLeft
    },
    Search() {
      return Search
    },
    showTitle() {
      return this.getBoolVal(this.option.showTitle, true)
    },
    queryable() {
      return this.getBoolVal(this.option.queryable, true)
    },
    insertable() {
      return this.getBoolVal(this.option.insertable, true)
    },
    updatable() {
      return this.getBoolVal(this.option.updatable, true)
    },
    deletable() {
      return this.getBoolVal(this.option.deletable, true)
    },
    exportable() {
      return this.getBoolVal(this.option.exportable, true)
    },
    enableDblClickEdit() {
      return this.getBoolVal(this.option.enableDblClickEdit, true)
    },
    enableMulti() {
      return this.getBoolVal(this.option.enableMulti, true)
    },
    enableIndex() {
      return this.getBoolVal(this.option.enableIndex, false)
    },
    enableColumnFilter() {
      return this.getBoolVal(this.option.enableColumnFilter, true)
    },
    enableFilterCache() {
      return this.getBoolVal(this.option.enableFilterCache, true)
    },
    lazyLoad() {
      return this.getBoolVal(this.option.lazyLoad, false)
    },
    // 状态: normal-常规状态; insert-新增状态; update-编辑状态
    status() {
      const {editRows} = this;
      if (editRows.length === 0) {
        return 'normal';
      }
      if (editRows.every(r => r.status === 'update')) {
        return 'update';
      } else if (editRows.every(r => r.status === 'insert')) {
        return 'insert';
      } else {
        return 'normal';
      }
    },
    // 快筛区域样式: 控制当快筛区无内容时,css隐藏快筛区
    quickFilterWrapperStyle() {
      const filtersEmpty = !this.quickFilters || this.quickFilters.length === 0
      let slotEmpty = true
      if (this.$slots.quickFilter) {
        const slotContent = this.$slots.quickFilter(this.scopeParam)
        slotEmpty = !slotContent || slotContent.length === 0
      }
      return {
        display: filtersEmpty && slotEmpty ? 'none' : 'block'
      }
    },
    indexWith() {
      const currentPageMaxIndex = this.pageQuery.current * this.pageQuery.size
      const width = calLength(currentPageMaxIndex) + 40
      return width <= 60 ? 60 : width
    },
    // 行样式
    rowStyle() {
      return {
        height: this.option.style.bodyRowHeight
      }
    },
    // table表格高度
    heightTable() {
      if (this.$attrs.hasOwnProperty('height')) { // 自定义最高优先级
        return this.$attrs.height;
      }
      return this.tableFlexHeight;
    },
    // 表格级别的slot向上透传的统一参数
    scopeParam() {
      const {choseRow, checkedRows, editRows, pageQuery} = this
      return {
        query: pageQuery,
        size: this.option.style.size,
        choseRow: choseRow,
        checkedRows: checkedRows,
        editRows: editRows
      }
    },
    // 是否展示“更多”下拉菜单按钮
    showMoreBtn() {
      return this.updatable || this.exportable || !util.isEmpty(this.moreButtons)
    },
    // “更多”按钮扩展
    moreButtons() {
      return this.option.moreButtons
    },
    // 处于编辑激活状态的行,包括insert和update
    editRows() {
      return this.list.filter(r => r.status !== 'normal')
    }
  },
  data() {
    const size = this.option.pagination.size;
    const pageQuery = new PageQuery(1, size);
    pageQuery.extra = this.option.condExtra
    if (!ifBlank(this.option.sortField)) {
      pageQuery.addOrder(this.option.sortField, !this.option.sortDesc);
    }
    return {
      heightObserver: new ResizeObserver(() => this.calTableHeight()), // 表格高度重算监听器(dom级别)和窗口resize不冲突,互为弥补
      tableKey: 0, // 用于前端刷新表格
      loading: false, // 表格数据是否正加载中
      choseRow: null, // 当前选中的行记录
      checkedRows: [], // 代表多选时勾选的行记录
      pageQuery: pageQuery, // 分页查询构造参数
      columnConfig: {}, // 列对应的配置。key: column prop属性名, value为通过fast-table-column*定义的属性(外加tableColumnComponentName属性)
      quickFilters: [], // 快筛配置
      easyFilters: [], // 简筛配置
      dynamicFilters: [], // 动筛配置
      storedLabels: [], // 勾选的存筛组标签名
      list: this.data, // 表格当前页的数据, 不单纯有业务数据, 还有配置数据(用于实现行内、弹窗表单)
      total: 0, // 表格总数
      tableFlexHeight: null, //表格的弹性高度(动态计算值), 初始值是null非常重要, 如果内部计算出现问题外部又没自定义高度,相当于没有设置height值, 默认展示效果
    }
  },
  provide() {
    return {
      openDynamicFilterForm: this.openDynamicFilterForm, // 提供给fast-table-column* 触发创建动筛的能力
      tableStyle: this.option.style, // 提供给fast-table-column显示高度、尺寸等配置
      context: this.option.context // 提供给fast-table-column* 获取上下文信息
    }
  },
  created() {
    this.option.ref = this // important: 后续很多逻辑需要用到, 借助option即可获取组件中的一些数据
  },
  async mounted() {
    this.buildComponentConfig() // 构建组件数据(筛选组件元数据等) very important!
    if (this.enableFilterCache) {
      await this.popStashFilter() // 加载分页筛选条件
    }
    if (!this.lazyLoad) {
      this.pageLoad()
    }
    if (this.option.style.flexHeight) {
      await nextTick(() => {
        this.heightObserver.observe(this.$refs.quick) // FIX: 快筛项如果利用grid-area调整位置会导致第一次表格高度计算有误, 通过这个解决此问题
        this.heightObserver.observe(this.$refs.dynamic)
        this.calTableHeight()
        window.addEventListener('resize', this.calTableHeight)
      })
      this.$watch('dynamicFilters.length', () => { // 动态过滤器变化时可能高度改变, 重新计算高度
        nextTick(() => {
          this.calTableHeight()
        })
      })
    }
  },
  methods: {
    /**
     * 添加到编辑行: 编辑行改为computed自动计算, 无需添加, 保留此方法便于触发针对新增的编辑行的校验
     * @param fatRows
     */
    addToEditRows(fatRows) {
      // 立即校验一下以便标识出必填等字段
      rowValid(fatRows, this.option).catch((errors) => {
        // do nothing: 不提示错误, 会显示红框
      });
    },
    /**
     * 重新渲染table，提供给外部是用
     */
    reRender() {
      this.tableKey++;
    },
    /**
     * 解析FastTable下的vnodes, 得到列配置和列中组件配置。核心方法(important!)
     */
    buildComponentConfig() {
      const tableColumnVNodes = this.$slots.default ? this.$slots.default() : [];
      iterBuildComponentConfig(tableColumnVNodes, this.option, ({
                                                                  tableColumnComponentName,
                                                                  col,
                                                                  customConfig,
                                                                  quickFilter,
                                                                  easyFilter,
                                                                  formItemConfig,
                                                                  inlineItemConfig
                                                                }) => {
        if (quickFilter) {
          const {props = {}} = quickFilter;
          noRepeatAdd(this.quickFilters, quickFilter,
              (ele, item) => ele.col === item.col,
              props.firstFilter !== false) // deprecated: 1.6.0
        }
        if (easyFilter) {
          const {props = {}} = easyFilter;
          noRepeatAdd(this.easyFilters, easyFilter,
              (ele, item) => ele.col === item.col,
              props.firstFilter !== false) // deprecated: 1.6.0
        }
        this.columnConfig[col] = {
          tableColumnComponentName: tableColumnComponentName,
          customConfig: customConfig,
          formItemConfig: formItemConfig,
          inlineItemConfig: inlineItemConfig
        };
      })
      // 排序
      this.quickFilters.sort((f1, f2) => {
        const d = f1.index - f2.index
        return d === 0 ? -1 : d
      })
      this.easyFilters.sort((f1, f2) => {
        const d = f1.index - f2.index
        return d === 0 ? -1 : d
      })
    },
    /**
     * 暂只支持单列排序, 原因: 1.通过option指定的默认排序不好回显在表头; 2.多字段排序会导致操作比较繁琐
     * @param col
     * @param asc
     */
    buildOrder(col, asc) {
      if (isEmpty(col)) {
        return;
      }
      if (isBoolean(asc)) {
        // 用户指定排序前, 当只有默认排序时, 移除默认排序
        if (!isEmpty(this.option.sortField) && this.pageQuery.orders.length === 1 && this.pageQuery.orders[0].col === this.option.sortField) {
          this.pageQuery.removeOrder(this.option.sortField);
        }
        this.pageQuery.addOrder(col, asc);
        return;
      }

      this.pageQuery.removeOrder(col);
      if (this.pageQuery.orders.length === 0) {
        this.pageQuery.addOrder(this.option.sortField, !this.option.sortDesc)
      }
    },
    /**
     * 分页加载请求
     * @param page 第几页, 可不传(默认为当前页码)
     */
    pageLoad(page) {
      if (!this.queryable) {
        return
      }
      const confirmPromise = (this.status !== 'normal')
          ? ElMessageBox.confirm('当前处于编辑状态, 点击【确定】将丢失已编辑内容?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          })
          : Promise.resolve()
      confirmPromise.then(() => {
        const conds = []
        // 添加快筛条件
        const quickConds = this.quickFilters.filter(f => !f.disabled && f.isEffective()).map(f => f.getConds()).flat()
        conds.push(...quickConds)
        // 添加简筛条件
        const easyConds = this.easyFilters.filter(f => !f.disabled && f.isEffective()).map(f => f.getConds()).flat()
        conds.push(...easyConds)
        // 添加动筛条件
        const dynamicConds = this.dynamicFilters.filter(f => !f.disabled && f.isEffective()).map(f => f.getConds()).flat()
        conds.push(...dynamicConds)
        // 添加存筛条件
        if (this.storedLabels.length > 0) {
          const storeFilters = this.$refs.storedFilter.getStoreFilters();
          const storedConds = storeFilters.filter(f => !f.disabled && f.isEffective()).map(f => f.getConds()).flat()
          conds.push(...storedConds)
        }
        // 添加固定的预置条件
        conds.push(...this.option.conds);
        this.pageQuery.setConds(conds);
        const context = this.option.context;
        const beforeLoad = this.option.beforeLoad;
        return new Promise((resolve, reject) => {
          if (!isEmpty(page) && isNumber(page)) {
            this.pageQuery.current = page
          }
          beforeLoad.call(context, {query: this.pageQuery}).then(() => {
            this.loading = true
            if (this.enableFilterCache) {
              this.stashFilter() // 缓存分页筛选条件
            }
            post(this.option.pageUrl, this.pageQuery.toJson()).then(res => {
              this.exitEditStatus();
              const loadSuccess = this.option.loadSuccess;
              loadSuccess.call(context, {query: this.pageQuery, res: res}).then(({records = [], total = 0}) => {
                this.list = records.map(r => toTableRow(r, this.columnConfig, 'normal', 'inline'));
                this.total = total;
                nextTick(() => {
                  this.setChoseRow(0); // 默认选中第一行
                  this.syncRowSelection(); // 同步可能得选中状态
                })
              }).finally(() => {
                resolve()
              })
            }).catch(err => {
              const loadFail = this.option.loadFail;
              loadFail.call(context, {query: this.pageQuery, error: err}).then(() => {
                ElMessage.error('加载失败:' + JSON.stringify(err));
              })
              reject(err);
            }).finally(() => {
              this.loading = false;
            })
          }).catch(err => {
            reject(err);
          })
        })
      })
    },
    /**
     * 重置筛选条件值
     */
    resetFilter() {
      const context = this.option.context
      const beforeReset = this.option.beforeReset
      beforeReset.call(context, {query: this.pageQuery}).then(() => {
        this.quickFilters.forEach((f) => {
          if (f.reset()) {
            this.$refs.quickForm.handleChange(f) // 为了触发快筛值onChange
          }
        })
        this.easyFilters.forEach((f) => f.reset())
        this.dynamicFilters.length = 0
        this.storedLabels.length = 0
        // 清空自定义扩展筛选参数
        Object.keys(this.pageQuery.extra).forEach(key => {
          this.pageQuery.extra[key] = null
        })
        this.pageLoad()
      }).catch(() => {
        console.debug('你取消了重置操.')
      })
    },
    /**
     * insert前校验
     */
    toInsert() {
      const {editType} = this.option
      if (this.status !== 'normal' && this.status !== 'insert') {
        console.warn(`当前FastTable处于${this.status}状态, 不允许新增`)
        return
      }
      if (editType === 'form') {
        this.addForm()
      } else {
        this.addRow()
      }
    },
    /**
     * 弹窗表单新增
     */
    addForm(row = {}) {
      if (!this.insertable) {
        return;
      }
      const {context, beforeToInsert} = this.option;
      const rows = [row]
      beforeToInsert.call(context, rows).then(() => {
        const fatRow = toTableRow(rows[0], this.columnConfig, 'insert', 'form');
        openDialog({
          component: RowForm,
          props: {
            option: this.option,
            config: fatRow.config,
            row: fatRow,
            type: 'insert',
            layout: this.option.style.formLayout
          },
          dialogProps: {
            width: '50%',
            title: '新增',
            'close-on-click-modal': false
          }
        }).then(() => {
          this.pageLoad();
        })
      }).catch(() => {
        console.debug('你已取消新建')
      })
    },
    /**
     * 增加一个新增编辑状态的行
     */
    addRow(row = {}) {
      this.addRows([row]);
    },
    /**
     * 增加多个新增状态的行
     * @param rows
     */
    addRows(rows = []) {
      if (!this.insertable) {
        return
      }
      if (this.status !== 'normal' && this.status !== 'insert') {
        ElMessage.warning(`当前表格处于${this.status}状态, 不允许新增`);
        return
      }
      const {context, beforeToInsert} = this.option;
      beforeToInsert.call(context, rows).then(() => {
        const newRows = rows.map(r => toTableRow(r, this.columnConfig, 'insert', 'inline'));
        this.list.unshift(...newRows);
        this.addToEditRows(newRows);
        this.setChoseRow(0);
      }).catch(() => {
        console.debug('你已取消新建')
      })
    },
    /**
     * 删除行(多选模式下，删除checkedRows; 非多选模式下, 删除choseRow)
     */
    deleteRow() {
      if (!this.deletable) {
        return
      }
      const enableMulti = this.enableMulti
      let beDeleteRows = (enableMulti ? this.checkedRows : (util.isEmpty(this.choseRow) ? [] : [this.choseRow]))
      if (util.isEmpty(beDeleteRows)) {
        ElMessage.warning(`请先${enableMulti ? '勾' : '点'}选要删除的行`)
        return
      }

      const rows = beDeleteRows.map(r => r.row);
      const {context, beforeDeleteTip, beforeDelete} = this.option;
      let param = {
        fatRows: beDeleteRows,
        rows: rows
      }
      beforeDeleteTip.call(context, param).then(() => {
        const columnConfigs = Object.entries(this.columnConfig).map(([col, config]) => config)
        openDialog({
          component: RowConfirm,
          props: {
            rows: beDeleteRows,
            columnConfigs: columnConfigs,
            action: 'delete'
          },
          dialogProps: {
            title: `确认删除以下记录?`,
            width: '90%',
            buttons: [
              {
                text: '确定删除',
                type: 'danger',
                onClick: (component) => {
                  return Promise.resolve(component.getRows())
                }
              },
              {
                text: '取消',
                onClick: () => {
                  return Promise.reject() // 走catch逻辑
                }
              }
            ]
          }
        }).then((confirmedRows) => {
          this.syncRowSelection()
          param = {fatRows: confirmedRows, rows: confirmedRows.map(r => r.row)}
          beforeDelete.call(context, param).then((postData) => {
            if (postData.length === 0) {
              ElMessage.warning('无可删除数据')
              return
            }
            const {deleteUrl, batchDeleteUrl, deleteSuccess, deleteFail} = this.option;
            const postPromise = (postData.length === 1 ? post(deleteUrl, postData[0]) : post(batchDeleteUrl, postData))
            postPromise.then(res => {
              this.checkedRows.length = 0 // 删除成功则清除已勾选数据
              this.pageLoad() // 刷新分页数据
              deleteSuccess.call(context, {
                ...param,
                res: res
              }).then(() => {
                ElMessage.success('删除成功')
              })
            }).catch(err => {
              deleteFail.call(context, {...param, error: err}).then(() => {
                ElMessage.error('删除失败:' + JSON.stringify(err));
              })
            })
          }).catch(() => {
            console.log('[beforeDelete]取消删除..')
          })
        }).catch(() => {
          // 已取消
          this.syncRowSelection()
        })
      }).catch(() => {
        console.log('[beforeDeleteTip]取消删除..')
      })
      // this.option._deleteRows(beDeleteRows).then(() => this.pageLoad());
    },
    /**
     * 打开动筛面板: 构造动筛组件配置, 动态创建面板并弹出。由于动筛是动态的，不能在mounted阶段构造好。
     * @param column
     */
    openDynamicFilterForm(column) {
      if (!this.enableColumnFilter || !this.queryable) {
        return;
      }
      const {prop, label, order} = column
      const {tableColumnComponentName, customConfig} = this.columnConfig[prop]
      const dynamicFilter = buildFinalQueryComponentConfig(customConfig, tableColumnComponentName, 'dynamic', this.option)
      openDialog({
        component: DynamicFilterForm,
        props: {
          option: this.option,
          filter: dynamicFilter,
          order: order,
          conds: this.pageQuery.conds,
        },
        dialogProps: {
          width: '480px',
          title: `数据筛选及排序: ${label}`,
        }
      }).then(async ({filter: dynamicFilter, order}) => {
        if (dynamicFilter.isEffective()) {
          await dynamicFilter.updateCondMsg()
          this.dynamicFilters.push(dynamicFilter);
        }
        if (isBoolean(order.asc)) {
          this.buildOrder(prop, order.asc)
          column.order = order.asc ? 'asc' : 'desc'
        } else {
          this.buildOrder(prop, order.asc)
          column.order = '';
        }
        this.pageLoad();
      }).catch(msg => {
        console.log(msg)
      })
    },
    // 选中行发生变更
    handleCurrentChange(row) {
      this.choseRow = row;
      this.$emit('currentChange', {fatRow: row, row: isNull(row) ? null : row.row, scope: this.scopeParam});
    },
    /**
     * 选中指定行
     * @param index 不传默认是0
     */
    setChoseRow(index = 0) {
      if (this.list.length === 0) {
        this.choseRow = null;
        this.$refs.table.setCurrentRow(); // 清除选中高亮
        return;
      }
      this.choseRow = this.list[index];
      this.$refs.table.setCurrentRow(this.choseRow);
    },
    getChoseRow() {
      return this.choseRow;
    },
    getCheckedRows() {
      return this.checkedRows;
    },
    handleSelect(rows, row) {
      this.$emit('select', {
        fatRows: rows,
        rows: rows.map(r => r.row),
        fatRow: row,
        row: row.row,
        scope: this.scopeParam
      });
      const idField = this.option.idField
      const isChecked = (rows.indexOf(row) > -1)
      if (isChecked) { // 勾选
        this.checkedRows.push(row)
      } else { // 取消勾选
        const eqCallback = ((r1, r2) => r1.row[idField] === r2.row[idField])
        const idx = this.checkedRows.findIndex(r1 => eqCallback(r1, row))
        if (idx > -1) {
          this.checkedRows.splice(idx, 1)
        }
      }
    },
    handleSelectionChange(newRows) {
      this.$emit('selectionChange', {fatRows: newRows, rows: newRows.map(r => r.row), scope: this.scopeParam})
    },
    handleSelectAll(rows) {
      this.$emit('selectAll', {fatRows: rows, rows: rows.map(r => r.row), scope: this.scopeParam});
      // rows中的全部塞进checkedRows
      const idField = this.option.idField
      const eqCallback = ((r1, r2) => r1.row[idField] === r2.row[idField])
      rows.forEach(r1 => {
        if (this.checkedRows.findIndex(r2 => eqCallback(r1, r2)) === -1) {
          this.checkedRows.push(r1)
        }
      })
      // 对于checkedRows中存在于list但不存在于rows的, 要从checkedRows里移除
      for (let i = this.checkedRows.length - 1; i >= 0; i--) { // 倒序, important
        const r1 = this.checkedRows[i]
        // 若rows中无,且list有, 则表示是要取消的
        if (rows.findIndex(r2 => eqCallback(r1, r2)) === -1 && this.list.findIndex(r2 => eqCallback(r1, r2)) > -1) {
          this.checkedRows.splice(i, 1)
        }
      }
    },
    handleRowClick(row, column, event) {
      this.$emit('rowClick', {fatRow: row, column, event, row: row.row, scope: this.scopeParam});
    },
    handleRowDblclick(row, column, event) {
      this.$emit('rowDblclick', {fatRow: row, column, event, row: row.row, scope: this.scopeParam});
      if (!this.enableDblClickEdit) {
        return;
      }
      // 若当前编辑行已经处于编辑状态, 则直接emit并返回;
      if (row.status === 'update' || row.status === 'insert') {
        return;
      }
      // 当前存在编辑行时，不允许再新增编辑行
      if (this.status !== 'normal') {
        return;
      }
      if (this.option.editType === 'form') {
        this.updateForm(row);
      } else {
        this.updateRow(row);
      }
    },
    /**
     * 表单更新一行
     * @param fatRow
     */
    updateForm(fatRow) {
      if (!this.updatable) {
        return;
      }
      const {context, beforeToUpdate} = this.option;
      beforeToUpdate.call(context, {fatRows: [fatRow], rows: [fatRow.row]}).then(() => {
        openDialog({
          component: RowForm,
          props: {
            option: this.option,
            config: getEditConfig(this.columnConfig, 'form'),
            row: fatRow,
            type: 'update',
            layout: this.option.style.formLayout
          },
          dialogProps: {
            width: '50%',
            title: '编辑',
            'close-on-click-modal': false
          }
        }).then(() => {
          this.pageLoad();
        })
      }).catch(() => {
        console.debug('你已取消编辑')
      })
    },
    updateRow(fatRow) {
      if (!this.updatable) {
        return
      }
      if (this.status !== 'normal' && this.status !== 'update') {
        ElMessage.warning(`当前表格处于${this.status}状态, 不允许更新`);
        return
      }
      const {context, beforeToUpdate} = this.option;
      beforeToUpdate.call(context, {fatRows: [fatRow], rows: [fatRow.row]}).then(() => {
        fatRow.status = 'update';
        this.addToEditRows([fatRow]);
      }).catch(() => {
        console.debug('你已取消编辑')
      })
    },
    /**
     * 激活批量编辑
     */
    activeBatchEdit() {
      if (this.status !== 'normal') {
        ElMessage.warning('请先退出编辑状态')
        return;
      }
      const {context, beforeToUpdate} = this.option
      beforeToUpdate.call(context, {
        fatRows: this.list,
        rows: this.list.map(r => r.row),
        editRows: this.list.map(r => r.editRow)
      }).then(() => {
        this.list.forEach(r => r.status = 'update')
        this.addToEditRows(this.list);
      }).catch(() => {
        console.debug('你已取消编辑')
      })
    },
    /**
     * 取消编辑状态: 包括新增、更新状态。会将编辑状态的行状态重置为'normal', 并清空编辑行数组editRows, 同时将表格状态重置为'normal'
     */
    cancelEditStatus() {
      const {context, beforeCancel} = this.option;
      beforeCancel.call(context, {
        fatRows: this.editRows,
        rows: this.editRows.map(r => r.row),
        status: this.status
      }).then(() => {
        this.exitEditStatus();
      }).catch(() => {
        // 不允许取消
      })
    },
    exitEditStatus() {
      // 移除列表中可能存在的insert状态记录
      remove(this.list, item => item.status === 'insert');
      // 将编辑的行状态改为normal, 并清空editRows,因为editRows是list中的引用，所以不能光清空数组
      this.editRows.forEach(r => {
        r.status = 'normal'
        r.editRow = {...r.row} // 重置editRow
      })
      // this.editRows.length = 0
      // if (isNormal === false) { // 编辑状态时(尤其新建状态), 控制表格重新渲染, 避免一些“残留”。升级vue3后没看到什么残留，而且退出编辑都刷新页面并不好
      // this.reRender();
      // this.pageLoad()
      // }
    },
    /**
     * 同步行的选中状态
     */
    syncRowSelection() {
      const enableMulti = this.enableMulti
      if (enableMulti === false) {
        this.checkedRows.length = 0
        return
      }
      const idField = this.option.idField
      for (const r1 of this.list) {
        const selected = this.checkedRows.some(r2 => r1.row[idField] === r2.row[idField])
        this.$refs.table.toggleRowSelection(r1, selected)
      }
    },
    /**
     * 查看勾选的数据
     */
    viewCheckedRows() {
      const columnConfigs = Object.entries(this.columnConfig).map(([col, config]) => config)
      openDialog({
        component: RowConfirm,
        props: {
          rows: this.checkedRows,
          columnConfigs: columnConfigs
        },
        dialogProps: {
          title: '所有勾选的行',
          width: '90%',
          handleCancel: () => {
            this.$nextTick(() => {
              this.syncRowSelection()
            })
          }
        }
      })
    },
    /**
     * 清空勾选
     */
    clearCheckedRows() {
      this.checkedRows.length = 0
      this.$refs.table.clearSelection()
    },
    /**
     * 移除新建的行
     */
    removeNewRows() {
      if (this.status !== 'insert' || this.editRows.length === 0) {
        return
      }
      const enableMulti = this.enableMulti
      let beRemoveRows = (enableMulti ? this.checkedRows : (util.isEmpty(this.choseRow) ? [] : [this.choseRow]))
      if (isEmpty(beRemoveRows)) {
        ElMessage.warning(`请先${enableMulti ? '勾' : '点'}选要移除的新建行`)
        return
      }
      if (beRemoveRows.some(r => r.status !== 'insert')) {
        ElMessage.warning('只能移除新建的行')
        return
      }
      ElMessageBox.confirm(`确定移除这${beRemoveRows.length}条记录吗？`, '移除确认', {}).then(() => {
        remove(this.list, item => beRemoveRows.indexOf(item) > -1)
        if (this.editRows.length === 0) {
          this.exitEditStatus()
        }
        this.checkedRows.length = 0 // 清除勾选数据
        this.setChoseRow(0)
      })
    },
    /**
     * 保存编辑的行: 包括新增或更新状态的行。内部会将保存成功的记录的行状态置为normal
     * @return 返回Promise。不存在需要保存的行 或 保存成功则返回resolve, 否则返回reject。
     */
    saveEditRows() {
      if (this.editRows.length === 0) {
        return Promise.resolve();
      }
      if (this.status !== 'insert' && this.status !== 'update') {
        throw new Error(`当前FastTable状态异常:${this.status}, 无法保存编辑记录`);
      }
      rowValid(this.editRows, this.option).then(() => {
        // 保存编辑的行: 包括新增、更新状态的行
        let promise;
        if (this.status === 'insert') {
          promise = this.option._insertRows(this.editRows);
        } else {
          promise = this.option._updateRows(this.editRows);
        }
        promise.then(() => {
          this.exitEditStatus(); // 退出编辑状态
          this.pageLoad();
        }).catch(() => {
        });
      }).catch((errors) => {
        const firstError = errors[0];
        ElMessage.error(firstError.message);
      })
    },
    /**
     * 批量更新记录
     */
    activeBatchUpdate() {
      // TODO 1.6 激活勾选，针对勾选的记录弹出批量更新弹窗，可指定要更新的字段和值，点击确定应用于这些记录
    },
    /**
     * 导出数据
     */
    exportData() {
      if (!this.exportable) {
        ElMessage.warning('当前表格不允许导出')
        return
      }
      this.option._exportData(buildParamForExport(this.columnConfig), this.pageQuery);
    },
    /**
     * 自定义表格
     */
    customTable() {
      // TODO 1.6 自定义表格: 可自定义——表格标题、默认简筛字段、默认排序字段和排序方式、各列宽、冻结哪些列等
    },
    /**
     * 计算表格自适高度: tableFlexHeight
     */
    calTableHeight() {
      const totalHeight = getInnerHeight(this.$el);
      const titleHeight = getFullHeight(this.$refs.title);
      const quickHeight = getFullHeight(this.$refs.quick);
      const operationHeight = getFullHeight(this.$refs.operation);
      const dynamicHeight = getFullHeight(this.$refs.dynamic);
      const paginationHeight = getFullHeight(this.$refs.pagination);
      this.tableFlexHeight = totalHeight - titleHeight - quickHeight - operationHeight - dynamicHeight - paginationHeight - 2;
      // console.log(`totalHeight: ${totalHeight}`)
      // console.log(`titleHeight: ${titleHeight}`)
      // console.log(`quickHeight: ${quickHeight}`)
      // console.log(`operationHeight: ${operationHeight}`)
      // console.log(`dynamicHeight: ${dynamicHeight}`)
      // console.log(`paginationHeight: ${paginationHeight}`)
      // console.log(`tableFlexHeight: ${this.tableFlexHeight}`)
    },
    getBoolVal(boolValOrFun, defaultVal = false) {
      if (isFunction(boolValOrFun)) {
        const result = this.executeInContext(boolValOrFun)
        return isBoolean(result) ? result : defaultVal
      }
      if (isBoolean(boolValOrFun)) {
        return boolValOrFun
      }
      return defaultVal
    },
    // 使用透传的context作为this执行函数，并传递参数scopeParam
    executeInContext(fn) {
      if (!isFunction(fn)) {
        console.error(`fn is not function: ${fn}`)
        return
      }
      return fn.call(this.option.context, this.scopeParam)
    },
    /**
     * 从缓存中加载搜索数据, 更新quickFilters、easyFilters、dynamicFilters、storedFilters里，以便实现缓存生效
     */
    async popStashFilter() {
      try {
        const stashFilters = cache.getFromSessionStorage(`CACHE_FILTER:${this.option.id}`)
        if (util.isEmpty(stashFilters) || !util.isArray(stashFilters)) {
          return
        }
        const extra = this.pageQuery.extra
        for (const {type, ...config} of stashFilters) {
          if (type === 'stored') {
            const {value} = config
            this.storedLabels = value
            continue;
          }
          if (type === 'extra') {
            const {value: cachedExtra} = config
            Object.entries(extra).forEach(([key, value]) => {
              const cacheValue = cachedExtra[key]
              if (!util.isEmpty(cacheValue)) {
                extra[key] = cacheValue
              }
            })
            continue;
          }
          const {col, opt, val, disabled} = config
          if (type === 'quick') {
            this.quickFilters.filter(f => f.col === col && f.opt === opt).forEach(f => {
              f.val = val
              f.disabled = disabled
            })
          } else if (type === 'easy') {
            this.easyFilters.filter(f => f.col === col && f.opt === opt).forEach(f => {
              f.val = val
              f.disabled = disabled
            })
          } else if (type === 'dynamic') {
            const {tableColumnComponentName, customConfig} = this.columnConfig[col]
            const dynamicFilter = buildFinalQueryComponentConfig(customConfig, tableColumnComponentName, 'dynamic', this.option)
            dynamicFilter.val = val
            dynamicFilter.disabled = disabled
            await dynamicFilter.updateCondMsg()
            this.dynamicFilters.push(dynamicFilter)
          } else {
            console.log(`${col}type值不正确:${type}`)
          }
        }
      } catch (err) {
        console.error(`从缓存中还原筛选条件时出现错误: ${err}`)
        cache.deleteFromSessionStorage(`CACHE_FILTER:${this.option.id}`)
      }
    },
    /**
     * 将筛选条件缓存起来
     */
    stashFilter() {
      try {
        // 将筛选条件缓存: 只存type、col、opt、val、disabled即可
        const stashFilters = []
        const callbackFn = (f) => {
          stashFilters.push({
            type: f.type,
            col: f.col,
            opt: f.opt,
            val: f.val,
            disabled: f.disabled,
            options: f.props.options
          })
        }
        this.quickFilters.filter(f => f.isEffective() && !f.isDefaultVal()).forEach(callbackFn)
        this.easyFilters.filter(f => f.isEffective() && !f.isDefaultVal()).forEach(callbackFn)
        this.dynamicFilters.filter(f => f.isEffective()).forEach(callbackFn)
        // 存筛比较特殊, 数据结构不同
        if (this.storedLabels.length > 0) {
          stashFilters.push({type: 'stored', value: this.storedLabels})
        }
        // 扩展参数也比较特殊,单独处理
        const extra = this.pageQuery.extra;
        if (!util.isEmpty(extra) && Object.keys(extra).some(key => !util.isEmpty(extra[key]))) {
          // 只缓存有效的自定义参数
          const effectExtra = Object.fromEntries(
              Object.entries(extra).filter(([_, value]) => !util.isEmpty(value))
          );
          stashFilters.push({type: 'extra', value: effectExtra})
        }

        if (stashFilters.length > 0) {
          cache.setToSessionStorage(`CACHE_FILTER:${this.option.id}`, stashFilters)
        } else {
          cache.deleteFromSessionStorage(`CACHE_FILTER:${this.option.id}`)
        }
      } catch (err) {
        console.error(`缓存筛选条件时出现错误: ${err}`)
      }
    }
  },
  beforeUnmount() {
    // 清理事件监听
    window.removeEventListener('resize', this.calTableHeight);
    this.heightObserver.disconnect() // 取消所有监听
  }
}
</script>

<style scoped lang="scss">
.fc-fast-table {
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  overflow: auto;

  .fc-fast-table-title {
    font-weight: bold;
  }

  .fc-quick-filter-wrapper {
    padding-bottom: 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #dfdfdf;
    margin-bottom: 10px;
  }

  .fc-fast-table-divider {
    margin: 0 0 10px 0;
  }

  .fc-fast-table-operation-bar {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    :deep(.el-button--default) {
      padding-left: 10px;
      padding-right: 10px;
    }

    .fc-operation-filter {
      display: flex;

      & > :not(:first-child) {
        margin-left: 5px;
      }

      .fc-stored-btn-wrapper {
        margin-left: 10px;
      }
    }

    .fc-fast-table-operation-btn {
    }

    .fc-fast-table-operation-more {
      margin-left: 10px;
    }
  }

  :deep(.el-table__cell) {
    padding: 0;
  }

  :deep(td.fc-table-column > .cell) {
    padding: 0 10px;

    .fc-table-inline-edit-component {
      width: 100%;

      .el-input__inner {
        padding: 0 4px;
      }

      .el-input-number__decrease, .el-input-number__increase {
        width: 15px;
      }

      .el-input__prefix {
        display: none;
      }

      input {
        text-align: left;
      }

      .el-upload-list--picture-card .el-upload-list__item, .el-upload--picture-card {
        width: auto;
        height: 100%;
        aspect-ratio: 1 / 1;
        line-height: 100%;
        margin: 0;

        & .el-icon-plus {
          $uploadIconSize: 18px;
          font-size: $uploadIconSize;
          width: $uploadIconSize;
          height: $uploadIconSize;
          margin-top: calc(50% - $uploadIconSize / 2);
        }
      }

      .el-upload-list--text {
        .el-upload-list__item {
          margin: 0;
          line-height: 1;

          & > * {
            display: inline;
          }
        }
      }
    }

    .fc-table-inline-edit-component.fc-valid-error {
      border: 1px dashed #F56C6C;
    }

    .el-upload-list__item {
      transition: none !important; // 防止内部FastUpload因数据刷新而跳动
    }
  }

  .fc-pagination-wrapper {
    display: flex;
    margin-top: 3px;
    justify-content: space-between;

    .fc-footer-wrapper {
      display: flex;
      align-items: center;

      .fc-check-tip {
        display: flex;
        margin-right: 10px;
      }
    }
  }
}
</style>
