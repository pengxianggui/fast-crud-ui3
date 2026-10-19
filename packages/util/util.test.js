import {describe, it, expect} from 'vitest'
import {extractBaseNameFromUrl} from './util.js'

describe('extractBaseNameFromUrl', () => {
    it('空入参(undefined/null/空字符串)返回空字符串', () => {
        expect(extractBaseNameFromUrl(undefined)).toBe('')
        expect(extractBaseNameFromUrl(null)).toBe('')
        expect(extractBaseNameFromUrl('')).toBe('')
    })

    it('完整 https URL 去除域名, 路径分隔符转下划线', () => {
        expect(extractBaseNameFromUrl('https://example.com/api/users')).toBe('api_users')
    })

    it('http URL 且路径为单层时直接返回该段', () => {
        expect(extractBaseNameFromUrl('http://example.org/users')).toBe('users')
    })

    it('带端口号的 URL 正确去除域名与端口', () => {
        expect(extractBaseNameFromUrl('https://example.com:3000/a/b')).toBe('a_b')
    })

    it('去除 query 参数部分', () => {
        expect(extractBaseNameFromUrl('http://localhost:8080/app/data?page=1&size=20')).toBe('app_data')
    })

    it('去除 hash 部分', () => {
        expect(extractBaseNameFromUrl('https://a.com/path/to#anchor')).toBe('path_to')
    })

    it('同时存在 query 和 hash 时都去除', () => {
        expect(extractBaseNameFromUrl('https://a.com/path/to?x=1#section')).toBe('path_to')
    })

    it('域名根路径(仅域名)返回空字符串', () => {
        expect(extractBaseNameFromUrl('https://example.com')).toBe('')
        expect(extractBaseNameFromUrl('https://example.com/')).toBe('')
        expect(extractBaseNameFromUrl('https://example.com?x=1')).toBe('')
    })

    it('协议与域名大小写不敏感, 路径大小写保留', () => {
        expect(extractBaseNameFromUrl('HTTPS://EXAMPLE.COM/Api/Users')).toBe('Api_Users')
    })

    it('以斜杠开头的相对路径去掉首尾斜杠并转换', () => {
        expect(extractBaseNameFromUrl('/api/users/')).toBe('api_users')
        expect(extractBaseNameFromUrl('/users')).toBe('users')
    })

    it('不以斜杠开头的相对路径同样转换', () => {
        expect(extractBaseNameFromUrl('api/users')).toBe('api_users')
        expect(extractBaseNameFromUrl('users')).toBe('users')
    })

    it('多层路径全部转换为下划线', () => {
        expect(extractBaseNameFromUrl('/api/v1/admin/users/list/')).toBe('api_v1_admin_users_list')
    })

    it('多个连续首尾斜杠被去除', () => {
        expect(extractBaseNameFromUrl('///a/b///')).toBe('a_b')
    })

    it('根路径 / 返回空字符串', () => {
        expect(extractBaseNameFromUrl('/')).toBe('')
    })

    it('query 前为根路径时返回空字符串', () => {
        expect(extractBaseNameFromUrl('/?page=1')).toBe('')
    })
})