<template>
  <div class="fc-fast-table">
    <div ref="title" class="fc-fast-table-title" v-if="option.title">{{ option.title }}</div>
    <div ref="quick" class="fc-quick-filter-wrapper" v-if="quickFilters.length > 0">
      <!-- 快筛 -->
      <quick-filter-form :filters="quickFilters"
                         :form-label-width="option.style.formLabelWidth"
                         :size="option.style.size"
                         :row-span="option.style.quickFilterSpan">
        <slot name="quickFilter" v-bind="scopeParam"></slot>
      </quick-filter-form>
    </div>
    <div ref="operation" class="fc-fast-table-operation-bar">
      <div class="fc-operation-filter">
        <!-- 简筛区 -->
        <easy-filter :filters="easyFilters" :size="option.style.size" @search="pageLoad"/>
        <el-button type="primary" class="fc-easy-filter-btn" :size="option.style.size" :icon="Search"
                   @click="pageLoad"/>
        <el-button type="info" plain :size="option.style.size" :icon="RefreshLeft" @click="resetFilter"/>
        <!-- 存筛区 -->
        <stored-filter class="fc-stored-btn-wrapper" :filters="storedFilters" :table-option="option"
                       :column-config="columnConfig"
                       :size="option.style.size" @search="pageLoad"/>
      </div>
      <div class="fc-fast-table-expand-button">
        <slot name="button" v-bind="scopeParam"></slot>
      </div>
      <!-- 按钮功能区 -->
      <div class="fc-fast-table-operation-btn">
        <template v-if="status === 'normal'">
          <el-button :size="option.style.size" @click="toInsert"
                     v-if="getBoolVal(option.insertable, true)">新建
          </el-button>
          <el-button type="danger" plain :size="option.style.size" @click="deleteRow"
                     v-if="checkedRows.length === 0 && option.deletable">删除
          </el-button>
          <el-button type="danger" :size="option.style.size" @click="deleteRows"
                     v-if="checkedRows.length > 0 && option.deletable">删除
          </el-button>
        </template>
        <template v-if="status === 'update' || status === 'insert'">
          <el-button type="danger" plain @click="removeNewRows" v-if="status === 'insert' && editRows.length > 0">移除</el-button>
          <el-button type="primary" :size="option.style.size" @click="saveEditRows">保存</el-button>
          <el-button :size="option.style.size" @click="toInsert"
                     v-if="status === 'insert' && getBoolVal(option.insertable, true)">继续新建
          </el-button>
          <el-button :size="option.style.size" @click="cancelEditStatus">取消</el-button>
        </template>
        <!-- 下拉按钮-更多 -->
        <el-dropdown class="fc-fast-table-operation-more" :size="option.style.size">
          <el-button type="primary" plain :size="option.style.size">
            <span>更多</span>
            <el-icon class="el-icon--right">
              <ArrowDown/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="activeBatchEdit" v-if="option.updatable">
                <el-icon>
                  <Edit/>
                </el-icon>
                <span>批量编辑</span>
              </el-dropdown-item>
              <!-- TODO 1.6 批量修改: 指定一些记录，批量将某些字段修改为指定值 -->
              <!--  <el-dropdown-item @click="activeBatchUpdate" >批量修改</el-dropdown-item>-->
              <el-dropdown-item @click="exportData">
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
        <el-table-column type="selection" width="55" v-if="getBoolVal(option.enableMulti, true)"></el-table-column>
        <slot></slot>
      </el-table>
    </div>
    <div ref="pagination" class="fc-pagination-wrapper">
      <slot name="foot" v-bind="scopeParam">
        <span></span>
      </slot>
      <el-pagination v-model:page-size="pageQuery.size"
                     v-model:current-page="pageQuery.current"
                     :page-sizes="option.pagination['page-sizes']"
                     :total="total"
                     @current-change="pageLoad"
                     @size-change="pageLoad"
                     :layout="option.pagination.layout"></el-pagination>
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
import {PageQuery} from '../../../model'
import FastTableOption from "../../../model"
import {
  defaultIfEmpty,
  getFullHeight, getInnerHeight,
  ifBlank,
  isBoolean,
  isEmpty,
  isFunction,
  isNull,
  noRepeatAdd
} from "../../../util/util"
import {getEditConfig, iterBuildComponentConfig, rowValid, toTableRow, buildParamForExport} from "./util"
import {openDialog} from "../../../util/dialog"
import {buildFinalComponentConfig} from "../../mapping"
import RowForm from "./row-form.vue"
import {ArrowDown, Download, Edit, RefreshLeft, Search} from "@element-plus/icons-vue";
import {post} from "../../../util/http.js";

export default {
  name: "FastTable",
  components: {ArrowDown, Download, Edit, QuickFilterForm, EasyFilter, StoredFilter, DynamicFilterList},
  emits: ['currentChange', 'select', 'selectionChange', 'selectAll', 'rowClick', 'rowDblclick'],
  props: {
    option: {
      type: FastTableOption,
      required: true
    }
  },
  computed: {
    RefreshLeft() {
      return RefreshLeft
    },
    Search() {
      return Search
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
      const {choseRow, checkedRows, editRows} = this
      return {size: this.option.style.size, choseRow: choseRow, checkedRows: checkedRows, editRows: editRows}
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
    if (!ifBlank(this.option.sortField)) {
      pageQuery.addOrder(this.option.sortField, !this.option.sortDesc);
    }
    return {
      tableKey: 0, // 用于前端刷新表格
      loading: false, // 表格数据是否正加载中
      choseRow: null, // 当前选中的行记录
      checkedRows: [], // 代表多选时勾选的行记录
      pageQuery: pageQuery, // 分页查询构造参数
      columnConfig: {}, // 列对应的配置。key: column prop属性名, value为通过fast-table-column*定义的属性(外加tableColumnComponentName属性)
      quickFilters: [], // 快筛配置
      easyFilters: [], // 简筛配置
      dynamicFilters: [], // 动筛配置
      storedFilters: [], // 存筛配置
      list: [], // 表格当前页的数据, 不单纯有业务数据, 还有配置数据(用于实现行内、弹窗表单)
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
  beforeMount() {
  },
  mounted() {
    this.buildComponentConfig()
    if (!this.option.lazyLoad) {
      this.pageLoad()
    }
    if (this.option.style.flexHeight) {
      nextTick(() => {
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
      rowValid(fatRows, this.option.context).catch((errors) => {
      }); // 立即校验一下以便标识出必填等字段
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
      this.quickFilters.sort((f1, f2) => f1.index - f2.index)
      this.easyFilters.sort((f1, f2) => f1.index - f2.index)
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
     */
    pageLoad() {
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
        const storedConds = this.storedFilters.filter(f => !f.disabled && f.isEffective()).map(f => f.getConds()).flat()
        conds.push(...storedConds)
        // 添加固定的预置条件
        conds.push(...this.option.conds);
        this.pageQuery.setConds(conds);
        const context = this.option.context;
        const beforeLoad = this.option.beforeLoad;
        return new Promise((resolve, reject) => {
          beforeLoad.call(context, {query: this.pageQuery}).then(() => {
            this.loading = true;
            post(this.option.pageUrl, this.pageQuery.toJson()).then(res => {
              this.exitEditStatus();
              const loadSuccess = this.option.loadSuccess;
              loadSuccess.call(context, {query: this.pageQuery, res: res}).then(({records = [], total = 0}) => {
                this.list = records.map(r => toTableRow(r, this.columnConfig, 'normal', 'inline'));
                this.total = total;
                nextTick(() => {
                  this.setChoseRow(0); // 默认选中第一行
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
        this.quickFilters.forEach((f) => f.reset())
        this.easyFilters.forEach((f) => f.reset())
        this.dynamicFilters.length = 0
        this.storedFilters.length = 0
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
      if (!this.getBoolVal(this.option.insertable, true)) {
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
      if (!this.getBoolVal(this.option.insertable, true)) {
        return;
      }
      if (this.status !== 'normal' && this.status !== 'insert') {
        ElMessage.warning(`当前FastTable处于${this.status}状态, 不允许新增`);
        return;
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
     * 删除: 删除当前选中行记录
     */
    deleteRow() {
      if (this.option.deletable === false) {
        return;
      }
      const {choseRow} = this;
      const rows = [];
      if (!isEmpty(choseRow)) {
        rows.push(choseRow);
      }
      this.option._deleteRows(rows).then(() => this.pageLoad());
    },
    deleteRows() {
      if (this.option.deletable === false) {
        return;
      }
      this.option._deleteRows(this.checkedRows).then(() => this.pageLoad());
    },
    /**
     * 打开动筛面板: 构造动筛组件配置, 动态创建面板并弹出。由于动筛是动态的，不能在mounted阶段构造好。
     * @param column
     */
    openDynamicFilterForm(column) {
      if (!this.getBoolVal(this.option.enableColumnFilter, true)) {
        return;
      }
      const {prop, label, order} = column
      const {tableColumnComponentName, customConfig} = this.columnConfig[prop]
      const dynamicFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'dynamic', this.option)
      openDialog({
        component: DynamicFilterForm,
        props: {
          filter: dynamicFilter,
          order: order,
          listUrl: this.option.listUrl,
          conds: this.pageQuery.conds,
          size: this.option.style.size
        },
        dialogProps: {
          width: '480px',
          title: `数据筛选及排序: ${label}`,
        }
      }).then(({filter: dynamicFilter, order}) => {
        if (dynamicFilter.isEffective()) {
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
      this.$emit('currentChange', {fatRow: row, row: isNull(row) ? null : row.row});
    },
    /**
     * 选中指定行
     * @param index 不传默认是0
     */
    setChoseRow(index = 0) {
      if (this.list.length === 0) {
        this.choseRow = null;
        this.$refs['table'].setCurrentRow(); // 清除选中高亮
        return;
      }
      this.choseRow = this.list[index];
      this.$refs['table'].setCurrentRow(this.choseRow);
    },
    getChoseRow() {
      return this.choseRow;
    },
    getCheckedRows() {
      return this.checkedRows;
    },
    handleSelect(rows, row) {
      this.$emit('select', {fatRows: rows, rows: rows.map(r => r.row), fatRow: row, row: row.row});
    },
    handleSelectionChange(rows) {
      this.checkedRows = rows;
      this.$emit('selectionChange', {fatRows: rows, rows: rows.map(r => r.row)})
    },
    handleSelectAll(rows) {
      this.$emit('selectAll', {fatRows: rows, rows: rows.map(r => r.row)});
    },
    handleRowClick(row, column, event) {
      this.$emit('rowClick', {fatRow: row, column, event, row: row.row});
    },
    handleRowDblclick(row, column, event) {
      this.$emit('rowDblclick', {fatRow: row, column, event, row: row.row});
      if (!this.getBoolVal(this.option.enableDblClickEdit, true)) {
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
      if (this.option.updatable === false) {
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
      if (this.option.updatable === false) {
        return;
      }
      if (this.status !== 'normal' && this.status !== 'update') {
        ElMessage.warning(`当前FastTable处于${this.status}状态, 不允许更新`);
        return;
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
     * 移除新建的行
     */
    removeNewRows() {
      if (this.status !== 'insert' || this.editRows.length === 0) {
        return
      }
      const beRemoveRows = defaultIfEmpty(this.checkedRows, this.choseRow === null ? [] : [this.choseRow])
      if (isEmpty(beRemoveRows)) {
        ElMessage.warning('请选择要移除的新建行')
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
      rowValid(this.editRows, this.option.context).then(() => {
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
    },
    getBoolVal(boolValOrFun, defaultVal) {
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
    }
  },
  beforeUnmount() {
    // 清理事件监听
    window.removeEventListener('resize', this.calTableHeight);
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
    padding: 10px 0;
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

  .fc-fast-table-wrapper {
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
        border: 1px solid #F56C6C;
        //border-radius: 3px;
      }

      .el-upload-list__item {
        transition: none !important; // 防止内部FastUpload因数据刷新而跳动
      }
    }
  }

  .fc-pagination-wrapper {
    display: flex;
    margin-top: 3px;
    justify-content: space-between;
  }
}
</style>
