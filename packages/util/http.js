import {v4 as uuidv4} from 'uuid'
import FastTableOption from "../model/fastTableOption.js";

/**
 * 发起post请求
 * @param url
 * @param params
 * @param data
 * @param config
 * @return {*}
 */
export function post(url, params, data, config = {}) {
    return FastTableOption.$http.post(url, data, {
        headers: {
            'Fc-Request-Id': uuidv4()
        },
        params: params,
        ...config
    })
}

/**
 * 发起multipart/form-data的post请求(用于文件上传等)
 * @param url
 * @param params
 * @param formData FormData实例
 * @param config
 * @return {*}
 */
export function postForm(url, params, formData, config = {}) {
    return FastTableOption.$http.post(url, formData, {
        headers: {
            'Fc-Request-Id': uuidv4(),
            'Content-Type': 'multipart/form-data'
        },
        params: params,
        ...config
    })
}
