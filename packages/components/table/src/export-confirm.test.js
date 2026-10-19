import {renderToString} from '@vue/server-renderer'
import {createSSRApp, h} from 'vue'
import {describe, expect, it, vi} from 'vitest'
import i18n from '../../../i18n/index.js'
import ExportConfirm from './export-confirm.vue'

vi.mock('element-plus', async () => {
    const {h} = await import('vue')
    const slotContainer = (tag) => ({
        setup(_, {slots}) {
            return () => h(tag, slots.default?.())
        }
    })
    return {
        ElButton: {
            props: {
                disabled: Boolean
            },
            setup(props, {slots}) {
                return () => h('button', {disabled: props.disabled}, slots.default?.())
            }
        },
        ElInput: {render: () => null},
        ElSwitch: {render: () => null},
        ElTable: slotContainer('div'),
        ElTableColumn: {render: () => null}
    }
})

async function renderExportConfirm(props) {
    const app = createSSRApp({
        render: () => h(ExportConfirm, props)
    })
    app.use(i18n)
    return renderToString(app)
}

describe('ExportConfirm', () => {
    it('多选时按勾选、当前页、全部的顺序展示按钮和勾选数量', async () => {
        const html = await renderExportConfirm({
            columns: [],
            showSelected: true,
            selectedCount: 3
        })

        const selectedIndex = html.indexOf('导出已勾选的（3）')
        const currentPageIndex = html.indexOf('导出当前页')
        const allIndex = html.indexOf('导出全部')

        expect(selectedIndex).toBeGreaterThan(-1)
        expect(selectedIndex).toBeLessThan(currentPageIndex)
        expect(currentPageIndex).toBeLessThan(allIndex)
    })

    it('零勾选时禁用勾选导出按钮', async () => {
        const html = await renderExportConfirm({
            columns: [],
            showSelected: true,
            selectedCount: 0
        })

        expect(html).toContain('disabled')
        expect(html).toContain('导出已勾选的（0）')
    })

    it('未启用多选时不展示勾选导出按钮', async () => {
        const html = await renderExportConfirm({
            columns: [],
            showSelected: false,
            selectedCount: 0
        })

        expect(html).not.toContain('导出已勾选')
    })
})
