import {cloneDeep, isEmpty as _isEmpty} from 'lodash-es'
import moment from "moment/moment"
import {ElMessage} from "element-plus";


/**
 * 剪掉字符串指定的前缀, 如果不是此前缀开头，则直接返回str
 * @param str 待操作的字符串
 * @param prefix 指定前缀
 */
export function cutPrefix(str, prefix) {
    if (!isString(str) || !isString(prefix) || !str.startsWith(prefix)) {
        return str
    }

    return str.slice(prefix.length)
}

/**
 * 断言
 * @param cond
 * @param msg
 */
export function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg);
    }
}

/**
 * 断言并利用错误提示, 会抛出异常
 * @param cond
 * @param msg
 */
export function assertTip(cond, msg) {
    try {
        assert(cond, msg)
    } catch (err) {
        ElMessage.error(msg)
        throw err
    }
}

export function addStartWith(str, startWith) {
    return str.startsWith(startWith) ? str : startWith + str;
}

export function defaultIfBlank(str, defaultStr) {
    return ifBlank(str) ? defaultStr : str;
}

export function ifBlank(str) {
    return str === undefined || str === null || str.trim().length === 0;
}

export function toStr(val) {
    return val + ''
}

/**
 * 三元元算符简化
 * @param cond
 * @param trueVal
 * @param falseVal
 * @returns {*}
 */
export function ternary(cond, trueVal, falseVal) {
    return cond ? trueVal : falseVal
}

export function defaultIfEmpty(val, defaultVal) {
    return isEmpty(val) ? defaultVal : val;
}

/**
 * 驼峰转=>?(默认下划线)
 * @param str
 * @param separator
 * @returns {*}
 */
export function camelCaseTo(str, separator = '_') {
    if (!/[A-Z]/.test(str)) return str; // 无需转换直接返回
    return str.replace(/([A-Z])/g, `${separator}$1`).toLowerCase();
}

/**
 * ?(默认下划线)转驼峰。单个字符串转换
 * @param str
 * @param separator 默认下划线
 */
export function caseToCamel(str, separator = '_') {
    if (!str.includes(separator)) return str; // 无需转换直接返回
    const regex = new RegExp(`\\${separator}([a-z])`, 'g');
    return str.replace(regex, (_, letter) => letter.toUpperCase());
}

/**
 * ?(默认下划线)转驼峰。将一个对象类型中的所有key转换。若obj不是对象类型，则直接返回obj，否则将返回一个新的object
 * @param obj 对象
 * @param separator 默认下划线
 */
export function convertKeyFromCaseToCamel(obj, separator = "_") {
    if (!isObject(obj)) {
        return obj
    }
    const newObj = {}
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const newKey = caseToCamel(key, separator)
        newObj[newKey] = obj[key]
    }
    return newObj
}

/**
 * 判断值是否为对象. 数组、null等都将返回false, 只有严格的{}才会返回true
 * @param val
 */
export function isObject(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Object]'
}

export function isArray(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Array]'
}

export function isBoolean(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Boolean]'
}

export function isString(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object String]'
}

export function isNumber(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Number]'
}

export function isFunction(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Function]'
}

export function isNull(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Null]'
}

export function isUndefined(val) {
    let toStr = Object.prototype.toString.call(val);
    return toStr === '[object Undefined]'
}

/**
 * undefined、null、string、number、boolean视为简单类型，返回true
 * @param val
 * @return {boolean}
 */
export function isSampleType(val) {
    return isUndefined(val) || isNull(val) || isString(val) || isNumber(val) || isBoolean(val)
}

/**
 * 是否是json字符串
 * @param val
 */
export function isJsonStr(val) {
    if (!isString(val)) {
        return false
    }
    try {
        const obj = JSON.parse(val)
        return obj !== null && isObject(obj)
    } catch (e) {
        return false
    }
}

/**
 * 转换为json, 若无法转换则抛出异常
 * @param val
 * @return {*}
 */
export function toJson(val) {
    if (isObject(val)) {
        return val
    }
    if (isJsonStr(val)) {
        return JSON.parse(val)
    }
    throw new Error(`Can't convert to json: ${val}`)
}

/**
 * 是否是http或https打头的url
 * @param val
 * @return {*|boolean}
 */
export function isUrl(val) {
    if (!isString(val)) {
        return false
    }
    return val.startsWith('http://') || val.startsWith('https://')
}

/**
 * 判断一个值是否超过长度
 * @param val 可能是字符串、数字、json等
 * @param width 长度,px像素值(Number类型)
 * @param font 字体设置。默认 "14px Arial", 不同字体大小会影响计算
 */
export function isOverLength(val, width, font = '14px Arial') {
    if (val == null) return false;

    // 转成字符串
    let str;
    if (typeof val === "object") {
        try {
            str = JSON.stringify(val);
        } catch (e) {
            str = String(val);
        }
    } else {
        str = String(val);
    }

    // 创建canvas上下文测量文字宽度
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;

    const textWidth = context.measureText(str).width;

    return textWidth > width;
}

/**
 * 返回值的类型:
 * [object String]、[object Number]、[object Object]、[object Boolean]、
 * [object Array]、[object Function]、[object Null]、[object Undefined]
 * @param value
 * @returns {string}
 */
export function typeOf(value) {
    return Object.prototype.toString.call(value);
}


/**
 * 判断一个值是否为空.
 * 如果是
 * 1. 字符串, 则判断是否为空字符串(空格也被视为空)
 * 2. 对象, 则判断是否无任何键值
 * 3. 数组, 则判断是否无任何数组成员
 * 4. null, 返回true
 * 5. undefined, true
 * 6. 其他情况均返回false
 */
export function isEmpty(value) {
    if (value && typeof value === 'object' && value.$ && value.$.vnode) {
        throw new Error('组件实例不要用isEmpty判空!')
    }
    switch (typeOf(value)) {
        case '[object String]':
            return value.trim() === '';
        case "[object Object]":
            return _isEmpty(value);
        case "[object Array]":
            return value.length === 0;
        case "[object Undefined]":
        case "[object Null]":
            return true;
    }
    return false;
}

/**
 * 清空对象所有的键值
 * @param obj
 */
export function clear(obj) {
    if (isObject(obj)) {
        for (let key in obj) {
            delete obj[key]
        }
    }
}

/**
 * 将字符串转为对象或数组
 * @param str
 * @returns {{}|any}
 */
export function parse(str) {
    if (isEmpty(str)) {
        return {}
    }

    return JSON.parse(str)
}

export function deepClone(obj) {
    if (isObject(obj)) {
        // return Object.assign({}, obj)
        try {
            return cloneDeep(obj);
        } catch (err) {
            console.error(err)
            return {...obj}
        }
    }
    if (isArray(obj)) {
        // return Object.assign([], obj)
        try {
            return cloneDeep(obj);
        } catch (err) {
            console.error(err);
            return [...obj];
        }
    }
    return obj;
}

/**
 * @description merge 策略: 将opt2 merge到opt1, 对于opt1已有的key-value, 默认不覆盖(可由predicate决定), 对于opt2中新的key-value, 追加到opt1中。传入
 * deep值表示是否深度执行merge逻辑(不传入则为true). 函数将更改opt1的值, 同时返回opt1
 * @param opt1 opt1中的k-v将保留。如果不是object类型或者是null类型，则直接返回op1
 * @param opt2 不会改变opt2。如果不是object类型或者是null类型，则直接返回op1
 * @param deep 是否深拷贝模式, 默认true
 * @param ignoreNullAndUndefined 若为true, 则当opt2中的键值如果是null或undefined, 则不会覆盖到opt1中。默认是false
 * @param coverFn 具体k-v合并时的断言。当opt1, opt2有相同key时, 有时我们也希望能合并, 这时可以通过此参数来决定， 提供一个函数，参数: opt1, opt2, key, 返回true/false， 为true则表示也合并, 否则不合并
 * @returns {} 返回merge后的opt1的深拷贝对象
 */
export function merge(opt1, opt2, deep = true, ignoreNullAndUndefined = false, coverFn = (obj1, obj2, key, valueOfObj2) => {
}) {
    if (opt1 === null || !isObject(opt1) || opt2 === null || !isObject(opt2)) {
        return opt1;
    }

    const deepMerge = function (obj1, obj2) {
        if (!isObject(obj1) || !isObject(obj2)) return;
        for (let key in obj2) {
            let valueOfObj1 = obj1[key]
            let valueOfObj2 = obj2[key]

            if (ignoreNullAndUndefined && (isUndefined(valueOfObj2) || isNull(valueOfObj2))) {
                continue;
            }

            if (!(key in obj1)) {
                obj1[key] = deepClone(valueOfObj2);
            } else {
                if (isObject(valueOfObj1) && isObject(valueOfObj2) && deep) {
                    deepMerge(valueOfObj1, valueOfObj2);
                } else {
                    coverFn(obj1, obj2, key, valueOfObj2)
                    // obj1[key] = deepClone(valueOfObj2);
                }
            }
        }
    };

    // deep merge
    deepMerge(opt1, opt2);
    return opt1;
}

/**
 * 将opt2中key的值，赋值到opt1中的同名key上；若opt1上没有同名key则忽略。返回值更新后的opt1
 * @description
 * @param opt1
 * @param opt2
 * @param deep
 * @param ignoreNullAndUndefined
 */
export function mergeValue(opt1, opt2, deep = true, ignoreNullAndUndefined = false) {
    if (opt1 === null || !isObject(opt1) || opt2 === null || !isObject(opt2)) {
        return opt1;
    }
    const deepMerge = function (obj1, obj2) {
        if (!isObject(obj1) || !isObject(obj2)) return;
        for (let key in obj1) {
            let valueOfObj1 = obj1[key]
            if (!(key in obj2)) {
                continue
            }

            let valueOfObj2 = obj2[key]
            if (ignoreNullAndUndefined && (isUndefined(valueOfObj2) || isNull(valueOfObj2))) {
                continue
            }
            if (isObject(valueOfObj1) && isObject(valueOfObj2) && deep) {
                deepMerge(valueOfObj1, valueOfObj2)
            }
            obj1[key] = valueOfObj2
        }
    }
    deepMerge(opt1, opt2)
    return opt1
}

/**
 * @description merge 策略2： 对两个对象中的属性和值执行merge操作, 将opt2中的key-value根据key merge到opt1上： 若op1也存在这个key，则取opt2这个key的值
 * 覆盖到opt1上； 若opt1中不存在, 则会被直接追加到opt1中， 因此函数会更改opt1, 执行完后, opt1将是merge后的对象。最后将opt1的深拷贝返回
 * @param opt1 opt1中的k-v将被覆盖。如果不是object类型或者是null类型，则直接返回op1
 * @param opt2 如果不是object类型或者是null类型，则直接返回op1
 * @param deep 是否深拷贝模式, 默认true
 * @param ignoreNullAndUndefined 若为true, 则当opt2中的键值如果是null或undefined, 则不会覆盖到opt1中。默认是false
 * @returns {} 返回merge后的opt1的深拷贝对象
 */
export function coverMerge(opt1, opt2, deep = true, ignoreNullAndUndefined = false) {
    if (opt1 === null || !isObject(opt1) || opt2 === null || !isObject(opt2)) {
        return opt1;
    }

    const deepMerge = function (obj1, obj2) {
        if (!isObject(obj1) || !isObject(obj2)) return;
        for (let key in obj2) {
            let valueOfObj1 = obj1[key]
            let valueOfObj2 = obj2[key]

            if (ignoreNullAndUndefined && (isUndefined(valueOfObj2) || isNull(valueOfObj2))) {
                continue
            }

            if (key in obj1) {
                if (isObject(valueOfObj1) && isObject(valueOfObj2) && deep) {
                    deepMerge(valueOfObj1, valueOfObj2)
                } else {
                    obj1[key] = deepClone(valueOfObj2)
                }
            } else {
                obj1[key] = deepClone(valueOfObj2)
            }
        }
    }

    deepMerge(opt1, opt2);
    return opt1;
}

/**
 * 解析语法彩蛋条件
 * @param cond
 * @param optMapping
 * @return {*}
 */
export function easyOptParse(cond, optMapping = {}) {
    for (const [reg, obj] of Object.entries(optMapping)) {
        const regex = new RegExp(reg);
        const {opt, valExtract} = obj
        if (regex.test(cond.val)) {
            cond.opt = opt;
            cond.val = valExtract(cond);
            break;
        }
    }
    return cond;
}

/**
 * 向数组中去重添加元素, 如果重复, 则以item覆盖重复的元素(保持位置)。如果不存在重复元素，则添加，根据addToStart参数决定添加到数组的开头还是结尾(push/unshift)
 * @param arr 数组
 * @param item 待添加的元素
 * @param repeatPredicate 去重断言函数, 返回去重判断的结果值(true/false)
 * @param addToStart 添加到数组的开头还是结果(push/unshift)
 */
export function noRepeatAdd(arr, item, repeatPredicate = (ele, item) => ele === item, addToStart = false) {
    if (!isArray(arr)) {
        return;
    }
    let existRepeat = false;
    for (let i = 0; i < arr.length; i++) {
        if (repeatPredicate(arr[i], item)) {
            existRepeat = true;
            arr.splice(i, 1, item);
        }
    }
    if (!existRepeat) {
        addToStart ? arr.unshift(item) : arr.push(item);
    }
}

export function getNameFromUrl(url) {
    const decodeUrl = decodeURIComponent(url);
    const lastSlashIndex = decodeUrl.lastIndexOf('/');
    const lastBackslashIndex = decodeUrl.lastIndexOf('\\');
    const lastIndex = Math.max(lastSlashIndex, lastBackslashIndex);
    if (lastIndex === -1) {
        return decodeUrl;
    }
    return decodeUrl.substring(lastIndex + 1);
}

/**
 * 从fileItems中获取第一个url。
 * @param fileItems 期望是[{name:'', url:''}, ..],如果非数组或空数组，返回null; 为数组则取首个元素，首个元素为对象类型，取url属性返回, 否则直接返回
 * @returns {*|null}
 */
export function getFirstUrlFromFileItems(fileItems) {
    if (!isArray(fileItems) || fileItems.length === 0) {
        return null;
    }
    const firstItem = fileItems[0];
    if (isObject(firstItem)) {
        return firstItem.url;
    }
    return firstItem; // 直接视为url
}

/**
 * 获取元素的完整高度, 包括offsetHeight + 上下margin值
 * @param ele
 */
export function getFullHeight(ele) {
    if (isUndefined(ele)) {
        return 0;
    }
    const style = window.getComputedStyle(ele);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    return ele.offsetHeight + marginTop + marginBottom;
}

/**
 * 获取元素内部高度, 内高
 * @param ele
 * @returns {number}
 */
export function getInnerHeight(ele) {
    if (isUndefined(ele)) {
        return 0;
    }
    const style = window.getComputedStyle(ele);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    return ele.clientHeight - (paddingTop + paddingBottom);
}

/**
 * 按前匹配或后匹配替换对象键
 * @param obj 对象
 * @param str 前缀或后缀
 * @param position 匹配位置. start: 前缀, end: 后缀。不传默认是end
 * @returns {{}}
 */
export function replaceKey(obj, str, position = 'end') {
    if (!isObject(obj)) {
        throw new Error("replaceKey: obj is not an object");
    }
    if (!isString(str)) {
        throw new Error("replaceKey: str is not a string");
    }
    const result = {};

    Object.keys(obj).forEach((key) => {
        let newKey = key;

        if (position === "start" && key.startsWith(str)) {
            newKey = key.slice(str.length); // 去掉开头的字符串
        } else if (position === "end" && key.endsWith(str)) {
            newKey = key.slice(0, -str.length); // 去掉末尾的字符串
        }

        result[newKey] = obj[key];
    });

    return result;
}

/**
 * 超出指定长度则超出部分转换为...
 * @param val
 * @param len
 * @returns {string|*}
 */
export const ellipsis = function (val, len) {
    if (isEmpty(val) || !isString(val)) return '';
    if (!isNumber(len)) {
        console.warn('The "ellipsis" filter requires a numeric second argument as the maxLength.');
        return val;
    }

    return val.length > len ? val.slice(0, len) + '...' : val;
}

/**
 * 日期格式化
 * @param val
 * @param format
 * @returns {string}
 */
export const dateFormat = function (val, format) {
    const date = new Date(val)
    const adjustFormat = format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
    return moment(date).format(adjustFormat)
}

/**
 * 获取指定时间当天起始时间
 * @param date 若为空，则取当前时间
 * @return {Date}
 */
export const getBeginOfDate = function (date) {
    let d
    if (isEmpty(date)) {
        d = new Date()
    } else {
        d = cloneDeep(date)
    }
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * 获取指定时间当周起始时间
 * @param date
 * @return {Date}
 */
export const getBeginOfWeek = function (date) {
    let d
    if (isEmpty(date)) {
        d = new Date()
    } else {
        d = cloneDeep(date)
    }
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * 获取指定时间当月起始时间
 * @param date
 */
export const getBeginOfMonth = function (date) {
    let d
    if (isEmpty(date)) {
        d = new Date()
    } else {
        d = cloneDeep(date)
    }
    d.setDate(1);  // 设置为当月的 1 号
    d.setHours(0, 0, 0, 0);
    return d
}

/**
 * 从属性key中提取事件名。例如: onChange 提取出来就是change
 * @param key
 * @return {string|null}
 */
export function extractEventName(key) {
    if (isEmpty(key) || !key.startsWith('on')) return null;
    const raw = key.slice(2);
    return raw.charAt(0).toLowerCase() + raw.slice(1); // 保留驼峰
}

/**
 * 保存到localStorage中
 * @param key 会拼接"FC:"前缀
 * @param value
 */
export function setToLocalStorage(key, value) {
    localStorage.setItem(`FC:${key}`, value)
}

/**
 * 从localStorage中获取
 * @param key 会拼接"FC:"前缀
 * @return {string}
 */
export function getFromLocalStorage(key) {
    return localStorage.getItem(`FC:${key}`)
}
