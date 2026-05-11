import FastCheckboxGroup from "./components/checkbox-group";
import FastCellContent from "./components/content-dialog/src/fast-cell-content.vue";
import FastJsonViewer from "./components/json-viewer/src/fast-json-viewer.vue";
import FastSelect from "./components/select";
import FastUpload from "./components/upload";
import FastObjectPicker from './components/object-picker'
import FastTable from './components/table'
import FastTableColumn from './components/table-column'
import FastTableColumnDatePicker from './components/table-column-date-picker'
import FastTableColumnImg from './components/table-column-img'
import FastTableColumnFile from './components/table-column-file'
import FastTableColumnInput from './components/table-column-input'
import FastTableColumnNumber from './components/table-column-number'
import FastTableColumnObject from './components/table-column-object'
import FastTableColumnSelect from './components/table-column-select'
import FastTableColumnSwitch from './components/table-column-switch'
import FastTableColumnTextarea from './components/table-column-textarea'
import FastTableColumnTimePicker from './components/table-column-time-picker'
import {openDialog} from "./util/dialog";
import {pick} from "./util/pick";
import "./style.scss"
import FastTableOption from "./model/fastTableOption.js";
import Opt from './model/opt.js'
import Cond from './model/cond.js'
import Order from './model/order.js'
import Query from './model/query.js'
import PageQuery from './model/pageQuery.js'
import i18n, { useFastCrudI18n, setLanguage, getLanguage, configureI18n, i18nMessages, setAppI18n } from './i18n/index.js'
import {
    isEmpty,
    isString,
    isNumber,
    isArray,
    ifBlank,
    isFunction,
    isObject,
    isBoolean,
    isNull,
    isUndefined,
    defaultIfEmpty,
    defaultIfBlank,
    camelCaseTo,
    caseToCamel,
    clear,
    deepClone,
    merge,
    coverMerge
} from "./util/util";

const components = [
    FastCheckboxGroup,
    FastSelect,
    FastUpload,
    FastObjectPicker,
    FastTable,
    FastTableColumn,
    FastTableColumnDatePicker,
    FastTableColumnFile,
    FastTableColumnImg,
    FastTableColumnInput,
    FastTableColumnNumber,
    FastTableColumnObject,
    FastTableColumnSelect,
    FastTableColumnSwitch,
    FastTableColumnTextarea,
    FastTableColumnTimePicker
];

const directives = [
]

let globalAppContext = null

function findExistingI18nInstance(app) {
    const provides = app._context && app._context.provides
    if (!provides) return null
    const keys = Object.getOwnPropertySymbols(provides)
    for (const key of keys) {
        const value = provides[key]
        if (value && value.global && typeof value.global.mergeLocaleMessage === 'function' && typeof value.global.t === 'function') {
            return value
        }
    }
    return null
}

const install = function (app, opts = {}) {
    globalAppContext = app._context
    if (opts.hasOwnProperty('$http')) {
        FastTableOption.$http = opts.$http
    }
    if (opts.hasOwnProperty('$router')) {
        FastTableOption.$router = opts.$router
    }
    if (opts.i18n) {
        configureI18n(opts.i18n)
    }
    const existingI18n = findExistingI18nInstance(app)
    if (existingI18n) {
        setAppI18n(existingI18n)
        for (const lang in i18nMessages) {
            existingI18n.global.mergeLocaleMessage(lang, i18nMessages[lang])
        }
    } else {
        app.use(i18n)
        setAppI18n(i18n)
    }
    components.forEach(component => {
        app.component(component.name, component);
    });
    directives.forEach(directive => {
        app.use(directive)
    })
};

const util = {
    isEmpty,
    isString,
    isNumber,
    isArray,
    ifBlank,
    isFunction,
    isObject,
    isBoolean,
    isNull,
    isUndefined,
    defaultIfEmpty,
    defaultIfBlank,
    camelCaseTo,
    caseToCamel,
    clear,
    deepClone,
    merge,
    coverMerge,
    openDialog,
    pick
}

export {
    FastCheckboxGroup,
    FastCellContent,
    FastJsonViewer,
    FastSelect,
    FastUpload,
    FastObjectPicker,
    FastTable,
    FastTableColumn,
    FastTableColumnDatePicker,
    FastTableColumnFile,
    FastTableColumnImg,
    FastTableColumnInput,
    FastTableColumnNumber,
    FastTableColumnObject,
    FastTableColumnSelect,
    FastTableColumnSwitch,
    FastTableColumnTextarea,
    FastTableColumnTimePicker,
    FastTableOption,
    Opt,
    PageQuery,
    Query,
    Order,
    Cond,
    util,
    useFastCrudI18n,
    setLanguage,
    getLanguage,
    configureI18n,
    setAppI18n,
    i18nMessages
}

// 获取App上下文
export const getAppContext = () => globalAppContext

export default {
    install
};
