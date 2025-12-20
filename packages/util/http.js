import {v4 as uuidv4} from 'uuid'
import FastTableOption from "../model/fastTableOption.js";

/**
 * 发起post请求
 * @param url
 * @param data
 * @param config
 * @return {*}
 */
export function post(url, data, config = {}) {
    return FastTableOption.$http.post(url, data, {
        headers: {
            'Fc-Request-Id': uuidv4()
        },
        ...config
    })
}
