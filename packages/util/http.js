import FastTableOption from "../model.js";
import {v4 as uuidv4} from 'uuid'

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
