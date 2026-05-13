export default {
  crud: {
    // 通用按钮
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    search: '搜索',
    reset: '重置',
    export: '导出',
    refresh: '刷新',
    more: '更多',

    // 表格相关
    table: {
      empty: '暂无数据',
      loading: '加载中...',
      total: '共 {total} 条记录',
      page: '第 {currentPage}/{totalPage} 页',
      perPage: '每页 {size} 条',
      selectAll: '全选',
      selectNone: '取消全选',
      selectInvert: '反选',
      checkedRowDialogTitle: '所有勾选的行',
      notSelectDeleteTip: '请点选/勾选要删除的行项',
      cannotAddWhen: '当状态为{status}时, 不允许新增',
      cannotEditWhen: '当状态为{status}时, 不允许编辑',
      notDataDelete: '无可删除数据',
      exitEditMode: '请先退出编辑状态',
      choseOrCheckNewRows: '请先选择或勾选要移除的新建行',
      onlyRemoveNewRows: '只能移除新建的行',
      notExportable: '当前表格不允许导出',
    },

    // 操作相关
    operation: {
      success: '操作成功',
      fail: '操作失败',
      confirmDelete: '确定要删除选中的 {count} 条记录吗？',
      confirmDeleteSingle: '确定要删除这条记录吗？',
      deleteSuccess: '删除成功',
      deleteFail: '删除失败',
      saveSuccess: '保存成功',
      saveFail: '保存失败',
      updateSuccess: '更新成功',
      updateFail: '更新失败',
      addSuccess: '新增成功',
      addFail: '新增失败',
      clearCheckedRow: '清除选中记录',
      successInsert: '成功插入{count}条记录',
      successUpdate: '成功更新{count}条记录',
      pleaseSelectData: '请选择数据',
    },

    // 表单相关
    form: {
      required: '此项为必填项',
      validating: '验证中...',
      validationError: '验证失败',
      inputPlaceholder: '请输入',
      selectPlaceholder: '请选择',
      validateFailed: '表单校验未通过! 请检查输入内容'
    },

    // 上传相关
    upload: {
      upload: '上传',
      uploadSuccess: '上传成功',
      uploadFail: '上传失败',
      delete: '删除',
      deleteConfirm: '确定要删除此文件吗？',
      preview: '预览',
      download: '下载',
      drag: '拖拽文件到此处，或',
      click: '点击上传',
      limit: '最多上传 {limit} 个文件',
      sizeLimit: '文件大小不能超过 {size}',
      typeLimit: '不支持此文件类型'
    },

    // 筛选相关
    filter: {
      quickFilter: '快速筛选',
      advancedFilter: '高级筛选',
      saveFilter: '保存筛选条件',
      saveFilterName: '请输入筛选条件名称',
      savedFilters: '已保存筛选条件',
      deleteFilter: '删除筛选条件',
      deleteFilterConfirm: '确定要删除此筛选条件吗？',
      useFilter: '使用此筛选条件',
      filterSaved: '筛选条件已保存',
      filterDeleted: '筛选条件已删除',
      custom: '自定义',
      todayCreate: '当天新建',
      thisWeekCreate: '当周新建',
      thisMonthCreate: '当月新建',
      customFilter: '自定义组合筛选',
      noSort: '不排序',
      asc: '升序',
      desc: '降序',
      inputFilter: '输入过滤：',
      distinctFilter: '去重筛选：',
      reuseCondition: '复用已生效的条件',
      inputFilterPlaceholder: '输入过滤..',
      clickToLoad: '请点击加载',
      queryEmpty: '查空值',
      queryNotEmpty: '查非空值',
      close: '关闭',
      add: '添加',
      groupNamePlaceholder: '请输入组合名',
      incompatibleFilter: '此筛选组不兼容, 请修改',
      and: '且',
      show: '显示',
      hide: '隐藏',
      builtInFilterGroups: '内置的组合筛选项',
      enable: '启用',
      disable: '禁用',
      enableAll: '全启',
      disableAll: '全禁',
      query: '查询',
      clear: '清空',
      noEffectiveVal: '无有效值',
      dynamic: {
        dialogTitle: '筛选或排序: {field}'
      },
      // 条件操作符
      cond: {
        equal: '=',
        notEqual: '≠',
        greaterThan: '>',
        greaterEqual: '≥',
        lessThan: '<',
        lessEqual: '≤',
        like: '包含',
        notLike: '不包含',
        rightLike: '以...打头',
        leftLike: '以...结尾',
        in: '包含',
        notIn: '不包含',
        isNull: '为null',
        notNull: '不为null',
        isEmpty: '为空',
        notEmpty: '不为空',
        between: '在...之间',
        unknown: '未知的比较符',
        noEffectiveVal: '[{label}]无有效值'
      },
      date: {
        recent1h: '最近1小时',
        recent1d: '最近1天',
        recent1w: '最近1周',
        recent1m: '最近1月',
        recent3m: '最近3月',
        recent1y: '最近1年',
      }
    },

    // 导出相关
    exports: {
      title: '导出数据',
      selectColumns: '请选择要导出的列',
      allColumns: '全选',
      currentPage: '当前页数据',
      allPages: '所有页数据',
      exportSuccess: '导出成功',
      exportFail: '导出失败',
      fileName: '导出数据',
      titleRow: '标题行',
      enterName: '请输入名称',
      exportable: '是否导出',
      exportCurrentPage: '导出当前页',
      exportAll: '导出全部'
    },

    // 行操作相关
    row: {
      edit: '编辑',
      delete: '删除',
      view: '查看',
      detail: '详情',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      removeFromList: '从删除清单里移出'
    },

    // 分页相关
    pagination: {
      goto: '前往',
      page: '页',
      total: '共 {total} 条',
      size: '每页 {size} 条'
    }
  },
  common: {
    yes: '是',
    no: '否'
  }
}
