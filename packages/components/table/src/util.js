import {buildFinalQueryComponentConfig, buildFinalEditComponentConfig} from "../../mapping";
import Schema from 'async-validator'
import {Opt} from "../../../model.js";
import * as util from "../../../util/util.js";
import * as cache from '../../../util/cache.js'

/**
 * 单个col值校验, 校验失败会添加class: valid-error并reject(errors), 成功则会移除可能存在的valid-error，并resolve
 * @param editRow 当前单元格所在行数据
 * @param config col完整的config配置
 * @returns {Promise<unknown>} 若校验通过resolve, 否则reject(errors)
 */
export function colValid(editRow, config) {
    const {col, props} = config;
    const val = editRow[col]
    return new Promise((resolve, reject) => {
        if (util.isEmpty(props?.rules)) {
            resolve()
            return
        }
        props.rules.forEach(rule => rule.getRow = (() => editRow)) // 为了自定义验证器里能获取到当前行 煞费苦心
        const validator = new Schema({
            [col]: util.defaultIfEmpty(props.rules, [])
        });
        validator.validate({[col]: val}, async (errors, fields) => {
            if (util.isEmpty(errors)) {
                props.class = util.defaultIfBlank(props.class, '').replaceAll('fc-valid-error', '');
                resolve();
            } else {
                props.class = util.defaultIfBlank(props.class, '') + ' fc-valid-error';
                reject(errors);
            }
        })
    })
}

/**
 * 多行(整行)校验, 校验失败会为每个col配置添加class: valid-error并reject(errors), 成功则会移除每个col可能存在的valid-error，并resolve。
 * @param fatRows 完整的行记录
 * @param tableOption tableOption
 * @return 返回Promise, 校验通过走then; 校验失败走catch(errors)
 */
export function rowValid(fatRows, tableOption) {
    const validPromises = []
    const context = tableOption.context
    for (let i = 0; i < fatRows.length; i++) {
        const fatRow = fatRows[i]
        const {editRow, config} = fatRow
        Object.keys(config).map(col => {
            const canEdit = colEditable.call(context == null ? this : context, fatRow, col)
            if (canEdit) {
                validPromises.push(colValid(editRow, config[col]))
            }
        });
    }
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
            // config[col] = (editType === 'form' ? util.deepClone(formItemConfig) : util.deepClone(inlineItemConfig));
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
            newRow[col] = util.deepClone(val);
        })
        util.merge(row, newRow, true, false)
    }
    return {
        row: row,
        editRow: {...row},
        status: status,
        config: util.deepClone(config)
    }
}

export function isFatRow(row) {
    return row.hasOwnProperty('row')
        && row.hasOwnProperty('editRow')
        && row.hasOwnProperty('status')
        && row.hasOwnProperty('config')
}

function parseStaticProps(staticProps) {
    const props = {}
    if (!util.isEmpty(staticProps)) {
        for (const key in staticProps) {
            if (staticProps[key].hasOwnProperty('default')) {
                const defaultV = staticProps[key]['default']
                props[key] = util.isFunction(defaultV) ? defaultV() : defaultV
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

    for (let i = 0; i < tableColumnVNodes.length; i++) {
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

        const customProps = util.convertKeyFromCaseToCamel(_props, '-')
        const defaultProps = {
            ...fromTableProps,
            ...parseStaticProps(_typeProps),
            ...propsInMixin
        }
        const props = {...defaultProps, ...customProps}

        const param = {}
        const {showOverflowTooltip, minWidth, ...leftProp} = props
        const {label, prop: col, filter, quickFilter, dynamicFilter, unique, firstFilter, hidden, showLength} = leftProp
        if (util.isEmpty(col)) { // 操作列
            continue
        }
        const customConfig = {
            label: label,
            col: col,
            filter: filter, // 当前列是否支持过滤(快筛、简筛、动筛)
            quickFilter: quickFilter, // 当前列是否支持快筛
            dynamicFilter: dynamicFilter, // 当前列是否支持动筛
            unique: unique,
            firstFilter: firstFilter, // deprecated: 1.6.0
            hidden: hidden,
            showLength: showLength,
            // 对于FastTableColumn*中定义了的prop, 从leftProp中移除 TODO 1.5.16 针对FastTableColumn* props中定义的属性，而又不希望透传给内置控件的, 应当在FastTableColumn*中声明, 而不是在这里设置"黑名单"
            props: filterConflictKey(leftProp, columnVNode, ['quickFilterCheckbox', 'quickFilterBlock', 'tableOption', 'quickFilterConfig'])
            // props: leftProp
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
        const evtName = util.extractEventName(key)
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
    const {filter, quickFilter, firstFilter, hidden, props} = customConfig
    customConfig.props = props
    if (filter === false) {
        return
    }

    // build quick filters
    if (quickFilter !== false) {
        try {
            param.quickFilter = buildFinalQueryComponentConfig(customConfig, tableColumnComponentName, 'quick', tableOption);
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
    if (!hidden) {
        try {
            param.easyFilter = buildFinalQueryComponentConfig(customConfig, tableColumnComponentName, 'easy', tableOption);
            param.easyFilter.disabled = true
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
        param.formItemConfig = buildFinalEditComponentConfig(customConfig, tableColumnComponentName, 'form', tableOption);
    } catch (e) {
        console.error(e)
    }
    // 行内表单组件配置
    try {
        param.inlineItemConfig = buildFinalEditComponentConfig(customConfig, tableColumnComponentName, 'inline', tableOption);
        param.inlineItemConfig.eventMethods = {
            //  绑定一个valid事件, 完成校验逻辑，如果校验不通过，则追加class: valid-error以便显示出来
            valid: (val, row, ref, props) => {
                colValid(row, param.inlineItemConfig).then(() => {
                    // ref.$el.classList.remove('fc-valid-error') // !!! 这里不用ref是因为当el-table中存在fixed的列时,会渲染两个表格, 然后这个ref拿到的是另一个fixed的那个，导致无法正确显示/移除valid-error
                    props.class = util.defaultIfBlank(props.class, '').replaceAll('fc-valid-error', '');
                }).catch(errors => {
                    // ref.$el.classList.add('fc-valid-error');
                    props.class = util.defaultIfBlank(props.class, '') + ' fc-valid-error';
                });
                return val
            }
        }
    } catch (e) {
        console.error(e)
    }
}

// 需要转义值的组件
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
    if (util.isBoolean(editable)) {
        return editable;
    } else if (util.isFunction(editable)) {
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
            // 图片和文件默认不导出,不然往往文件太大
            exportable: config.tableColumnComponentName !== 'FastTableColumnImg' && config.tableColumnComponentName !== 'FastTableColumnFile'
        }
    })
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
    cache.setToLocalStorage(`STORED_CONDS:${tableOption.id}`, storedConds)
}

/**
 * 从localStorage中获取自定义存筛
 * @param tableOption tableOption
 * @param columnConfig localStorage中只存条件, 需要借助columnConfig进行重建
 */
export function getCustomFilterGroups(tableOption, columnConfig) {
    try {
        const condGroups = cache.getFromLocalStorage(`STORED_CONDS:${tableOption.id}`)
        if (util.isEmpty(condGroups) || !util.isArray(condGroups)) {
            return []
        }
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
                const filter = buildStoredFilterComponent(col, columnConfig, tableOption)
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
 * 从columnConfig中针对指定col构造一个Filter, 返回null表示
 * @param col
 * @param columnConfig
 * @param tableOption
 * @return FilterComponentConfig
 */
export function buildStoredFilterComponent(col, columnConfig, tableOption) {
    if (util.isObject(columnConfig) && util.isObject(columnConfig[col]) && util.isObject(columnConfig[col]['customConfig'])) {
        const {customConfig, tableColumnComponentName} = columnConfig[col]
        try {
            return buildFinalQueryComponentConfig(customConfig, tableColumnComponentName, 'stored', tableOption)
        } catch (err) {
            console.error(err)
            return null;
        }
    }
    console.warn(`The column is invalid or filtering is not enabled: ${col}`)
    return null
}
