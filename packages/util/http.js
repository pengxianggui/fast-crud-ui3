import FastTableOption from "../model.js";

/**
 * 发起post请求
 * @param url
 * @param data
 * @return {*}
 */
export function post(url, data) {
    return FastTableOption.$http.post(url, data, {
        headers: {
            'Fc-Request-Id': crypto.randomUUID()
        }
    })
}
