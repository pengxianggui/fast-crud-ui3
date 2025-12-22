// 引入你的组件实现（dts插件会为它们生成类型）
// 注意：这里要根据实际生成后的类型路径来写，或者直接引用源码
import FastTable from './components/table'
import FastSelect from './components/select'
import FastCheckboxGroup from './components/checkbox-group'
import FastObjectPicker from './components/object-picker'
import FastTableColumn from './components/table-column'
import FastTableColumnDatePicker from './components/table-column-date-picker'
import FastTableColumnFile from './components/table-column-file'
import FastTableColumnImg from './components/table-column-img'
import FastTableColumnInput from './components/table-column-input'
import FastTableColumnNumber from './components/table-column-number'
import FastTableColumnObject from './components/table-column-object'
import FastTableColumnSelect from './components/table-column-select'
import FastTableColumnSwitch from './components/table-column-switch'
import FastTableColumnTextarea from './components/table-column-textarea'
import FastTableColumnTimePicker from './components/table-column-time-picker'
import FastUpload from './components/upload'
// ... 引入其他所有组件

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        FastTable: typeof FastTable
        FastSelect: typeof FastSelect
        FastCheckboxGroup: typeof FastCheckboxGroup
        FastObjectPicker: typeof FastObjectPicker
        FastTableColumn: typeof FastTableColumn
        FastTableColumnDatePicker: typeof FastTableColumnDatePicker
        FastTableColumnFile: typeof FastTableColumnFile
        FastTableColumnImg: typeof FastTableColumnImg
        FastTableColumnInput: typeof FastTableColumnInput
        FastTableColumnNumber: typeof FastTableColumnNumber
        FastTableColumnObject: typeof FastTableColumnObject
        FastTableColumnSelect: typeof FastTableColumnSelect
        FastTableColumnSwitch: typeof FastTableColumnSwitch
        FastTableColumnTextarea: typeof FastTableColumnTextarea
        FastTableColumnTimePicker: typeof FastTableColumnTimePicker
        FastUpload: typeof FastUpload
    }
}

export {}
