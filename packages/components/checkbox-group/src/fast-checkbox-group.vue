<template>
  <div class="fc-fast-checkbox-group">
    <el-checkbox :size="size" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" v-if="showChoseAll">
      全选
    </el-checkbox>
    <el-checkbox-group class="fc-checkbox-group" :size="size" v-model="value" @change="handleChange">
      <!-- label兼容2.6.0以下版本 -->
      <el-checkbox  v-for="item in options" :value="item[valKey]" :key="item[valKey]" :label="item[valKey]"
                   :disabled="disableVal.indexOf(item[valKey]) > -1">{{ item[labelKey] }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import {isArray} from '../../../util/util.js'
export default {
  name: "fast-checkbox-group",
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    labelKey: {
      type: String,
      default: () => "label"
    },
    valKey: {
      type: String,
      default: () => "value"
    },
    showChoseAll: {
      type: Boolean,
      default: () => true
    },
    disableVal: {
      type: Array,
      default: () => []
    },
    size: String
  },
  computed: {
    value: {
      get() {
        return isArray(this.modelValue) ? this.modelValue : []
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    isIndeterminate() {
      return this.value.length > 0 && this.value.length < this.options.length
    },
    checkAll() {
      return this.value.length === this.options.length
    }
  },
  data() {
    return {}
  },
  methods: {
    handleCheckAllChange(val) {
      this.value = val ? this.options.filter(item => this.disableVal.indexOf(item[this.valKey]) === -1)
          .map(item => item[this.valKey]) : [];
      this.isIndeterminate = false;
    },
    handleChange(val) {
      this.$emit('change', val)
    }
  }
}
</script>

<style scoped lang="scss">
.fc-checkbox-group {
  display: inline-block;
  margin-left: 10px;
}
</style>
