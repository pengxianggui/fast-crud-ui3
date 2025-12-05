<template>
  <el-select v-model="value" v-bind="$attrs" :size="size" :multiple="multiple"
             @change="(val) => $emit('change', val)"
             @clear="() => $emit('clear')"
             @focus="(event) => $emit('focus', event)"
             @blur="(event) => $emit('blur', event)"
             @visible-change="(visible) => $emit('visibleChange', visible)"
             @remove-tag="(tagVal) => $emit('removeTag', tagVal)">
    <el-option v-for="item in nativeOptions" :key="item.value" :label="item[labelKey]" :value="item[valKey]"
               :disabled="disableVal.indexOf(item[valKey]) > -1"></el-option>
  </el-select>
</template>

<script>
import FastTableOption, {Query} from "../../../model.js";
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
    if (this.options instanceof FastTableOption) {
      await this.buildSelectOptions()
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
    buildSelectOptions() {
      if (!(this.options instanceof FastTableOption)) {
        return
      }
      const query = new Query().setDistinct().setCols([this.valKey, this.labelKey]);
      this.options._buildSelectOptions(query, this.valKey, this.labelKey).then(options => {
        this.nativeOptions = options
      }).catch(err => {
        console.error(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
