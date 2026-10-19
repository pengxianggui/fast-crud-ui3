const EXPORT_SCOPES = ['selected', 'page', 'all']

/**
 * 构建导出弹窗对应的请求参数。
 * 勾选导出只提交主键，空主键表示记录尚未保存。
 *
 * @param {'selected'|'page'|'all'} scope 导出范围
 * @param {Array} columns 导出列配置
 * @param {Array<Object>} selectedRows 已勾选的业务行
 * @param {string} idField 主键字段
 * @returns {{request: {columns: Array, all: boolean, selectedIds?: Array, idField?: string}, hasUnsavedRows: boolean}}
 */
export function buildExportRequest(scope, columns, selectedRows = [], idField = 'id') {
    if (!EXPORT_SCOPES.includes(scope)) {
        throw new Error(`Unsupported export scope: ${scope}`)
    }

    const request = {
        columns,
        all: scope === 'all'
    }
    if (scope !== 'selected') {
        return {request, hasUnsavedRows: false}
    }

    const selectedIds = []
    const seenIds = new Set()
    let hasUnsavedRows = false
    for (const row of selectedRows || []) {
        const id = row?.[idField]
        const isBlankId = id === null || id === undefined || (typeof id === 'string' && id.trim() === '')
        if (isBlankId) {
            hasUnsavedRows = true
            continue
        }
        if (!seenIds.has(id)) {
            seenIds.add(id)
            selectedIds.push(id)
        }
    }

    return {
        request: {
            ...request,
            selectedIds,
            idField
        },
        hasUnsavedRows
    }
}
