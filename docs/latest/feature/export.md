# 导出

导出功能入口在“更多 > 导出”:
![img_14](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_14.png)

点击导出，进入导出面板：
![img_15](https://pengxg-note.oss-cn-shanghai.aliyuncs.com/halo/img_15.png)

你可以定制导出excel的表头，以及设置某些列不导出，最后根据需要导出当前页或全部数据。

> 由于excel单个单元格难以支持多图/多文件，因此`FastTableColumnImg`和`FastTableColumnFile`配置为multiple时, 导出的内容不渲染图片，
> 为原始json数据。

> 下拉列(`FastTableColumnSelect`/`FastTableColumnSwitch`)会带上数据校验下拉。excel的内联下拉列表以英文逗号分隔且总长不能超过255字符，
> 因此当某个选项文案含英文逗号或选项总长超限时，后端会自动降级为"引用隐藏sheet区间"的下拉校验，确保一个选项不会被拆成两个。
> 该隐藏sheet(`__fc_options__`)仅在出现上述情况时才生成，并被标记为隐藏。
