import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "FastCrud",
    description: "一个内置实现了标准CRUD功能的组件库(高扩展性)",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            {text: '后端部分', link: '/latest/server/standard-api'},
            {
                text: '历史版本',
                items: [
                    {text: '1.5', link: '/latest/what-is-fastcrud'}
                ]
            }
        ],

        sidebar: [
            {
                text: '简介',
                items: [
                    {text: 'FastCrud是什么?', link: '/latest/what-is-fastcrud'},
                    {text: '快速开始', link: '/latest/getting-started'}
                ]
            },
            {
                text: '功能介绍',
                items: [
                    {text: '标准功能介绍', link: '/latest/feature/summery'},
                    {text: '查询', link: '/latest/feature/query'},
                    {text: '创建', link: '/latest/feature/create'},
                    {text: '更新', link: '/latest/feature/update'},
                    {text: '删除', link: '/latest/feature/delete'},
                    {text: '导出', link: '/latest/feature/export'}
                ]
            },
            {
                text: '组件介绍',
                items: [
                    {text: 'FastTable', link: '/latest/comp/fast-table'},
                    {text: 'FastTableColumn*', link: '/latest/comp/fast-table-column'},
                    // {text: 'FastTableColumn', link: '/latest/comp/fast-table-column'},
                    // {text: 'FastTableColumnInput', link: '/latest/comp/fast-table-column-input'},
                    // {text: 'FastTableColumnNumber', link: '/latest/comp/fast-table-column-number'},
                    // {text: 'FastTableColumnSelect', link: '/latest/comp/fast-table-column-select'},
                    // {text: 'FastTableColumnSwitch', link: '/latest/comp/fast-table-column-switch'},
                    // {text: 'FastTableColumnTextarea', link: '/latest/comp/fast-table-column-textarea'},
                    // {text: 'FastTableColumnImg', link: '/latest/comp/fast-table-column-img'},
                    // {text: 'FastTableColumnFile', link: '/latest/comp/fast-table-column-file'},
                    // {text: 'FastTableColumnDatePicker', link: '/latest/comp/fast-table-column-date-picker'},
                    // {text: 'FastTableColumnTimePicker', link: '/latest/comp/fast-table-column-time-picker'},
                    // {text: 'FastTableColumnObject', link: '/latest/comp/fast-table-column-object'},
                    {text: 'FastSelect', link: '/latest/comp/fast-select'},
                    {text: 'FastCheckboxGroup', link: '/latest/comp/fast-checkbox-group'},
                    {text: 'FastObjectPicker', link: '/latest/comp/fast-object-picker'},
                    {text: 'FastUpload', link: '/latest/comp/fast-upload'},
                ]
            },
            {
                text: '深入了解',
                items: [
                    {text: 'FastTableOption', link: '/latest/advance/fast-table-option'},
                    {text: 'Query/PageQuery', link: '/latest/advance/query'},
                    {text: 'Cond', link: '/latest/advance/cond'},
                    {text: 'FatRow', link: '/latest/advance/fat-row'},
                    {text: 'openDialog', link: '/latest/advance/open-dialog'},
                    {text: 'pick', link: '/latest/advance/pick'}
                ]
            },
            {
                text: '服务端',
                items: [
                    {text: '标准Rest接口', link: '/latest/server/standard-api'},
                    {text: '标准Service层方法', link: '/latest/server/standard-method'},
                    {text: '自定义视图类', link: '/latest/server/custom-vo'},
                    {text: 'MPJLambdaWrapperBuilder', link: '/latest/server/mpj-lambda-wrapper-builder'},
                    {text: 'UpdateJoinWrapperBuilder', link: '/latest/server/update-join-wrapper-builder'},
                    {text: '文件上传', link: '/latest/server/file-upload'},
                    {text: '服务端配置项', link: '/latest/server/yml-config'},
                    {text: '代码生成', link: '/latest/server/code-generate'},
                ]
            },
            {
                text: 'QA',
                items: [
                ]
            },
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/vuejs/vitepress'}
        ]
    }
})
