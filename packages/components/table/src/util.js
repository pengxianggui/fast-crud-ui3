import {buildFinalComponentConfig} from "../../mapping";
import {
    convertKeyFromCaseToCamel,
    deepClone,
    defaultIfBlank,
    defaultIfEmpty, extractEventName,
    isArray,
    isBoolean,
    isEmpty, isFunction,
    merge
} from "../../../util/util";

import Schema from 'async-validator'
import {Opt} from "../../../model.js";
import * as util from "../../../util/util.js";

/**
 * 单个col值校验, 校验失败会添加class: valid-error并reject(errors), 成功则会移除可能存在的valid-error，并resolve
 * @param val object数据
 * @param config col完整的config配置
 * @returns {Promise<unknown>} 若校验通过resolve, 否则reject(errors)
 */
export function colValid(val, config) {
    const {col, props} = config;
    return new Promise((resolve, reject) => {
        const validator = new Schema({
            [col]: defaultIfEmpty(props.rules, [])
        });
        validator.validate({[col]: val}, (errors, fields) => {
            if (isEmpty(errors)) {
                props.class = defaultIfBlank(props.class, '').replaceAll('fc-valid-error', '');
                resolve();
            } else {
                props.class = defaultIfBlank(props.class, '') + ' fc-valid-error';
                reject(errors);
            }
        })
    })
}

/**
 * 多行(整行)校验, 校验失败会为每个col配置添加class: valid-error并reject(errors), 成功则会移除每个col可能存在的valid-error，并resolve。
 * @param fatRows 完整的行记录
 * @param context 上下文
 */
export function rowValid(fatRows, context) {
    const validPromises = []
    for (let i = 0; i < fatRows.length; i++) {
        const fatRow = fatRows[i]
        const {editRow, config} = fatRow
        Object.keys(config).map(col => {
            const canEdit = colEditable.call(context == null ? this : context, fatRow, col)
            if (canEdit) {
                validPromises.push(colValid(editRow[col], config[col]))
            }
        });
    }
    // TODO 支持unique校验: 校验fatRows中是否违反unique约束, 此外再借助后端接口/exist校验表中数据是否违反unique约束
    return Promise.all(validPromises)
}

/**
 * 获取编辑配置
 * @param columnConfig 列配置
 * @param editType 编辑类型(inline, form)
 * @returns {{}}
 */
export const getEditConfig = function (columnConfig, editType) {
    const config = {}
    try {
        const keys = Object.keys(columnConfig);
        for (let i = 0; i < keys.length; i++) {
            const col = keys[i];
            const {tableColumnComponentName, inlineItemConfig, formItemConfig} = columnConfig[col];
            // FIX: 此处深拷贝针对FastTableColumnObject可能存在问题(TypeError: Cannot convert a Symbol value to a string)
            // 权衡下，这里无需深拷贝, config内容其实不会更改
            // config[col] = (editType === 'form' ? deepClone(formItemConfig) : deepClone(inlineItemConfig));
            config[col] = (editType === 'form' ? formItemConfig : inlineItemConfig);
            if (tableColumnComponentName === 'fast-table-column') {
                config[col].props.disabled = true;
            }
        }
    } catch (err) {
        console.error(err);
    }
    return config;
}

/**
 * 将行数据转换为table-row格式
 * @param row
 * @param columnConfig
 * @param status 表格状态
 * @prop editType
 * @returns {{editRow: *, row: *, status: string}}
 */
export function toTableRow(row, columnConfig, status = 'normal', editType) {
    const config = getEditConfig(columnConfig, editType);
    if (status === 'insert') {
        // fill row
        const cols = Object.keys(config);
        const newRow = {};
        cols.forEach(col => {
            const {val} = config[col];
            newRow[col] = deepClone(val);
        })
        merge(row, newRow, true, false)
    }
    return {
        row: row,
        editRow: {...row},
        status: status,
        config: config
    }
}

function parseStaticProps(staticProps) {
    const props = {}
    if (!isEmpty(staticProps)) {
        for (const key in staticProps) {
            if (staticProps[key].hasOwnProperty('default')) {
                const defaultV = staticProps[key]['default']
                props[key] = isFunction(defaultV) ? defaultV() : defaultV
            }
        }
    }
    return props
}

/**
 * 构建组件配置
 * @param tableColumnVNodes fast-table-column-* 组成的节点数组，蕴含fast-table-column-*组件节点上的信息(也可能是ElTableColumn)
 * @param tableOption 表格配置
 * @param callback 针对每个table-column解析的回调函数
 */
export function iterBuildComponentConfig(tableColumnVNodes, tableOption, callback) {
    const fromTableProps = { // 通过option传入配置项, 需要作用到搜索或编辑等组件内部
        size: tableOption.style.size
    }

    for (let i = tableColumnVNodes.length - 1; i >= 0; i--) { // 逆序遍历确保简筛顺序
        const columnVNode = tableColumnVNodes[i]
        const {
            props: _props,
            type: {
                name: tableColumnComponentName,
                props: _typeProps,
                mixins = []
            }
        } = columnVNode
        const propsInMixin = mixins.reduce((acc, item) => {
            let mixinProps = parseStaticProps(item.props)
            return {...acc, ...mixinProps}
        }, {})

        const customProps = convertKeyFromCaseToCamel(_props, '-')
        const defaultProps = {
            ...fromTableProps,
            ...parseStaticProps(_typeProps),
            ...propsInMixin
        }
        const props = {...defaultProps, ...customProps}

        const param = {}
        const {showOverflowTooltip, minWidth, ...leftProp} = props
        const {label, prop: col, filter, quickFilter, firstFilter} = leftProp
        if (isEmpty(col)) { // 操作列
            continue
        }
        const customConfig = {
            label: label,
            col: col,
            filter: filter,
            quickFilter: quickFilter,
            firstFilter: firstFilter, // deprecated: 1.6.0
            // 对于FastTableColumn*中定义了的prop, 从leftProp中移除
            props: filterConflictKey(leftProp, columnVNode, ['quickFilterCheckbox', 'quickFilterBlock', 'tableOption'])
        }
        try {
            if (filter !== false) {
                buildFilterComponentConfig(param, tableColumnComponentName, customConfig, tableOption);
            }
            buildEditComponentConfig(param, tableColumnComponentName, customConfig, tableOption);
        } catch (err) {
            console.error(err)
        } finally {
            callback({tableColumnComponentName, col, customConfig: customConfig, ...param})
        }
    }

}


/**
 * 排除掉props中那些已经在vnode里静态定义过的属性(包括事件), 视为columnVNode的，无需透传给底层控件
 *
 * 例如:
 * props中有属性onChange, vnode里在emits中定义了change(columnVNode.type.emits或vnode.type.mixins[*].emits), 则返回的对象中不会包含onChange。
 * 针对事件的过滤，主要目的是预防vnode对应的组件中定义了透传给底层控件的事件，却被传入的覆盖，导致内部的不触发。
 * @param props 属性键值对象
 * @param columnVNode vnode节点
 * @param ignoreKeys 忽略的属性
 * @return 返回过滤后新的props属性
 */
function filterConflictKey(props, columnVNode, ignoreKeys) {
    const {type: {emits = [], props: _props, mixins = []} = {}} = columnVNode
    // 定义的属性
    const allProps = {
        ...(_props || {}),
        ...((mixins || []).reduce((acc, m) => {
            return {...acc, ...m.props}
        }, {}))
    }
    const allPropKeys = Object.keys(allProps)

    // 定义的emits
    const allEmits = new Set([
        ...(emits || []),
        ...((mixins || []).flatMap(m => {
            const {emits: emitsInMixin} = m
            return emitsInMixin || []
        }))
    ])

    const newProps = {}
    for (const [key, value] of Object.entries(props)) {
        if (ignoreKeys.indexOf(key) > -1) {
            newProps[key] = value
            continue
        }

        // 通过在FastTableColumn*中定义的prop中声明一个自定义属性skip为true，表示此属性需要透传到控件上，此法可替代目前的冲突策略。不过还没考虑清楚，先不启用
        // if (_props[key]?.skip === true) {
        //     newProps[key] = value
        //     continue
        // }

        if (allPropKeys.indexOf(key) > -1) {
            continue
        }
        const evtName = extractEventName(key)
        if (evtName && allEmits.has(evtName)) {
            continue
        }
        newProps[key] = value
    }
    return newProps
}

/**
 * 构建过滤器组件配置
 * @param param
 * @param tableColumnComponentName
 * @param customConfig
 * @param tableOption
 */
function buildFilterComponentConfig(param, tableColumnComponentName, customConfig, tableOption) {
    const {filter, quickFilter, firstFilter, props} = customConfig
    customConfig.props = props
    if (filter === false) {
        return
    }

    // build quick filters
    if (quickFilter !== false) {
        try {
            param.quickFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'quick', tableOption);
            if (firstFilter !== false) { // deprecated: 1.6.0
                param.quickFilter.index = 99
            }
            if (util.isNumber(quickFilter)) {
                param.quickFilter.index = quickFilter
            }
        } catch (e) {
            console.error(e)
        }
    }
    // build easy filters
    try {
        param.easyFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'easy', tableOption);
        if (firstFilter !== false) { // deprecated: 1.6.0
            param.easyFilter.index = 99
        }
        if (util.isNumber(filter)) {
            param.easyFilter.index = filter
        }
    } catch (e) {
        console.error(e)
    }
}

/**
 * 构建编辑组件配置
 * @param param
 * @param tableColumnComponentName
 * @param customConfig
 * @param tableOption
 */
function buildEditComponentConfig(param, tableColumnComponentName, customConfig, tableOption) {
    // form表单组件配置
    try {
        param.formItemConfig = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'edit', 'form', tableOption);
    } catch (e) {
        console.error(e)
    }
    // 行内表单组件配置
    try {
        param.inlineItemConfig = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'edit', 'inline', tableOption);
        param.inlineItemConfig.eventMethods = {
            //  绑定一个valid事件, 完成校验逻辑，如果校验不通过，则追加class: valid-error以便显示出来
            valid: (val, ref, props) => {
                colValid(val, param.inlineItemConfig).then(() => {
                    // ref.$el.classList.remove('fc-valid-error') // !!! 这里不用ref是因为当el-table中存在fixed的列时,会渲染两个表格, 然后这个ref拿到的是另一个fixed的那个，导致无法正确显示/移除valid-error
                    props.class = defaultIfBlank(props.class, '').replaceAll('fc-valid-error', '');
                }).catch(errors => {
                    // ref.$el.classList.add('fc-valid-error');
                    props.class = defaultIfBlank(props.class, '') + ' fc-valid-error';
                });
                return val
            }
        }
    } catch (e) {
        console.error(e)
    }
}

// 需要转义值的组件
const components = ['fast-checkbox-group', 'fast-select']

/**
 * 根据组件判断将值转义为显示值
 * @param component 组件名
 * @param val 待转义的原始值, 如果是数组，返回的label也是对应的数组
 * @param config 转义依据的配置
 */
export function escapeValToLabel(component, val, config) {
    if (components.indexOf(component) === -1) {
        return val;
    }

    const {options = [], valKey = 'value', labelKey = 'label'} = config
    const escape = function (val) {
        return val.map(v => {
            const option = options.find(o => o[valKey] === v)
            if (option) {
                return option[labelKey] || v
            }
            return v
        })
    }

    try {
        if (isArray(val)) {
            return escape(val)
        } else {
            const labels = escape([val])
            return labels[0]
        }
    } catch (err) {
        console.log(err)
    }

}

/**
 * 判断单元格是否可编辑
 * @param editRow 当前编辑行
 * @param status 当前编辑状态(normal、insert、update)
 * @param config 当前列的配置
 * @param col 当前列属性
 */
export function colEditable(fatRow, col) {
    const {status, config} = fatRow;
    if (status === 'normal') {
        return false;
    }

    const {editable} = config[col];
    if (isBoolean(editable)) {
        return editable;
    } else if (isFunction(editable)) {
        return editable.call(this, {...fatRow, status, config, col})
    }
    if (status === 'insert') {
        return editable === 'insert';
    }
    if (status === 'update') {
        return editable === 'update';
    }
    return false;
}

/**
 * 构建导出请求参数
 * @param columnConfigs
 * @returns {*}
 */
export function buildParamForExport(columnConfigs) {
    return Object.values(columnConfigs).map(config => {
        return {
            ...config.customConfig,
            tableColumnComponentName: config.tableColumnComponentName,
        }
    })
}

/**
 * 获取filter的条件显示
 * @param filter
 * @return {string}
 */
export function label(filter) {
    const {label, component} = filter
    if (!filter.isEffective()) {
        filter.disabled = true
        return `[${label}]无有效值`
    }
    const conds = filter.getConds();
    let tip = '';
    const {props} = filter
    for (let i = 0; i < conds.length; i++) {
        let {opt, val} = conds[i];
        val = escapeValToLabel(component, val, props);
        switch (opt) {
            case Opt.EQ:
            case Opt.GT:
            case Opt.GE:
            case Opt.LT:
            case Opt.LE:
                tip += `${label} ${opt} ${val}`;
                break;
            case Opt.LIKE:
                tip += `${label} 包含'${val}'`;
                break;
            case Opt.LLIKE:
                tip += `${label}以'${val}'结尾`
                break;
            case Opt.RLIKE:
                tip += `${label}以'${val}'打头`
                break;
            case Opt.NLIKE:
                tip += `${label} 不包含'${val}'`;
                break;
            case Opt.IN:
                tip += `${label} 包含 ${val}`;
                break;
            case Opt.NIN:
                tip += `${label} 不包含 ${val}`;
                break;
            case Opt.NULL:
                tip += `${label} 为null`;
                break;
            case Opt.NNULL:
                tip += `${label} 不为null`;
                break;
            case Opt.EMPTY:
                tip += `${label} 为空`;
                break;
            case Opt.NEMPTY:
                tip += `${label} 不为空`;
                break;
            case Opt.BTW:
                tip += `${label} 在${val}之间`;
                break;
            default:
                tip += `${label}未知的比较符`
                break
        }
        if (i !== conds.length - 1) {
            tip += " 且 "
        }
    }
    return tip;
}

/**
 * 设置自定义存筛，保存到localStorage, 只存条件
 */
export function setCustomFilterGroups(tableOption, filterGroups) {
    const storedConds = filterGroups.map(g => {
        return {
            label: g.label,
            conds: g.filters.map(f => {
                return {
                    col: f.col,
                    opt: util.defaultIfBlank(f.opt, Opt.EQ),
                    val: f.val
                }
            })
        }
    })
    util.setToLocalStorage(`STORED_CONDS:${tableOption.id}`, JSON.stringify(storedConds))
}

/**
 * 从localStorage中获取自定义存筛
 * @param tableOption tableOption
 * @param columnConfig localStorage中只存条件, 需要借助columnConfig进行重建
 */
export function getCustomFilterGroups(tableOption, columnConfig) {
    try {
        const condGroupsStr = util.getFromLocalStorage(`STORED_CONDS:${tableOption.id}`)
        if (util.isEmpty(condGroupsStr)) {
            return []
        }
        const condGroups = JSON.parse(condGroupsStr)
        return buildFilterGroups(tableOption, columnConfig, condGroups, false)
    } catch (err) {
        console.error(err)
        return []
    }
}

/**
 * 根据条件组创建筛选组
 * @param tableOption tableOption
 * @param columnConfig 列配置
 * @param condGroups 条件组
 * @param buildIn 是否为内建筛选组
 * @return {*[]}
 */
export function buildFilterGroups(tableOption, columnConfig, condGroups, buildIn) {
    const filterGroups = []
    if (util.isEmpty(condGroups)) {
        return filterGroups
    }
    for (let i = 0; i < condGroups.length; i++) {
        const {label, conds = []} = condGroups[i]
        if (util.isEmpty(label)) {
            console.error('label can not be empty in storeFilters of tableOption')
            continue
        }
        if (util.isEmpty(conds)) {
            console.error('conds can not be empty in storeFilters of tableOption')
            continue
        }
        if (!util.isArray(conds)) {
            console.error('conds must be a array in storeFilters of tableOption')
            continue
        }
        const filterGroup = {
            label: label,
            filters: [],
            buildIn: buildIn,
            compatible: true
        }
        try {
            for (let j = 0; j < conds.length; j++) {
                const {col, opt = Opt.EQ, val} = conds[j]
                const filter = getFilterComponent(col, columnConfig, tableOption)
                if (!util.isNull(filter)) {
                    filter.opt = opt
                    filter.val = val
                    filterGroup.filters.push(filter)
                } else {
                    filterGroup.compatible = false
                }
            }
        } catch (err) {
            console.error(err)
            filterGroup.filters = []
            filterGroup.compatible = false
        } finally {
            filterGroups.push(filterGroup)
        }
    }
    return filterGroups
}

/**
 * 从columnConfig中针对指定col构造一个Filter
 * @param col
 * @param columnConfig
 * @param tableOption
 * @return {创建Filter对象|null}
 */
export function getFilterComponent(col, columnConfig, tableOption) {
    if (util.isObject(columnConfig) && util.isObject(columnConfig[col]) && util.isObject(columnConfig[col]['customConfig'])) {
        const {customConfig, tableColumnComponentName} = columnConfig[col]
        try {
            return buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'dynamic', tableOption)
        } catch (err) {
            console.error(err)
            return null;
        }
    }
    console.warn(`The column is invalid or filtering is not enabled: ${col}`)
    return null
}
