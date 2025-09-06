<template>
  <!-- 1.5.9 使用 el-select 以便更好的支持搜索以及多选(可借助el-select的远程搜索模式实现——避免下拉) -->
  <el-select v-model="value"
             :clearable="clearable"
             :placeholder="placeholder"
             :size="size"
             :disabled="disabled"
             :multiple="multiple"
             remote :suffix-icon="null"
             @clear="handleClear"
             @blur="(event) => $emit('blur', event)"
             @change="(val) => $emit('change', val)"
             @click="handleClick"
             @focus="handleFocus">
    <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"/>
  </el-select>
</template>

<script>
import {pick} from "../../../util/pick"
import {defaultIfEmpty, isArray, isEmpty, isObject} from "../../../util/util"
import FastTableOption from "../../../model.js"

export default {
  name: "FastObjectPicker",
  emits: ['update:modelValue', 'blur', 'change', 'clear', 'click', 'focus'],
  props: {
    modelValue: {
      required: true
    },
    tableOption: {
      type: FastTableOption,
      required: true
    },
    // 回显到input上的字段 @deprecated 1.6 使用valKey替代
    showField: String,
    // 替代showField, 指定"值"key
    valKey: String,
    // 当控件需要"值显"不一致时, 指定"显"key
    labelKey: String, // 1.5.9 兑现
    pickObject: Object, // 单选时, pick选择后回填到的目标object上
    pickMap: Object, // 单选时, pick选择后回填到目标object上时，指导字段对应关系: key为pick的数据的字段名, value为pickObject中的字段名
    valueCovert: { // 针对showField取值的值转换, 对于多选时, 会讲showField的多个值用英文逗号分隔后返回，作为组件v-model值
      type: Function,
      default: (pickData, field) => {
        if (isArray(pickData)) {
          return pickData.map(row => row[field])
        } else {
          return pickData[field]
        }
      }
    },
    beforeOpen: {
      type: Function,
      default: () => Promise.resolve()
    },
    title: String,
    multiple: {
      type: Boolean,
      default: () => false
    },
    placeholder: {
      type: String,
      default: () => "请点选..."
    },
    appendToBody: {
      type: Boolean,
      default: () => true
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    clearable: {
      type: Boolean,
      default: () => true
    },
    size: String,
    // pick弹窗的宽度
    dialogWidth: {
      type: String,
      default: () => '70%'
    }
  },
  data() {
    return {
      options: [] // pick勾选的选项
    }
  },
  mounted() {
    if (!isEmpty(this.modelValue)) { // 有初始值, 先构造一个选项以便正常显示
      this.options = [{label: this.modelValue, value: this.modelValue}]
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
    handleClear(event) {
      this.$emit('clear', event)
      // 清除pickMap的其它属性
      if (!isEmpty(this.pickMap) && !isEmpty(this.pickObject)) {
        Object.entries(this.pickMap).forEach(([pickFieldName, formFieldName]) => {
          this.pickObject[formFieldName] = null
        })
      }
    },
    handleClick(event) {
      // 检查点击事件的目标是否为清除按钮, 清除按钮的话不上抛点击事件
      if (event.target.classList.contains('el-input__clear')) {
        return
      }
      this.$emit('click', event)
      this.openPick()
    },
    handleFocus(event) {
      this.$emit('focus', event)
      // this.openPick() // ESC退出后焦点又回到input，会导致ESC关不掉
    },
    openPick() { // TODO 修复多选时, 勾选部分后重新搜索导致已勾选的丢失
      const {beforeOpen, tableOption} = this
      beforeOpen().then(() => {
        pick({
          option: tableOption,
          multiple: this.multiple,
          dialog: {
            title: this.title,
            width: this.dialogWidth,
            appendToBody: this.appendToBody
          }
        }).then((fatData) => {
          const data = isArray(fatData) ? fatData.map((item) => item.row) : fatData.row
          const valKey = defaultIfEmpty(this.valKey, this.showField)
          const labelKey = defaultIfEmpty(this.labelKey, valKey)
          // 赋值options
          this.options = (isArray(data) ? data : [data]).map(item => {
            return {value: item[valKey], label: item[labelKey]}
          })
          // 赋值value
          const newVal = this.valueCovert(data, valKey)
          this.value = newVal
          this.$emit('change', newVal)
          if (this.multiple !== true && isObject(data)) {
            // 赋值pickObject
            Object.entries(this.pickMap).forEach(([pickFieldName, formFieldName]) => {
              this.pickObject[formFieldName] = data[pickFieldName]
            })
          }
        }).catch((err = '你取消了pic弹窗') => {
          console.debug(err)
        })
      }).catch((err = '你取消了打开pick') => {
        console.debug(err)
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
