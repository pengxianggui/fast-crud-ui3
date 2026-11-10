import {describe, expect, it} from 'vitest'
import {Fragment, h} from 'vue'
import {flattenColumnVNodes} from '../../../packages/components/table/src/util.js'

describe('flattenColumnVNodes', () => {
    it('递归展开插槽与 v-for 产生的 Fragment，并保持列顺序', () => {
        const first = h({name: 'FirstColumn'})
        const second = h({name: 'SecondColumn'})
        const third = h({name: 'ThirdColumn'})

        const vnodes = [
            first,
            h(Fragment, {'key': '_columns'}, [second, h(Fragment, {'key': '_nested'}, [third])])
        ]

        expect(flattenColumnVNodes(vnodes)).toEqual([first, second, third])
    })

    it('忽略空 Fragment 与非 vnode 节点', () => {
        expect(flattenColumnVNodes([null, undefined, h(Fragment, {'key': '_empty'}, [])])).toEqual([])
    })

    it('没有 Fragment 时原样返回', () => {
        const column = h({name: 'OnlyColumn'})
        expect(flattenColumnVNodes([column])).toEqual([column])
    })
})
