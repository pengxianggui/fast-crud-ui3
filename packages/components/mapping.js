import {EditComponentConfig, FilterComponentConfig} from "../model";
import {isFunction, replaceKey} from "../util/util.js";
import FastTableColumnConfig from './table-column/config';
import FastTableColumnDatePickerConfig from './table-column-date-picker/config';
import FastTableColumnFileConfig from './table-column-file/config';
import FastTableColumnImgConfig from './table-column-img/config';
import FastTableColumnInputConfig from './table-column-input/config';
import FastTableColumnNumberConfig from './table-column-number/config';
import FastTableColumnObjectConfig from './table-column-object/config';
import FastTableColumnSelectConfig from './table-column-select/config';
import FastTableColumnSwitchConfig from './table-column-switch/config';
import FastTableColumnTextareaConfig from './table-column-textarea/config';
import FastTableColumnTimePickerConfig from './table-column-time-picker/config';

const MAPPING = {
    'FastTableColumn': FastTableColumnConfig,
    'FastTableColumnDatePicker': FastTableColumnDatePickerConfig,
    'FastTableColumnFile': FastTableColumnFileConfig,
    'FastTableColumnImg': FastTableColumnImgConfig,
    'FastTableColumnInput': FastTableColumnInputConfig,
    'FastTableColumnNumber': FastTableColumnNumberConfig,
    'FastTableColumnObject': FastTableColumnObjectConfig,
    'FastTableColumnSelect': FastTableColumnSelectConfig,
    'FastTableColumnSwitch': FastTableColumnSwitchConfig,
    'FastTableColumnTextarea': FastTableColumnTextareaConfig,
    'FastTableColumnTimePicker': FastTableColumnTimePickerConfig
}

/**
 * 获取配置的装配函数
 * @param tableColumnComponentName 列组件
 * @param type 类型(query/edit)
 * @return {*|null}
 */
export const getConfigFn = function (tableColumnComponentName, type) {
    if (!MAPPING.hasOwnProperty(tableColumnComponentName) || !MAPPING[tableColumnComponentName].hasOwnProperty(type)) {
        // console.error(`未定义针对${tableColumnComponentName}的快速搜索控件`)
        return null;
    }

    return MAPPING[tableColumnComponentName][type]
}

/**
 * 构建最终的过滤组件的配置
 * @param customConfig 用户自定义配置。方法内不会改变此值
 * @param tableColumnComponentName table-column组件名
 * @param type 类型, 可选: quick, easy, dynamic, stored
 * @param tableOption FastTable配置
 */
export const buildFinalQueryComponentConfig = function (customConfig, tableColumnComponentName, type, tableOption) {
    // 排除props中后缀为_e的属性, 因为这些配置项仅用于编辑控件, 并将_q后缀的属性名移除此后缀
    const customProps = replaceKey(customConfig.props, '_q')
    const customFilterConfig = {
        ...customConfig,
        props: {...customProps}
    }

    const finalConfigFn = getConfigFn(tableColumnComponentName, 'query');
    if (!isFunction(finalConfigFn)) {
        throw new Error(`未定义针对${tableColumnComponentName}的查询控件配置`)
    }
    const finalConfig = finalConfigFn(customFilterConfig, type, tableOption);
    return new FilterComponentConfig({
        ...finalConfig,
        type: type
    })
}

/**
 * 构建最终的过滤组件的配置
 * @param customConfig 用户自定义配置。方法内不会改变此值
 * @param tableColumnComponentName table-column组件名
 * @param type 类型, 可选: inline, form
 * @param tableOption FastTable配置
 */
export const buildFinalEditComponentConfig = function (customConfig, tableColumnComponentName, type, tableOption) {
    const customProps = replaceKey(customConfig.props, '_e');
    const customFilterConfig = {
        ...customConfig,
        props: {...customProps}
    }

    const finalConfigFn = getConfigFn(tableColumnComponentName, 'edit');
    if (!isFunction(finalConfigFn)) {
        throw new Error(`未定义针对${tableColumnComponentName}的编辑控件配置`)
    }
    const finalConfig = finalConfigFn(customFilterConfig, type, tableOption);
    return new EditComponentConfig({
        ...finalConfig,
        type: type,
        tableOption: tableOption
    })
}
