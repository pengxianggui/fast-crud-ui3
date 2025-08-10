# FastUpload

基于`el-upload`封装的一个上传控件, 为了简化上传组件的开发。

## 属性

| 属性               | 说明                                   | 类型                                                                   | 默认值     |
|------------------|--------------------------------------|----------------------------------------------------------------------|---------|
| listType         | 取值:picture-card或text,前者呈现为图片,后者呈现为附件 | `String`                                                             | `text`  |
| multiple         | 是否支持多文件, 默认只能传一个文件                   | `Boolean`                                                            | `false` |
| limit            | 当multiple为true时,此值限制文件数量(必配置)        | `Number`                                                             | `1`     |
| action           | 上传地址路径                               | `String`                                                             | `/`     |
| disabled         | 是否禁用                                 | `Boolean`                                                            | `false` |
| on-preview       | 预览时                                  | `Function<(file, {row, column, $index}) => void>`                    | -       |
| before-remove    | 移除前                                  | `Function<(file, files, {row, column, $index}) => void>`             | -       |
| on-remove        | 移除前                                  | `Function<(file, files, {row, column, $index}) => void>`             | -       |
| response-handler | 上传成功后、组件接收前对数据二次处理                   | `Function<(response, file, files, {row, column, $index}) => String>` | -       |
| on-success       | 上传成功后, 组件处理完毕后                       | `Function<(response, file, files, {row, column, $index}) => void>`   | -       |
| on-progress      | 上传时                                  | `Function<(event, file, files, {row, column, $index}) => void>`      | -       |
| on-change        | 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用      | `Function<(event, file, files, {row, column, $index}) => void>`      | -       |
| on-exceed        | 当超出限制时，执行的钩子函数                       | `Function<(file, files, {row, column, $index}) => void>`             | -       |
