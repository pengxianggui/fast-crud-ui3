import {buildFinalComponentConfig} from "../../mapping";
import {
    convertKeyFromCaseToCamel,
    deepClone,
    defaultIfBlank,
    defaultIfEmpty, extractEventName,
    isArray,
    isBoolean,
    isEmpty, isFunction,
    isUndefined,
    merge
} from "../../../util/util";

import Schema from 'async-validator'

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

    for (const columnVNode of tableColumnVNodes) {
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
        const {filter = true, showOverflowTooltip, minWidth, ...leftProp} = props
        const {label, prop: col} = leftProp
        if (isEmpty(col)) { // 操作列
            continue
        }
        const customConfig = {
            label: label,
            col: col,
            // 对于FastTableColumn*中定义了的prop, 从leftProp中移除
            props: filterConflictKey(leftProp, columnVNode, ['quickFilterCheckbox', 'firstFilter', 'quickFilterBlock'])
        }

        try {
            // TODO filter、quickFilter支持Number类型，值越小，排序越靠前，filter对快筛、简筛都生效，quickFilter对快筛生效(优先级高于filter)
            if (filter) {
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
    const {quickFilter = false, ...validProp} = customConfig.props;
    customConfig.props = validProp
    // build quick filters
    if (quickFilter !== false) {
        try {
            param.quickFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'quick', tableOption);
        } catch (e) {
            console.error(e)
        }
    }
    // build easy filters
    try {
        param.easyFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'easy', tableOption);
    } catch (e) {
        console.error(e)
    }
    // build easy filters
    try {
        param.dynamicFilter = buildFinalComponentConfig(customConfig, tableColumnComponentName, 'query', 'dynamic', tableOption)
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

    const {options, valKey = 'value', labelKey = 'label'} = config
    const escape = function (val) {
        return val.map(v => {
            const option = options.find(o => o[valKey] === v)
            if (option) {
                return option[labelKey]
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
