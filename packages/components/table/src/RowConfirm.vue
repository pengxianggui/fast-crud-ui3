<template>
  <fast-table class="fc-fast-table"
              :data="rows"
              :is-static="true"
              :option="tableOption"
              @selection-change="handleSelectionChange">
    <template v-for="column in columnProps">
      <component :is="column.componentName"
                 v-bind="column.props"
                 v-if="column.hidden === false"/>
    </template>
    <template #button>
      <el-button type="danger" plain :disabled="checkedRows.length === 0" @click="handleRemove"
                 v-if="action === 'delete' && rows.length > 1">从删除清单里移出</el-button>
    </template>
  </fast-table>
</template>

<script>
import FastTableOption from "../../../model.js"

export default {
  name: 'RowConfirm',
  props: {
    rows: {
      type: Array,
      default: () => []
    },
    columnConfigs: Object,
    action: {
      type: String,
      default: () => 'view',
      validator: (value) => ['view', 'delete'].indexOf(value) > -1
    }
  },
  data() {
    return {
      tableOption: new FastTableOption({
        queryable: false,
        insertable: false,
        updatable: false,
        deletable: false,
        exportable: false,
        enableMulti: this.rows.length > 1
      }),
      checkedRows: []
    }
  },
  computed: {
    columnProps() {
      return this.columnConfigs.map(({tableColumnComponentName, customConfig}) => {
        const {hidden, showLength, col, label, props} = customConfig
        return {
          componentName: tableColumnComponentName,
          hidden: hidden,
          props: {
            ...props,
            filter: false,
            prop: col,
            label: label,
            showOverflowToolTip: true,
            showLength: showLength
          }
        }
      })
    }
  },
  methods: {
    handleSelectionChange({fatRows}) {
      this.checkedRows = fatRows
    },
    handleRemove() {
      for (let i = this.rows.length - 1; i >= 0; i--) {
        if (this.checkedRows.some(r => r === this.rows[i])) {
          this.rows.splice(i, 1)
        }
      }
    },
    getRows() {
      return this.rows
    }
  }
}
</script>

<style scoped lang="scss">
</style>
