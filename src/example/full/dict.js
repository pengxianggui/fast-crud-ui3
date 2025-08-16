new Date();
const sexOptions = [
    {
        label: '男',
        value: '1'
    },
    {
        label: '女',
        value: '0'
    }
]
const stateOptions = [
    {
        name: '魏',
        code: '1'
    },
    {
        name: '蜀',
        code: '2'
    },
    {
        name: '吴',
        code: '3'
    },
    {
        name: '汉',
        code: '4'
    },
    {
        name: '晋',
        code: '5'
    },
    {
        name: '无',
        code: '0'
    }
]

const sizeOptions = [{label: '小', value: 'small'}, {label: '中/默认', value: 'default'}, {label: '大', value: 'large'}]

export default {
    sexOptions,
    stateOptions,
    sizeOptions
}
