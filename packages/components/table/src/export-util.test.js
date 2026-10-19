import {describe, expect, it} from 'vitest'
import {buildExportRequest} from './export-util.js'

const columns = [{col: 'name', label: '姓名', exportable: true}]

describe('buildExportRequest', () => {
    it('当前页和全部导出保持原有参数结构', () => {
        expect(buildExportRequest('page', columns)).toEqual({
            request: {columns, all: false},
            hasUnsavedRows: false
        })
        expect(buildExportRequest('all', columns)).toEqual({
            request: {columns, all: true},
            hasUnsavedRows: false
        })
    })

    it('勾选导出提交去重后的主键集合', () => {
        const result = buildExportRequest('selected', columns, [
            {id: 1, name: '张三'},
            {id: '2', name: '李四'},
            {id: 1, name: '张三重复项'}
        ], 'id')

        expect(result).toEqual({
            request: {
                columns,
                all: false,
                selectedIds: [1, '2'],
                idField: 'id'
            },
            hasUnsavedRows: false
        })
    })

    it('勾选导出识别未保存记录并跳过空主键', () => {
        const result = buildExportRequest('selected', columns, [
            {id: null},
            {id: undefined},
            {id: '  '},
            {id: 3}
        ])

        expect(result).toEqual({
            request: {
                columns,
                all: false,
                selectedIds: [3],
                idField: 'id'
            },
            hasUnsavedRows: true
        })
    })

    it('拒绝未知导出范围', () => {
        expect(() => buildExportRequest('unknown', columns)).toThrow('Unsupported export scope')
    })
})
