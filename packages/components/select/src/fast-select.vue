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
import Cond from '../../../model/cond.js'
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
    optionConds: { // 级联场景下的选项附加条件: 数组, 或接收{editRow}并返回Cond数组的函数
      type: [Array, Function],
      default: () => []
    },
    optionDeps: { // 级联场景下需要监听的pickObject字段(如['customerId']), 任一字段变化时重新加载选项并清空当前值
      type: Array,
      default: () => []
    },
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
    this.startOptionDepsWatch()
    if (this.options instanceof FastTableOption) {
      // 行内编辑且级联依赖为空时不加载(如尚未选择客户), 等依赖变化后再由watch触发; 非行内场景正常加载
      if (!(this.pickObject && this.hasEmptyOptionDeps())) {
        await this.getOptions()
      }
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
        return Promise.resolve()
      }
      const seq = (this._optionLoadSeq = (this._optionLoadSeq || 0) + 1)
      const scope = {editRow: this.pickObject}
      const extraConds = this.resolveOptionConds(scope)
      const query = new Query().setDistinct().setCols([this.valKey, this.labelKey]);
      return this.options._buildSelectOptions(query, this.valKey, this.labelKey, force, this.pickMap, {
        scope,
        extraConds
      }).then(options => {
        if (seq === this._optionLoadSeq) {
          this.nativeOptions = options
        }
      }).catch(err => {
        console.error(err)
      })
    },
    /**
     * 将optionConds规整为Cond对象数组
     * @param scope 传给optionConds函数的作用域(含editRow)
     */
    resolveOptionConds(scope) {
      const conds = util.isFunction(this.optionConds) ? this.optionConds(scope) : (this.optionConds || [])
      return (util.isArray(conds) ? conds : []).map(c => Cond.build(c))
    },
    /**
     * optionDeps中任一依赖字段为空时返回true, 此时不加载选项
     */
    hasEmptyOptionDeps() {
      return this.optionDeps.some(field => util.isEmpty(this.pickObject?.[field]))
    },
    /**
     * 监听optionDeps声明的pickObject字段, 变化时按新条件重新加载选项
     */
    startOptionDepsWatch() {
      if (!util.isArray(this.optionDeps) || this.optionDeps.length === 0 || util.isEmpty(this.pickObject)) {
        return
      }
      this.optionDeps.forEach(field => {
        this.$watch(
          () => this.pickObject?.[field],
          () => this.handleOptionDepsChange()
        )
      })
    },
    /**
     * 依赖字段变化: 清空当前值(避免残留上一依赖的选项值), 再按新依赖加载选项
     */
    handleOptionDepsChange() {
      // 使依赖变化前发起的请求失效, 避免旧依赖的选项晚到覆盖新依赖的选项
      this._optionLoadSeq = (this._optionLoadSeq || 0) + 1
      this.resetValueByCascade()
      if (this.hasEmptyOptionDeps()) {
        this.nativeOptions = []
        return
      }
      if (this.options instanceof FastTableOption) {
        void this.getOptions(true)
      }
    },
    /**
     * 级联触发时清空当前选中值及pickMap回填字段
     */
    resetValueByCascade() {
      if (this.multiple) {
        if (util.isArray(this.modelValue) && this.modelValue.length > 0) {
          this.$emit('update:modelValue', [])
        }
        return
      }
      if (!util.isEmpty(this.modelValue)) {
        this.$emit('update:modelValue', null)
        this.clearPickMap()
      }
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
