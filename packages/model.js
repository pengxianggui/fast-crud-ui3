import {ElMessage, ElMessageBox} from 'element-plus';
import {
    assert,
    caseToCamel,
    dateFormat,
    defaultIfBlank,
    isArray,
    isBoolean,
    isEmpty,
    isFunction,
    isNull,
    isObject,
    isString,
    isUndefined,
    mergeValue
} from "./util/util.js";
import {openDialog} from "./util/dialog";
import ExportConfirm from "./components/table/src/export-confirm.vue";
import {post} from "./util/http.js";

export const Opt = Object.freeze({
    EQ: "=",
    NE: "!=",
    GT: ">",
    GE: ">=",
    LT: "<",
    LE: "<=",
    IN: "in",
    NIN: "nin",
    LIKE: "like",
    LLIKE: "llike",
    RLIKE: "rlike",
    NLIKE: "nlike",
    NULL: "null",
    NNULL: "nnull",
    EMPTY: "empty",
    NEMPTY: "nempty",
    BTW: "between",
})

export const Rel = Object.freeze({
    AND: "and", OR: "or"
})

export class Cond {
    col;
    opt;
    val;

    constructor(col, opt, val) {
        assert(isString(col) && !isEmpty(col), 'col必须为有效字符串')
        assert(Object.values(Opt).indexOf(opt) > -1, `opt无效:${opt}`)
        this.col = col;
        this.opt = opt;
        this.val = val;
    }

    setOpt(opt) {
        this.opt = opt;
        return this;
    }

    setVal(val) {
        this.val = val;
        return this;
    }

    static build(condJson) {
        if (condJson instanceof Cond) {
            return condJson;
        }
        assert(isObject(condJson), 'cond不是json格式!')
        const {col, opt = Opt.EQ, val} = condJson
        assert(!isEmpty(col), 'cond格式不正确: 无col属性或其值为空!')
        return new Cond(col, defaultIfBlank(opt, Opt.EQ), val);
    }
}

export class Order {
    col;
    asc;

    constructor(col, asc = false) {
        this.col = col;
        this.asc = asc;
    }

    setAsc(asc) {
        this.asc = asc;
        return this;
    }
}

export class Query {
    cols = [];
    conds = [];
    distinct = false;
    orders = [];
    extra = {}; // 扩展字段

    constructor() {
    }

    setCols(cols) {
        this.cols = cols;
        return this;
    }

    /**
     * @param cond
     * @param repeatable 是否允许重复的col, 默认false, 即若多次添加相同col的条件, 只会保留最新的
     * @return {Query}
     */
    addCond(cond, repeatable = true) {
        if (repeatable === false) {
            this.removeCond(c.col)
        }
        this.conds.push(cond);
        return this;
    }

    removeCond(col) {
        this.conds = this.conds.filter(cond => cond.col !== col);
        return this;
    }

    setConds(conds) {
        this.conds = conds;
        return this;
    }

    getCond(col) {
        return this.conds.find(cond => cond.col === col);
    }

    setDistinct() {
        this.distinct = true;
        return this;
    }

    addOrder(col, asc) {
        if (isEmpty(col) || !isBoolean(asc)) {
            return;
        }
        this.removeOrder(col)
        this.orders.push(new Order(col, asc));
        return this;
    }

    removeOrder(col) {
        const idx = this.orders.findIndex(o => o.col === col);
        if (idx > -1) {
            this.orders.splice(idx, 1)
        }
        return this;
    }

    getOrder(col) {
        return this.orders.find(order => order.col === col);
    }

    toJson() {
        // 防止后端序列化策略为下划线, 这里将col、conds、orders中涉及的字段全部转换为驼峰, 因为这些值接口传输给后端时不受反序影响
        //  为了保证后端能正常对应到entity中的字段, 因此转为驼峰(这里是坚信entity中属性是驼峰命名).
        const cols = this.cols.map(col => caseToCamel(col, '_'));
        const conds = this.conds.map(cond => new Cond(caseToCamel(cond.col, '_'), cond.opt, cond.val));
        const orders = this.orders.map(order => new Order(caseToCamel(order.col, '_'), order.asc));
        // 将扩展参数中的"空值"都转换为null, 避免后端获取时参数类型不符引起问题
        const extra = Object.fromEntries(
            Object.entries(this.extra).map(([key, value]) => [key, isEmpty(value) ? null : value])
        );
        return {
            cols: cols,
            conds: conds,
            orders: orders,
            distinct: this.distinct,
            extra: extra
        };
    }
}

export class PageQuery extends Query {
    current = 1;
    size = 20;

    constructor(current = 1, size = 20) {
        super();
        this.current = current;
        this.size = size;
    }

    /**
     * 设置每页大小
     * @param size
     */
    setSize(size) {
        this.size = size;
        return this;
    }

    toJson() {
        const json = super.toJson();
        return {
            ...json,
            current: this.current,
            size: this.size
        }
    }
}

/**
 * 筛选组件配置
 */
export class FilterComponentConfig {
    component; // 渲染组件
    col; // 字段名
    opt; // 操作符
    val; // 值
    label; // 显示中文名
    props; // 组件对应的props
    defaultVal; // 默认值
    disabled; // 是否禁用: 表示该筛选项是否可用
    type; // quick, easy, dynamic
    condMapFn = (cond) => [cond];
    index = 99; // 排序

    /**
     * 构造函数
     * @param component 组件
     * @param col 字段名
     * @param opt 操作符
     * @param val 值
     * @param label 中文名
     * @param props 组件对应的props
     * @param condMapFn 条件获取过滤函数
     */
    constructor({
                    component,
                    col,
                    opt = Opt.LIKE,
                    val,
                    label,
                    props,
                    condMapFn = (cond) => [cond],
                    type
                }) {
        this.component = component;
        this.col = col;
        this.opt = opt;
        this.val = val;
        this.label = label;
        const {disabled, ...validProps} = props; // 移除props中的disabled属性,disabled属性对查询时无效
        this.props = validProps;
        if (!isUndefined(condMapFn)) {
            this.condMapFn = condMapFn;
        }

        this.defaultVal = val;
        this.disabled = false;
        this.type = type;
    }

    /**
     * 值为默认值
     */
    isDefaultVal() {
        return this.val === this.defaultVal
    }

    /**
     * 此筛选项是否有效
     * @returns {boolean}
     */
    isEffective() {
        if (this.opt === Opt.NULL || this.opt === Opt.NNULL || this.opt === Opt.EMPTY || this.opt === Opt.NEMPTY) {
            return true;
        }
        return this.val !== null && this.val !== undefined && this.val !== '' && this.val.length !== 0;
    }

    /**
     * 返回值是否变更
     * @return {boolean}
     */
    reset() {
        const valChanged = (this.val !== this.defaultVal)
        this.val = this.defaultVal
        return valChanged
    }

    getConds() {
        if (this.opt === Opt.NULL || this.opt === Opt.NNULL || this.opt === Opt.EMPTY || this.opt === Opt.NEMPTY) {
            return [new Cond(this.col, this.opt, null)]
        }
        return this.condMapFn(new Cond(this.col, this.opt, this.val));
    }
}

/**
 * 编辑组件配置
 */
export class EditComponentConfig {
    component;
    col;
    label;
    props;
    val;
    editable; // 是否可编辑, true 表示可编辑, false表示不可编辑, insert-表示新增时可编辑, update-表示更新时可编辑. 默认为true.
    type; // inline, form
    eventMethods; // 组件事件触发时调用其中的方法，例如参数验证

    constructor({component, col, label, props, val, eventMethods, type, unique, tableOption}) {
        this.component = component;
        this.col = col;
        this.label = label;
        const {editable, ...validProps} = props; // 移除props中的editable属性,避免editable对组件影响
        this.props = validProps;
        this.val = val;
        this.editable = editable;
        this.eventMethods = eventMethods;
        this.type = type;
        // 将unique转换为 props.rules一部分
        if (unique && (tableOption instanceof FastTableOption)) {
            const pkField = tableOption.idField
            const uniqueValidator = async (rule, value, callback, source, options) => {
                if (isNull(value) || isUndefined(value)) {
                    return Promise.resolve()
                }

                const {getRow} = rule
                if (!isFunction(getRow)) {
                    // 无法获取当前行
                    console.error('无法进行唯一性校验:无法获取当前记录完整数据')
                    return Promise.resolve()
                }
                const currentRow = getRow()
                const pkVal = currentRow[pkField]
                if (type === 'inline') {
                    if (isEmpty(tableOption.ref?.editRows)) {
                        return Promise.resolve()
                    }
                    const editRows = tableOption.ref.editRows.map(fatRow => fatRow.editRow)
                    const duplicates = editRows.filter(row => row[rule.field] === value && row[pkField] !== pkVal)
                    if (duplicates.length > 0) {
                        return Promise.reject(`【${label}】${value}已存在于其它编辑行`)
                    }
                }

                // 后端唯一性校验
                const result = await tableOption._exist([
                    {col: pkField, opt: Opt.NE, val: pkVal}, // 避免自身编辑时误报
                    {col: col, opt: Opt.EQ, val: value}
                ])
                if (result) { // 表示存在
                    return Promise.reject(`【${label}】${value}已存在`)
                }
                return Promise.resolve()
            }
            props?.rules.push({
                validator: uniqueValidator, trigger: 'blur'
            })
        }
    }
}

// 定义 FastTableOption 类
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
                    lazyLoad = false,
                    editType = 'inline',
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
        assert(isString(title), 'title必须为字符串')
        assert(isBoolean(showTitle), 'showTitle必须为布尔值')
        assert(isString(id), 'id必须为字符串')
        assert(isString(module), 'module必须为字符串')
        assert(isString(baseUrl), 'baseUrl必须是字符串')
        assert(isBoolean(enableDblClickEdit) || isFunction(enableDblClickEdit), 'enableDblClickEdit必须为布尔值或返回布尔值的函数')
        assert(isBoolean(enableMulti) || isFunction(enableMulti), 'enableMulti必须为布尔值或返回布尔值的函数')
        assert(isBoolean(enableIndex) || isFunction(enableIndex), 'enableIndex必须为布尔值或返回布尔值的函数')
        assert(isBoolean(enableColumnFilter) || isFunction(enableColumnFilter), 'enableColumnFilter必须为布尔值或返回布尔值的函数')
        assert(isBoolean(lazyLoad), 'lazyLoad必须为布尔值')
        assert(['inline', 'form'].includes(editType), 'editType必须为inline或form')
        assert(isBoolean(insertable) || isFunction(insertable), 'insertable必须为布尔值或返回布尔值的函数')
        assert(isBoolean(updatable) || isFunction(updatable), 'updatable必须为布尔值或返回布尔值的函数')
        assert(isBoolean(deletable) || isFunction(deletable), 'deletable必须为布尔值或返回布尔值的函数')
        assert(isBoolean(exportable) || isFunction(exportable), 'exportable必须为布尔值或返回布尔值的函数')
        assert(isString(idField), 'idField必须为字符串')
        assert(isString(createTimeField), 'createTimeField必须为字符串')
        assert(isString(sortField), 'sortField必须为字符串')
        assert(isBoolean(sortDesc), 'sortDesc必须为布尔值')
        assert(isArray(moreButtons), 'moreButtons必须是数组')
        assert(isObject(pagination), 'pagination必须是对象')
        assert(isFunction(beforeReset), 'beforeReset必须为函数')
        assert(isFunction(beforeLoad), 'beforeLoad必须为函数')
        assert(isFunction(loadSuccess), 'loadSuccess必须为函数')
        assert(isFunction(loadFail), 'loadFail必须为函数')
        assert(isFunction(beforeToInsert), 'beforeToInsert必须为函数')
        assert(isFunction(beforeInsert), 'beforeInsert必须为函数')
        assert(isFunction(insertSuccess), 'insertSuccess必须为函数')
        assert(isFunction(insertFail), 'insertFail必须为函数')
        assert(isFunction(beforeToUpdate), 'beforeToUpdate必须为函数')
        assert(isFunction(beforeUpdate), 'beforeUpdate必须为函数')
        assert(isFunction(updateSuccess), 'updateSuccess必须为函数')
        assert(isFunction(updateFail), 'updateFail必须为函数')
        assert(isFunction(beforeDeleteTip), 'beforeDeleteTip必须为函数')
        assert(isFunction(beforeDelete), 'beforeDelete必须为函数')
        assert(isFunction(deleteSuccess), 'deleteSuccess必须为函数')
        assert(isFunction(deleteFail), 'deleteFail必须为函数')
        assert(isFunction(beforeCancel), 'beforeCancel必须为函数')
        assert(isFunction(render), "render必须是一个函数")
        assert(isFunction(beforeExport), "beforeExport必须是一个函数")
        assert(isFunction(exportSuccess), "exportSuccess必须是一个函数")
        assert(isFunction(exportFail), "exportFail必须是一个函数")
        assert(isArray(conds), "conds必须是Cond对象(或可转换为Cond对象的json)组成的数组")
        assert(isArray(condGroups), 'condGroups必须是数组')
        assert(isObject(condExtra), 'condExtra必须是对象')

        this.context = context;
        this.title = title;
        this.baseUrl = defaultIfBlank(baseUrl, module);
        this.id = defaultIfBlank(id, this.baseUrl)
        this.pageUrl = defaultIfBlank(pageUrl, this.baseUrl + '/page');
        this.listUrl = defaultIfBlank(listUrl, this.baseUrl + '/list');
        this.insertUrl = defaultIfBlank(insertUrl, this.baseUrl + '/insert');
        this.batchInsertUrl = defaultIfBlank(batchInsertUrl, this.baseUrl + '/insert/batch');
        this.updateUrl = defaultIfBlank(updateUrl, this.baseUrl + '/update');
        this.batchUpdateUrl = defaultIfBlank(batchUpdateUrl, this.baseUrl + '/update/batch');
        this.deleteUrl = defaultIfBlank(deleteUrl, this.baseUrl + '/delete');
        this.batchDeleteUrl = defaultIfBlank(batchDeleteUrl, this.baseUrl + '/delete/batch');
        this.uploadUrl = defaultIfBlank(uploadUrl, this.baseUrl + '/upload');
        this.exportUrl = defaultIfBlank(exportUrl, this.baseUrl + '/export');
        this.existsUrl = defaultIfBlank(existsUrl, this.baseUrl + '/exists');
        this.enableDblClickEdit = enableDblClickEdit;
        this.enableMulti = enableMulti;
        this.enableIndex = enableIndex;
        this.enableColumnFilter = enableColumnFilter;
        this.lazyLoad = lazyLoad;
        this.editType = editType;
        this.insertable = insertable;
        this.updatable = updatable;
        this.deletable = deletable;
        this.exportable = exportable;
        this.idField = idField;
        this.createTimeField = createTimeField;
        this.sortField = defaultIfBlank(sortField, defaultIfBlank(createTimeField, idField));
        this.sortDesc = sortDesc;
        this.moreButtons = moreButtons;
        mergeValue(this.pagination, pagination, true, true)
        mergeValue(this.style, style, true, true)
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
     * @private
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
                        ElMessage.success(`成功新增${postData.length}条记录`);
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
     * 批量删除: 删除当前勾选的行记录
     */
    _deleteRows(fatRows) {
        if (this.deletable === false) {
            return Promise.reject('当前表格不允许删除');
        }
        if (isEmpty(fatRows)) {
            ElMessage.warning('请先选中一条记录');
            return Promise.reject('请先选中一条记录');
        }

        return new Promise((resolve, reject) => {
            const rows = fatRows.map(r => r.row);
            const {context, beforeDeleteTip} = this;
            beforeDeleteTip.call(context, {
                fatRows: fatRows,
                rows: rows
            }).then(() => {
                ElMessageBox.confirm(`确定删除这${rows.length}条记录吗？`, '删除确认', {}).then(() => {
                    const {beforeDelete} = this;
                    beforeDelete.call(context, {fatRows: fatRows, rows: rows}).then((postData) => {
                        const {deleteUrl, batchDeleteUrl, deleteSuccess, deleteFail} = this;
                        const postPromise = (postData.length === 1 ? post(deleteUrl, postData[0]) : post(batchDeleteUrl, postData))
                        postPromise.then(res => {
                            resolve(); // 始终刷新
                            deleteSuccess.call(context, {
                                fatRows: fatRows,
                                rows: rows,
                                res: res
                            }).then(() => {
                                ElMessage.success('删除成功');
                            })
                        }).catch(err => {
                            reject(err);
                            deleteFail.call(context, {fatRows, rows: rows, error: err}).then(() => {
                                ElMessage.error('删除失败:' + JSON.stringify(err));
                            })
                        })
                    }).catch((err) => {
                        // 取消删除
                        reject(err);
                    })
                });
            }).catch((err) => {
                // 取消删除提示和删除
                reject(err);
            })
        })
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
                        ElMessage.success(`成功更新${postData.length}条记录`);
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
     * 导出
     * @param columnConfigs
     * @param pageQuery
     * @private
     */
    _exportData(columnConfigs, pageQuery) {
        const {context, beforeExport} = this
        beforeExport.call(context, {
            columns: columnConfigs,
            pageQuery: pageQuery
        }).then(() => {
            columnConfigs.forEach(colConf => {
                if (!colConf.hasOwnProperty('exportable')) {
                    colConf.exportable = true
                }
            })
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
                            const dateStr = dateFormat(new Date(), 'YYYYMMDDHHmmssSSS')
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
     * @private
     */
    _exist(conds = []) {
        if (isEmpty(conds)) {
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
}

export default FastTableOption;
