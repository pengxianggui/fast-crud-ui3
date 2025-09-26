<template>
  <div class="fc-table-column-head-cell" :class="{'filter': column.filter !== false && column.dynamicFilter !== false}">
    <slot></slot>
    <el-icon v-if="column.order === 'asc' || column.order === 'desc'" class="sort-icon">
      <SortUp v-if="column.order === 'asc'"/>
      <SortDown v-else/>
    </el-icon>
  </div>
</template>

<script>
import {SortDown, SortUp} from "@element-plus/icons-vue"

export default {
  name: "fast-table-head-cell",
  components: {SortDown, SortUp},
  props: {
    column: Object
  }
}
</script>

<style scoped lang="scss">
.fc-table-column-head-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 38px;
  line-height: 38px;
  margin: 0 10px;
}

.fc-table-column-head-cell.filter {
  cursor: pointer;
}

.sort-icon {
  color: #409eff;
}
</style>
