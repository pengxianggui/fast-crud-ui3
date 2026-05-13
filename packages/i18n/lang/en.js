export default {
  crud: {
    // Common buttons
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    refresh: 'Refresh',
    more: 'More',

    // Table related
    table: {
      empty: 'No data',
      loading: 'Loading...',
      total: 'Total {total} records',
      page: 'Page {currentPage}/{totalPage}',
      perPage: '{size} per page',
      selectAll: 'Select All',
      selectNone: 'Select None',
      selectInvert: 'Invert Selection',
      checkedRowDialogTitle: 'All checked rows',
      notSelectDeleteTip: 'Please select or check items to delete',
      cannotAddWhen: 'Cannot add when status is {status}',
      cannotEditWhen: 'Cannot edit when status is {status}',
      notDataDelete: 'No data to delete',
      exitEditMode: 'Please exit edit mode first',
      choseOrCheckNewRows: 'Please choose or check new rows to remove',
      onlyRemoveNewRows: 'Only new rows can be removed',
      notExportable: 'Not Exportable',
    },

    // Operation related
    operation: {
      success: 'Operation successful',
      fail: 'Operation failed',
      confirmDelete: 'Are you sure you want to delete {count} selected records?',
      confirmDeleteSingle: 'Are you sure you want to delete this record?',
      deleteSuccess: 'Delete successful',
      deleteFail: 'Delete failed',
      saveSuccess: 'Save successful',
      saveFail: 'Save failed',
      updateSuccess: 'Update successful',
      updateFail: 'Update failed',
      addSuccess: 'Add successful',
      addFail: 'Add failed',
      clearCheckedRow: 'Uncheck rows',
      successInsert: 'Success insert record: {count}',
      successUpdate: 'Success update record: {count}',
      pleaseSelectData: 'Please select',
    },

    // Form related
    form: {
      required: 'This field is required',
      validating: 'Validating...',
      validationError: 'Validation failed',
      inputPlaceholder: 'Please input',
      selectPlaceholder: 'Please select',
      validateFailed: 'Form validation failed, please check the form and try again.',
    },

    // Upload related
    upload: {
      upload: 'Upload',
      uploadSuccess: 'Upload successful',
      uploadFail: 'Upload failed',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this file?',
      preview: 'Preview',
      download: 'Download',
      drag: 'Drag files here, or',
      click: 'click to upload',
      limit: 'Maximum {limit} files',
      sizeLimit: 'File size cannot exceed {size}',
      typeLimit: 'File type not supported'
    },

    // Filter related
    filter: {
      quickFilter: 'Quick Filter',
      advancedFilter: 'Advanced Filter',
      saveFilter: 'Save Filter',
      saveFilterName: 'Please enter filter name',
      savedFilters: 'Saved Filters',
      deleteFilter: 'Delete Filter',
      deleteFilterConfirm: 'Are you sure you want to delete this filter?',
      useFilter: 'Use this filter',
      filterSaved: 'Filter saved',
      filterDeleted: 'Filter deleted',
      custom: 'Custom',
      todayCreate: 'Created Today',
      thisWeekCreate: 'Created This Week',
      thisMonthCreate: 'Created This Month',
      customFilter: 'Custom Filter Combination',
      noSort: 'No Sort',
      asc: 'Ascending',
      desc: 'Descending',
      inputFilter: 'Input Filter:',
      distinctFilter: 'Distinct Filter:',
      reuseCondition: 'Reuse effective conditions',
      inputFilterPlaceholder: 'Input filter..',
      clickToLoad: 'Click to load',
      queryEmpty: 'Query Empty',
      queryNotEmpty: 'Query Not Empty',
      close: 'Close',
      add: 'Add',
      groupNamePlaceholder: 'Please enter group name',
      incompatibleFilter: 'This filter group is incompatible, please modify',
      and: 'And',
      show: 'Show',
      hide: 'Hide',
      builtInFilterGroups: 'Built-in filter groups',
      enable: 'Enable',
      disable: 'Disable',
      enableAll: 'EnableAll',
      disableAll: 'DisableAll',
      query: 'Query',
      clear: 'Clear',
      noEffectiveVal: 'No effective value',
      dynamic: {
        dialogTitle: 'Filter or sort by: {field}'
      },
      // Condition operators
      cond: {
        equal: '=',
        notEqual: '≠',
        greaterThan: '>',
        greaterEqual: '≥',
        lessThan: '<',
        lessEqual: '≤',
        like: 'contains',
        notLike: 'does not contain',
        rightLike: 'starts with',
        leftLike: 'ends with',
        in: 'includes',
        notIn: 'excludes',
        isNull: 'is null',
        notNull: 'is not null',
        isEmpty: 'is empty',
        notEmpty: 'is not empty',
        between: 'is between',
        unknown: 'unknown operator',
        noEffectiveVal: '[{label}] no effective value'
      },
      date: {
        recent1h: 'Recent 1h',
        recent1d: 'Recent 1d',
        recent1w: 'Recent 1w',
        recent1m: 'Recent 1m',
        recent3m: 'Recent 3m',
        recent1y: 'Recent 1y',
      }
    },

    // Export related
    exports: {
      title: 'Export Data',
      selectColumns: 'Please select columns to export',
      allColumns: 'Select All',
      currentPage: 'Current page data',
      allPages: 'All pages data',
      exportSuccess: 'Export successful',
      exportFail: 'Export failed',
      fileName: 'Export Data',
      titleRow: 'Title Row',
      enterName: 'Please enter name',
      exportable: 'Exportable',
      exportCurrentPage: 'Export Current Page',
      exportAll: 'Export All'
    },

    // Row operation related
    row: {
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      detail: 'Detail',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      removeFromList: 'Remove from delete list'
    },

    // Pagination related
    pagination: {
      goto: 'Go to',
      page: 'Page',
      total: 'Total {total} records',
      size: '{size} per page'
    },
  },
  common: {
    yes: 'yes',
    no: 'no'
  }
}
