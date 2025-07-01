const pickerOptionsQ = {
    disabledDate: function (time) {
        return time.getTime() > Date.now()
    },
    shortcuts: [{
        text: '最近一周',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        }
    }, {
        text: '最近一个月',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
        }
    }, {
        text: '最近三个月',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
        }
    }]
}
const pickerOptionsE = {
    disabledDate: function (time) {
        return time.getTime() > Date.now()
    },
    shortcuts: [{
        text: '今天',
        value: new Date()
    }, {
        text: '昨天',
        value: () => {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            return date
        }
    }, {
        text: '一周前',
        value: () => {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            return date
        }
    }]
}
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
        name: '东汉',
        code: '4'
    }
]

const sizeOptions = [{label: '小', value: 'small'}, {label: '中/默认', value: 'default'}, {label: '大', value: 'large'}]

export default {
    pickerOptionsQ,
    pickerOptionsE,
    sexOptions,
    stateOptions,
    sizeOptions
}
