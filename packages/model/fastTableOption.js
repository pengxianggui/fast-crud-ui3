import {ElMessage} from "element-plus";
import md5 from "md5";
import * as util from '../util/util.js'
import {post} from "../util/http.js";
import {openDialog} from "../util/dialog.js";
import {deleteFromSessionStorage, getFromSessionStorage, setToSessionStorage} from "../util/cache.js";
import ExportConfirm from "../components/table/src/export-confirm.vue";
import Cond from './cond.js'

class FastTableOption {
    context;
    ref; // FastTable组件的this引用
    id = ''; // 用于在全局标识唯一FastTable实例：涉及一些localStorage数据, 默认取值为${baseUrl}
    title = ''; // 标题: 显示在表头上方
    showTitle = true; // 是否显示标题
    baseUrl = ''; // 内部接口的根url
    pageUrl = ''; // 分页url: 默认为${baseUrl}/page
    listUrl = ''; // 列表url: 默认为${baseUrl}/list
    insertUrl = ''; // 新增url: 默认为${baseUrl}/insert
    batchInsertUrl = ''; // 批量新增url: 默认为${baseUrl}/insert/batch
    updateUrl = ''; // 更新url: 默认为${baseUrl}/update
    batchUpdateUrl = ''; // 批量更新url: 默认为${baseUrl}/update/batch
    deleteUrl = ''; // 删除url: 默认为${baseUrl}/delete
    batchDeleteUrl = ''; // 批量删除url: 默认为${baseUrl}/delete/batch
    uploadUrl = ''; // 文件上传接口: 默认为${baseUrl}/upload
    exportUrl = ''; // 数据导出接口: 默认为${baseUrl}/export
    existsUrl = ''; // 存在性判断接口: 默认为${baseUrl}/exists
    enableDblClickEdit = true;
    enableMulti = true; // 启用多选
    enableIndex = false; // 是否启用序号列
    enableColumnFilter = true; // 启用列过滤：即动筛
    enableFilterCache = true; // 启用过滤条件缓存(支持值: true/false),若为true则缓存到session中,有效期为会话
    lazyLoad = false; // 不立即加载数据
    editType = 'inline'; // inline/form
    queryable = true; //是否允许查询, 这个在静态表格等场景是有用的, 用于隐藏查询等按钮
    insertable = true; // 是否支持内置新建
    updatable = true; // 是否支持内置编辑
    deletable = true; // 是否支持内置删除
    exportable = true; // 是否支持导出
    idField = 'id'; // 主键字段名
    createTimeField = ''; // 创建时间字段名: 如果配置了，则内部动态构造3个存筛(当天/当周/当月), 此值必须为显示列
    parent = { // TODO 待实现 父子表级联(父表取choseRow作为选中的行)
        option: FastTableOption, // 父表的option
        map: Object // 指定映射关系, 例如: {parentId: 'id'} —— 表示当前option中的parentId值关联 parent.option的id值, 以此作为构建当前表的预置筛选条件, 限定关联条件; 支持多个关联key映射
    };
    sortField; // 排序字段: 默认取createTimeField或idField
    sortDesc = true; // 默认降序
    moreButtons = []; // “更多”按钮扩展，定义: {label: String, click: Function<Promise>, icon: Component, showable: Boolean|Function<Boolean>, disable: Boolean|Function<Boolean>, }
    pagination = {
        layout: 'total, sizes, prev, pager, next, jumper', 'page-sizes': [10, 20, 50, 100, 200], size: 10
    };
    style = {
        flexHeight: false, // 表格是否使用弹性高度: 自适应高度, 撑满全屏
        bodyRowHeight: '50px', // 行高
        size: 'default',  // 尺寸
        formLabelWidth: 'auto', // 表单标签宽度:
        formLayout: null, // 表单布局: 只作用于form表单, 对快筛和行内编辑无效
        quickFilterSpan: 3, // 快筛每行几个筛选项
        quickFilterGridGap: '10px 20px', // 快筛项之间的间距(grid布局中的gap)
    };
    render; // 渲染函数, 当前table需要被pick时有用
    conds = []; // 固定的筛选条件，内部无法取消
    condGroups = []; // 开发层面预置的条件组——即存筛，例如: [{label: '成年男孩', conds: [{col: 'sex', val: '1'}, {col: 'age', opt: Opt.LE, val: 18}]}], important: 要求conds中每个col都必须启用了filter，只要有一项未启用则整个筛选组无效
    condExtra = {}; // 扩展的查询条件, 可在#quickFilter插槽中使用。例如配置了keyword, 则可将query.extra.keyword绑定到自定义输入控件上

    beforeReset;
    beforeLoad;
    loadSuccess;
    loadFail;
    beforeInsert;
    insertSuccess;
    insertFail;
    beforeUpdate;
    updateSuccess;
    updateFail;
    beforeDelete;
    deleteSuccess;
    deleteFail;
    beforeToInsert; // 进入新建前(行内编辑新建前，或新建表单弹窗前)
    beforeToUpdate; // 进入更新前(行内编辑更新前，或更新表单弹窗前)
    beforeDeleteTip;
    beforeCancel; // 工能区中取消按钮点击前
    beforeExport; // 导出前
    exportSuccess; // 导出成功后
    exportFail; // 导出失败后

    static $http; // Axios实例
    static $router; // VueRouter实例

    constructor({
                    context,
                    id = '',
                    title = '',
                    showTitle = true,
                    module = '', // @deprecated 1.6, 替换为baseUrl
                    baseUrl = '',
                    pageUrl = '',
                    listUrl = '',
                    insertUrl = '',
                    batchInsertUrl = '',
                    updateUrl = '',
                    batchUpdateUrl = '',
                    deleteUrl = '',
                    batchDeleteUrl = '',
                    uploadUrl = '',
                    exportUrl = '',
                    existsUrl = '',
                    enableDblClickEdit = true,
                    enableMulti = true,
                    enableIndex = false,
                    enableColumnFilter = true,
                    enableFilterCache = true,
                    lazyLoad = false,
                    editType = 'inline',
                    queryable = true,
                    insertable = true,
                    updatable = true,
                    deletable = true,
                    exportable = true,
                    idField = 'id',
                    createTimeField = '',
                    sortField = '',
                    sortDesc = true,
                    moreButtons = [],
                    pagination = {
                        layout: 'total, sizes, prev, pager, next, jumper',
                        'page-sizes': [10, 20, 50, 100, 200],
                        size: 10
                    },
                    style = {},
                    render = () => [],
                    conds = [],
                    condGroups = [],
                    condExtra = {},
                    beforeReset = ({query}) => Promise.resolve(),
                    beforeLoad = ({query}) => Promise.resolve(),
                    loadSuccess = ({query, res}) => Promise.resolve(res), // res为数据而非response
                    loadFail = ({query, error}) => Promise.resolve(),
                    beforeToInsert = (rows) => Promise.resolve(),
                    beforeInsert = ({fatRows, rows, editRows}) => Promise.resolve(editRows),
                    insertSuccess = ({fatRows, rows, editRows, res}) => Promise.resolve(),
                    insertFail = ({fatRows, rows, editRows, error}) => Promise.resolve(),
                    beforeToUpdate = ({fatRows, rows}) => Promise.resolve(),
                    beforeUpdate = ({fatRows, rows, editRows}) => Promise.resolve(editRows),
                    updateSuccess = ({fatRows, rows, editRows, res}) => Promise.resolve(),
                    updateFail = ({fatRows, rows, editRows, error}) => Promise.resolve(),
                    beforeDeleteTip = ({fatRows, rows}) => Promise.resolve(),
                    beforeDelete = ({fatRows, rows}) => Promise.resolve(rows),
                    deleteSuccess = ({fatRows, rows, res}) => Promise.resolve(),
                    deleteFail = ({fatRows, rows, error}) => Promise.resolve(),
                    beforeCancel = ({fatRows, rows, status}) => Promise.resolve(),
                    beforeExport = ({columns, pageQuery}) => Promise.resolve(columns),
                    exportSuccess = ({columns, pageQuery, data}) => Promise.resolve(),
                    exportFail = ({columns, pageQuery, error}) => Promise.resolve()
                }) {
        util.assert(util.isString(title), 'title必须为字符串')
        util.assert(util.isBoolean(showTitle) || util.isFunction(showTitle), 'showTitle必须为布尔值或返回布尔值的函数')
        util.assert(util.isString(id), 'id必须为字符串')
        util.assert(util.isString(module), 'module必须为字符串')
        util.assert(util.isString(baseUrl), 'baseUrl必须是字符串')
        util.assert(util.isBoolean(enableDblClickEdit) || util.isFunction(enableDblClickEdit), 'enableDblClickEdit必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(enableMulti) || util.isFunction(enableMulti), 'enableMulti必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(enableIndex) || util.isFunction(enableIndex), 'enableIndex必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(enableColumnFilter) || util.isFunction(enableColumnFilter), 'enableColumnFilter必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(enableFilterCache) || util.isFunction(enableFilterCache), 'enableFilterCache必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(lazyLoad) || util.isFunction(lazyLoad), 'lazyLoad必须为布尔值或返回布尔值的函数')
        util.assert(['inline', 'form'].includes(editType), 'editType必须为inline或form')
        util.assert(util.isBoolean(queryable) || util.isFunction(queryable), 'queryable必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(insertable) || util.isFunction(insertable), 'insertable必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(updatable) || util.isFunction(updatable), 'updatable必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(deletable) || util.isFunction(deletable), 'deletable必须为布尔值或返回布尔值的函数')
        util.assert(util.isBoolean(exportable) || util.isFunction(exportable), 'exportable必须为布尔值或返回布尔值的函数')
        util.assert(util.isString(idField), 'idField必须为字符串')
        util.assert(util.isString(createTimeField), 'createTimeField必须为字符串')
        util.assert(util.isString(sortField), 'sortField必须为字符串')
        util.assert(util.isBoolean(sortDesc), 'sortDesc必须为布尔值')
        util.assert(util.isArray(moreButtons), 'moreButtons必须是数组')
        util.assert(util.isObject(pagination), 'pagination必须是对象')
        util.assert(util.isFunction(beforeReset), 'beforeReset必须为函数')
        util.assert(util.isFunction(beforeLoad), 'beforeLoad必须为函数')
        util.assert(util.isFunction(loadSuccess), 'loadSuccess必须为函数')
        util.assert(util.isFunction(loadFail), 'loadFail必须为函数')
        util.assert(util.isFunction(beforeToInsert), 'beforeToInsert必须为函数')
        util.assert(util.isFunction(beforeInsert), 'beforeInsert必须为函数')
        util.assert(util.isFunction(insertSuccess), 'insertSuccess必须为函数')
        util.assert(util.isFunction(insertFail), 'insertFail必须为函数')
        util.assert(util.isFunction(beforeToUpdate), 'beforeToUpdate必须为函数')
        util.assert(util.isFunction(beforeUpdate), 'beforeUpdate必须为函数')
        util.assert(util.isFunction(updateSuccess), 'updateSuccess必须为函数')
        util.assert(util.isFunction(updateFail), 'updateFail必须为函数')
        util.assert(util.isFunction(beforeDeleteTip), 'beforeDeleteTip必须为函数')
        util.assert(util.isFunction(beforeDelete), 'beforeDelete必须为函数')
        util.assert(util.isFunction(deleteSuccess), 'deleteSuccess必须为函数')
        util.assert(util.isFunction(deleteFail), 'deleteFail必须为函数')
        util.assert(util.isFunction(beforeCancel), 'beforeCancel必须为函数')
        util.assert(util.isFunction(render), "render必须是一个函数")
        util.assert(util.isFunction(beforeExport), "beforeExport必须是一个函数")
        util.assert(util.isFunction(exportSuccess), "exportSuccess必须是一个函数")
        util.assert(util.isFunction(exportFail), "exportFail必须是一个函数")
        util.assert(util.isArray(conds), "conds必须是Cond对象(或可转换为Cond对象的json)组成的数组")
        util.assert(util.isArray(condGroups), 'condGroups必须是数组')
        util.assert(util.isObject(condExtra), 'condExtra必须是对象')

        this.context = context;
        this.title = title;
        this.baseUrl = util.defaultIfBlank(baseUrl, module);
        this.id = util.defaultIfBlank(id, this.baseUrl)
        this.pageUrl = util.defaultIfBlank(pageUrl, this.baseUrl + '/page');
        this.listUrl = util.defaultIfBlank(listUrl, this.baseUrl + '/list');
        this.insertUrl = util.defaultIfBlank(insertUrl, this.baseUrl + '/insert');
        this.batchInsertUrl = util.defaultIfBlank(batchInsertUrl, this.baseUrl + '/insert/batch');
        this.updateUrl = util.defaultIfBlank(updateUrl, this.baseUrl + '/update');
        this.batchUpdateUrl = util.defaultIfBlank(batchUpdateUrl, this.baseUrl + '/update/batch');
        this.deleteUrl = util.defaultIfBlank(deleteUrl, this.baseUrl + '/delete');
        this.batchDeleteUrl = util.defaultIfBlank(batchDeleteUrl, this.baseUrl + '/delete/batch');
        this.uploadUrl = util.defaultIfBlank(uploadUrl, this.baseUrl + '/upload');
        this.exportUrl = util.defaultIfBlank(exportUrl, this.baseUrl + '/export');
        this.existsUrl = util.defaultIfBlank(existsUrl, this.baseUrl + '/exists');
        this.enableDblClickEdit = enableDblClickEdit;
        this.enableMulti = enableMulti;
        this.enableIndex = enableIndex;
        this.enableColumnFilter = enableColumnFilter;
        this.enableFilterCache = enableFilterCache;
        this.lazyLoad = lazyLoad;
        this.editType = editType;
        this.queryable = queryable;
        this.insertable = insertable;
        this.updatable = updatable;
        this.deletable = deletable;
        this.exportable = exportable;
        this.idField = idField;
        this.createTimeField = createTimeField;
        this.sortField = util.defaultIfBlank(sortField, util.defaultIfBlank(createTimeField, idField));
        this.sortDesc = sortDesc;
        this.moreButtons = moreButtons;
        util.mergeValue(this.pagination, pagination, true, true)
        util.mergeValue(this.style, style, true, true)
        this.conds = conds.map(c => Cond.build(c));
        this.condGroups = condGroups;
        this.condExtra = condExtra;

        this.beforeReset = beforeReset;
        this.beforeLoad = beforeLoad;
        this.loadSuccess = loadSuccess;
        this.loadFail = loadFail;

        this.beforeToInsert = beforeToInsert;
        this.beforeInsert = beforeInsert;
        this.insertSuccess = insertSuccess;
        this.insertFail = insertFail;

        this.beforeToUpdate = beforeToUpdate;
        this.beforeUpdate = beforeUpdate;
        this.updateSuccess = updateSuccess;
        this.updateFail = updateFail;

        this.beforeDeleteTip = beforeDeleteTip;
        this.beforeDelete = beforeDelete;
        this.deleteSuccess = deleteSuccess;
        this.deleteFail = deleteFail;

        this.beforeCancel = beforeCancel;

        this.render = render;
        this.beforeExport = beforeExport;
        this.exportSuccess = exportSuccess;
        this.exportFail = exportFail;
    }

    /**
     * 向内置条件组中增加条件
     * @param cond
     * @param repeatable 是否允许重复的col, 默认false, 即若多次添加相同col的条件, 只会保留最新的
     */
    addCond(cond, repeatable = false) {
        const c = Cond.build(cond)
        if (repeatable === false) {
            this.removeCond(c.col)
        }
        this.conds.push(c)
    }

    /**
     * 从内置条件组中移除条件
     * @param col
     */
    removeCond(col) {
        for (let i = this.conds.length - 1; i >= 0; i--) {
            if (this.conds[i].col === col) {
                this.conds.splice(i, 1)
            }
        }
    }

    /**
     * 新增行, 返回promise
     * @param fatRows
     * @returns {Promise<void>|Promise<unknown>}
     */
    _insertRows(fatRows) {
        if (fatRows.length === 0) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const {context, beforeInsert} = this;
            const rows = fatRows.map(r => r.row);
            const editRows = fatRows.map(r => r.editRow);
            beforeInsert.call(context, {
                fatRows: fatRows,
                rows: rows,
                editRows: editRows
            }).then((postData) => {
                const {insertUrl, batchInsertUrl, insertSuccess, insertFail} = this;
                const postPromise = (postData.length === 1 ? post(insertUrl, postData[0]) : post(batchInsertUrl, postData))
                postPromise.then(res => {
                    resolve();
                    insertSuccess.call(context, {
                        fatRows: fatRows,
                        rows: rows,
                        editRows: editRows,
                        res: res
                    }).then(() => {
                        ElMessage.success(`成功新增${postData.length}条记录`); // TODO 成功几条使用后端返回的数据
                    });
                }).catch(err => {
                    reject(err);
                    insertFail.call(context, {
                        fatRows: fatRows,
                        rows: rows,
                        editRows: editRows,
                        error: err
                    }).then(() => {
                        ElMessage.error('新增失败:' + JSON.stringify(err));
                    });
                })
            }).catch(err => {
                reject(err);
            })
        });
    }

    /**
     * 更新行
     * @param fatRows
     * @return 返回promise, 若成功更新则resolve; 若失败或取消, 则返回reject err或用户自定义的内容
     */
    _updateRows(fatRows) {
        if (fatRows.length === 0) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const {context, beforeUpdate} = this;
            const rows = fatRows.map(r => r.row);
            const editRows = fatRows.map(r => r.editRow);
            beforeUpdate.call(context, {
                fatRows: fatRows,
                rows: rows,
                editRows: editRows
            }).then((postData) => {
                const {updateUrl, batchUpdateUrl, updateSuccess, updateFail} = this;
                const postPromise = (postData.length === 1 ? post(updateUrl, postData[0]) : post(batchUpdateUrl, postData))
                postPromise.then(res => {
                    resolve();
                    updateSuccess.call(context, {
                        fatRows: fatRows,
                        rows: rows,
                        editRows: editRows,
                        res: res
                    }).then(() => {
                        ElMessage.success(`成功更新${postData.length}条记录`); // TODO 成功几条使用后端返回的数据
                    });
                }).catch(err => {
                    reject(err);
                    updateFail.call(context, {
                        fatRows: fatRows,
                        rows: rows,
                        editRows: editRows,
                        error: err
                    }).then(() => {
                        ElMessage.error('更新失败:' + JSON.stringify(err));
                    });
                })
            }).catch(err => {
                reject(err);
            })
        });
    }

    /**
     * 列表查询
     * @param query 查询条件 Query类型
     * @param config
     */
    _list(query, config) {
        this.conds.forEach(c => query.addCond(c)) // 内置conds添加
        return post(this.listUrl, query.toJson(), config)
    }

    /**
     * 导出
     * @param columnConfigs
     * @param pageQuery
     */
    _exportData(columnConfigs, pageQuery) {
        const {context, beforeExport} = this
        beforeExport.call(context, {
            columns: columnConfigs,
            pageQuery: pageQuery
        }).then(() => {
            openDialog({
                component: ExportConfirm,
                props: {
                    columns: columnConfigs
                },
                dialogProps: {
                    title: '导出设置',
                    width: '60%',
                    okClose: false,
                    handleOk: ({columns, all = false}) => {
                        // 导出数据
                        const {title, exportUrl, exportSuccess, exportFail} = this;
                        post(exportUrl, {
                            columns: columns,
                            all: all, // false-当前页; true-全部
                            pageQuery: pageQuery
                        }, {
                            responseType: 'blob'
                        }).then((data) => {
                            const url = window.URL.createObjectURL(data);
                            const link = document.createElement('a')
                            link.href = url;
                            const dateStr = util.dateFormat(new Date(), 'YYYYMMDDHHmmssSSS')
                            link.setAttribute('download', `${title ? title : 'download'}_${dateStr}.xlsx`)
                            document.body.appendChild(link)
                            link.click()
                            link.remove()
                            exportSuccess.call(context, {
                                columns: columnConfigs,
                                pageQuery: pageQuery,
                                data: data
                            })
                        }).catch((err) => {
                            exportFail.call(context, {
                                columns: columnConfigs,
                                pageQuery: pageQuery,
                                error: err
                            }).then(() => {
                                ElMessage.error('导出失败:' + err.message)
                            })
                        })
                    },
                    // handleCancel: (who) => {
                    // console.log(`你取消了下载..${who}触发cancel`)
                    // }
                }
            }).then(({columns, all = false}) => {
                // do nothing, dialog props中配置了handleOk
            }).catch(() => {
                // do nothing
            })
        })
    }

    /**
     * 存在性判断
     */
    _exist(conds = []) {
        if (util.isEmpty(conds)) {
            return Promise.resolve()
        }
        const {existsUrl} = this
        return new Promise((resolve, reject) => {
            post(existsUrl, conds).then(result => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        })
    }

    /**
     * 利用/list接口构造选项列表数据
     * @param query
     * @param valKey
     * @param labelKey
     * @return {Promise<*>}
     */
    _buildSelectOptions(query, valKey, labelKey) {
        return new Promise((resolve, reject) => {
            const key = `OPTIONS:${this.id}_${valKey}_${labelKey}_` + md5(JSON.stringify(util.sortKey(query)))
            let options = getFromSessionStorage(key)
            if (util.isArray(options)) {
                try {
                    resolve(options)
                    return
                } catch (err) {
                    console.log(err)
                    deleteFromSessionStorage(key)
                }
            }
            this._list(query).then(res => {
                options = res.filter(item => util.isObject(item)).map(item => {
                    const obj = {}
                    obj[valKey] = item[valKey]
                    obj[labelKey] = item[labelKey]
                    return obj
                })
                setToSessionStorage(key, options, 1)
                resolve(options)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

export default FastTableOption
