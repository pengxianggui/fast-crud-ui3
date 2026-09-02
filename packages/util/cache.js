import {isEmpty, isNumber, ternary} from "./util.js";

/**
 * 带有过期时间的 localStorage 封装
 * 实现了 set 和 get 方法来模拟缓存有效期
 */
const STORAGE_KEY_PREFIX = 'FC:';


/**
 * 保存到localStorage中
 * @param key 会拼接"FC:"前缀
 * @param value any
 * @param seconds 缓存有效期(null/undefined, 均表示不设置有效期)
 */
export function setToLocalStorage(key, value, seconds) {
    setItem(localStorage, key, value, seconds)
}

/**
 * 从localStorage中获取
 * @param key 会拼接"FC:"前缀
 * @return {string}
 */
export function getFromLocalStorage(key) {
    return getItem(localStorage, key)
}

export function deleteFromLocalStorage(key) {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}:${key}`)
}

export function setToSessionStorage(key, value, seconds) {
    setItem(sessionStorage, key, value, seconds)
}

export function getFromSessionStorage(key) {
    return getItem(sessionStorage, key)
}

export function deleteFromSessionStorage(key) {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`)
}

/**
 * 将数据存储到 localStorage，并设置过期时间
 * @param storage localStorage或sessionStorage
 * @param {string} key 存储的键名 (会被添加前缀)
 * @param {*} value 要存储的任何类型的数据
 * @param {number} seconds 有效期，单位为秒
 */
const setItem = (storage, key, value, seconds) => {
    const item = {
        value: value,
        expiry: ternary(isEmpty(seconds), null, new Date().getTime() + seconds * 1000)
    };

    try {
        storage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(item));
    } catch (error) {
        console.error('存储数据失败:', error);
    }
}

/**
 * 从 localStorage 中获取数据，并检查是否过期
 * @param storage localStorage或sessionStorage
 * @param {string} key 存储的键名
 * @returns {*} 如果数据有效则返回存储的值，否则返回 null
 */
const getItem = (storage, key) => {
    const storedItem = storage.getItem(STORAGE_KEY_PREFIX + key);
    if (!storedItem) {
        return null; // 没有找到缓存
    }
    let item;
    try {
        // 解析存储的 JSON 字符串
        item = JSON.parse(storedItem);
    } catch (error) {
        console.error('解析存储数据失败，清除缓存:', error);
        storage.removeItem(STORAGE_KEY_PREFIX + key);
        return null;
    }
    // 检查是否过期
    if (!isEmpty(item.expiry) && isNumber(item.expiry) && new Date().getTime() > item.expiry) {
        console.log(`${key} has bean expired, removed..`);
        storage.removeItem(STORAGE_KEY_PREFIX + key);
        return null;
    }
    return item.value;
}
