<template>
  <el-select v-model="value" v-bind="$attrs" :size="size" :multiple="multiple"
             @change="(val) => handleChange(val)"
             @clear="() => handleClear()"
             @focus="(event) => $emit('focus', event)"
             @blur="(event) => $emit('blur', event)"
             @visible-change="(visible) => $emit('visibleChange', visible)"
             @remove-tag="(tagVal) => $emit('removeTag', tagVal)">
    <el-option v-for="item in nativeOptions" :key="item.value" :label="item[labelKey]" :value="item[valKey]"
               :disabled="disableVal.indexOf(item[valKey]) > -1"></el-option>
  </el-select>
</template>

<script>
import FastTableOption from '../../../model/fastTableOption.js'
import Query from '../../../model/query.js'
import * as util from '../../../util/util.js'

export default {
  name: "fast-select",
  emits: ['update:modelValue', 'change', 'clear', 'focus', 'blur', 'visibleChange', 'removeTag'],
  props: {
    modelValue: {
      required: true
    },
    options: {
      type: [Array, FastTableOption],
      default: () => []
    },
    labelKey: {
      type: String,
      default: () => "label"
    },
    valKey: {
      type: String,
      default: () => "value"
    },
    pickMap: { // 单选时, 选中选项后按此映射将选项数据字段回填到pickObject(编辑行)的目标字段上: key为选项数据字段, value为pickObject目标字段
      type: Object,
      default: () => ({})
    },
    pickObject: Object, // 单选时, 映射回填的目标对象(一般为当前编辑行editRow)
    multiple: { // 多值时, value为数组
      type: Boolean,
      default: () => false
    },
    disableVal: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      nativeOptions: util.isArray(this.options) ? this.options : []
    }
  },
  async mounted() {
    if (this.multiple === true && !util.isEmpty(this.pickObject) && !util.isEmpty(this.pickMap)) {
      console.warn('[FastSelect] pickMap 仅支持单选(multiple=false), 多选模式下 pickMap 已忽略')
    }
    if (this.options instanceof FastTableOption) {
      await this.getOptions()
    }
  },
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    /**
     * 获取options选项值，只有当options为FastTableOption类型时此方法有效
     * @param force {boolean} 是否强制刷新, 前端有缓存, 默认为false, 可能会从缓存取
     */
    getOptions(force = false) {
      if (!(this.options instanceof FastTableOption)) {
        return
      }
      const query = new Query().setDistinct().setCols([this.valKey, this.labelKey]);
      this.options._buildSelectOptions(query, this.valKey, this.labelKey, force, this.pickMap).then(options => {
        this.nativeOptions = options
      }).catch(err => {
        console.error(err)
      })
    },
    /**
     * 选中值变化时: 上抛change事件, 并处理pickMap回填
     * @param val
     */
    handleChange(val) {
      this.$emit('change', val)
      this.applyPickMap(val)
    },
    /**
     * 清空时: 上抛clear事件, 并清除pickMap已回填的目标字段
     */
    handleClear() {
      this.$emit('clear')
      this.clearPickMap()
    },
    /**
     * 单选时, 将选中选项中的字段按pickMap映射写入pickObject(编辑行); 多选或缺少pickObject/pickMap时忽略
     * @param val 当前选中的值
     */
    applyPickMap(val) {
      if (this.multiple === true || util.isEmpty(this.pickObject) || util.isEmpty(this.pickMap)) {
        return
      }
      const option = this.nativeOptions.find(item => item[this.valKey] === val)
      if (util.isEmpty(option)) {
        return
      }
      Object.entries(this.pickMap).forEach(([pickFieldName, targetFieldName]) => {
        this.pickObject[targetFieldName] = option[pickFieldName]
      })
    },
    /**
     * 清空选择时, 将pickMap映射的目标字段置为null(与FastObjectPicker行为一致)
     */
    clearPickMap() {
      if (this.multiple === true || util.isEmpty(this.pickObject) || util.isEmpty(this.pickMap)) {
        return
      }
      Object.entries(this.pickMap).forEach(([, targetFieldName]) => {
        this.pickObject[targetFieldName] = null
      })
    }
  }
}
</script>

<style scoped>

</style>
