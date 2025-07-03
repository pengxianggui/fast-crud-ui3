<template>
  <el-input v-model="value"
            :clearable="clearable" :placeholder="placeholder" :size="size" :disabled="disabled"
            @clear="handleClear"
            @blur="(event) => $emit('blur', event)"
            @change="(val) => $emit('change', val)"
            @click="handleClick"
            @focus="handleFocus" />
</template>

<script>
import {pick} from "../../../util/pick"
import {isArray, isObject} from "../../../util/util"
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
    showField: String, // 回显到input上的字段
    pickObject: Object, // 单选时, pick选择后回填到的目标object上
    pickMap: Object, // 单选时, pick选择后回填到目标object上时，指导字段对应关系: key为pick的数据的字段名, value为pickObject中的字段名
    valueCovert: { // 针对showField取值的值转换, 对于多选时, 会讲showField的多个值用英文逗号分隔后返回，作为组件v-model值
      type: Function,
      default: (pickData, showField) => {
        if (isArray(pickData)) {
          return pickData.map(item => item[showField]).join(',')
        } else {
          return pickData[showField]
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
    size: String
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
      Object.entries(this.pickMap).forEach(([pickFieldName, formFieldName]) => {
        this.pickObject[formFieldName] = null
      })
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
    },
    openPick() {
      const {beforeOpen} = this
      beforeOpen().then(() => {
        pick({
          option: this.tableOption,
          multiple: this.multiple,
          dialog: {
            title: this.title,
            appendToBody: this.appendToBody
          }
        }).then(({row}) => {
          // 赋值value
          this.value = this.valueCovert(row, this.showField)
          if (this.multiple !== true && isObject(row)) {
            // 赋值pickObject
            Object.entries(this.pickMap).forEach(([pickFieldName, formFieldName]) => {
              this.pickObject[formFieldName] = row[pickFieldName]
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
