<template>
  <el-config-provider :locale="elementLocale">
  <div class="demo">
    <div class="param" :class="{collapsed: paramCollapsed}">
      <div class="param-header">
        <span class="param-title">参数面板</span>
        <el-button class="param-collapse-btn" link :icon="Fold" title="收起参数面板" @click="toggleParamPanel"></el-button>
      </div>
      <div class="param-body">
        <h5>行为配置</h5>
        <el-switch size="small" v-model="params.editType" @change="(val) => updateOption('editType', val)"
                   inactive-value="inline" inactive-color="#13ce66" inactive-text="行内编辑"
                   active-value="form" active-color="#ff4949" active-text="表单编辑"></el-switch>
        <el-checkbox v-model="params.pageLoadable">允许加载分页</el-checkbox>
        <el-checkbox v-model="params.insertable" @change="(val) => updateOption('insertable', val)">允许新增
        </el-checkbox>
        <el-checkbox v-model="params.updatable" @change="(val) => updateOption('updatable', val)">允许更新</el-checkbox>
        <el-checkbox v-model="params.deletable" @change="(val) => updateOption('deletable', val)">允许删除</el-checkbox>
        <el-checkbox v-model="params.enableColumnFilter" @change="(val) => updateOption('enableColumnFilter', val)">
          允许表头动态筛选
        </el-checkbox>
        <el-checkbox v-model="params.enableMulti" @change="(val) => updateOption('enableMulti', val)">启用多选
        </el-checkbox>
        <el-checkbox v-model="params.enableDblClickEdit" @change="(val) => updateOption('enableDblClickEdit', val)">
          启用双击编辑
        </el-checkbox>
        <el-checkbox v-model="params.enableCascading" @change="(val) => updateOption('enableCascading', val)">
          快筛项级联(属国/仰慕者)
        </el-checkbox>
        <el-checkbox v-model="params.enableNameUnique" @change="(val) => updateOption('enableNameUnique', val, true)">
          姓名唯一
        </el-checkbox>

        <h5>外观配置</h5>
        <div class="line">
          <label>语言</label>
          <fast-select class="comp" size="small" :options="langOptions" v-model="params.lang" @change="(val) => changeLang(val)"/>
        </div>
        <div class="line">
          <label>尺寸</label>
          <fast-select class="comp" size="small" :options="sizeOptions" v-model="params.size" @change="(val) => updateOptionStyle('size', val)"/>
        </div>
        <div class="line">
          <label>行高</label>
          <el-slider class="comp" v-model="params.bodyRowHeight" :min="30" :max="100"
                     @change="(val) => updateOptionStyle('bodyRowHeight', val + 'px')"></el-slider>
        </div>
        <el-checkbox v-model="params.fixedAvatar">固定头像列</el-checkbox>
        <el-checkbox v-model="params.flexHeight" @change="(val) => updateOptionStyle('flexHeight', val)">
          表格高度弹性自适应
        </el-checkbox>

        <h5>钩子函数应用</h5>
        <el-checkbox v-model="params.loadSuccessTip">分页加载成功提示</el-checkbox>
        <el-checkbox v-model="params.customLoadFailTip">自定义加载失败提示</el-checkbox>
        <el-checkbox v-model="params.notDelete">不能删除诸葛亮(不弹窗)</el-checkbox>
        <el-checkbox v-model="params.notDeleteAfterConfirm">不允许删除赵云(弹窗后)</el-checkbox>
        <el-checkbox v-model="params.disableDefultDeleteSuccessTip">删除吕蒙时庆祝</el-checkbox>
        <el-checkbox v-model="params.customDeleteFailTip">自定义删除失败提示</el-checkbox>
        <el-checkbox v-model="params.customInsertSuccessTip">自定义插入成功提示</el-checkbox>
        <el-checkbox v-model="params.customInsertFailTip">自定义插入失败提示</el-checkbox>
        <el-checkbox v-model="params.disableUpdate">曹操不允许编辑</el-checkbox>
        <el-checkbox v-model="params.disableUpdateToHd">名字不允许改为皇帝</el-checkbox>
        <el-checkbox v-model="params.disableInsertSmy">不允许添加司马懿</el-checkbox>
        <el-checkbox v-model="params.disableCancelWhenUpdate">更新时不允许取消</el-checkbox>

        <h5>事件</h5>
        <el-checkbox v-model="params.autoSetGraduatedWhenAgeChange">超50岁自动毕业</el-checkbox>
        <el-checkbox v-model="params.noEditLuckWhenAgeGT35">超35岁不允许编辑幸运时刻</el-checkbox>
      </div>
    </div>

    <div v-if="paramCollapsed" class="param-rail" title="展开参数面板" @click="toggleParamPanel">
      <el-icon :size="16"><Expand/></el-icon>
    </div>

    <my-table ref="myTable" :params="params" class="table"></my-table>
  </div>
  </el-config-provider>
</template>

<script>
import MyTable from "./MyTable.vue";
import FastSelect from "../../../packages/components/select/src/fast-select.vue";
import staticDict from './dict'
import {setLanguage} from "../../../packages/index.js";
import {ElConfigProvider} from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en';
import {Fold, Expand} from "@element-plus/icons-vue";

export default {
  name: "FastTableDemo",
  components: {FastSelect, MyTable, ElConfigProvider},
  computed: {
    elementLocale() {
      return this.params.lang === 'zh-cn' ? zhCn : en
    },
    Fold() {
      return Fold
    },
    Expand() {
      return Expand
    }
  },
  data() {
    return {
      sizeOptions: staticDict.sizeOptions,
      langOptions: staticDict.langOptions,
      paramCollapsed: false,
      params: {
        lang: 'zh-cn',
        editType: 'inline',
        // 允许分页加载
        pageLoadable: true,
        // 允许新增
        insertable: true,
        // 允许编辑
        updatable: true,
        // 允许删除
        deletable: true,
        // 允许动态筛选
        enableColumnFilter: true,
        // 启用多选
        enableMulti: true,
        // 启用双击编辑
        enableDblClickEdit: true,
        // 启用快筛项级联(蜀国和仰慕者)
        enableCascading: true,
        // 启用姓名唯一
        enableNameUnique: true,
        // 默认尺寸
        size: 'default',
        bodyRowHeight: 45,
        // 表格高度弹性自适应
        flexHeight: true,
        fixedAvatar: false,
        // 加载成功时提示
        loadSuccessTip: false,
        // 自定义加载失败提示
        customLoadFailTip: true,
        // 自定义插入成功提示
        customInsertSuccessTip: false,
        // 自定义插入失败提示
        customInsertFailTip: false,
        // 不允许删除利威尔
        notDelete: true,
        // 不允许删除珊莎
        notDeleteAfterConfirm: true,
        // 自定义删除失败提示
        customDeleteFailTip: true,
        // 当删除对象包含艾伦时禁用默认删除成功提示
        disableDefultDeleteSuccessTip: true,
        // 阿明不允许编辑
        disableUpdate: true,
        // 名字不允许改为张三
        disableUpdateToHd: true,
        // 不允许添加李四
        disableInsertSmy: true,
        // 更新行时不允许取消
        disableCancelWhenUpdate: false,
        // 年龄大于50自动毕业
        autoSetGraduatedWhenAgeChange: true,
        // 年龄大于35, 不可编辑幸运时刻
        noEditLuckWhenAgeGT35: true,
      }
    }
  },
  methods: {
    updateOption(key, val, refresh = false) {
      this.$refs.myTable.updateOption(key, val, refresh)
    },
    updateOptionStyle(key, val, refresh = true) {
      this.$refs.myTable.updateOptionStyle(key, val, refresh)
    },
    changeLang(val) {
      this.params.lang = val
      setLanguage(val)
    },
    toggleParamPanel() {
      this.paramCollapsed = !this.paramCollapsed
    }
  }
}
</script>

<style scoped lang="scss">
.demo {
  height: 100%;
  display: flex;
  padding: 8px;
  gap: 8px;
  box-sizing: border-box;

  .param {
    width: 260px;
    min-width: 260px;
    height: 100%;
    background: #fff;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width .25s ease, min-width .25s ease, margin .25s ease;
    box-sizing: border-box;

    &.collapsed {
      width: 0;
      min-width: 0;
      margin: 0;
      border-width: 0;
      padding: 0;
    }

    .param-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      flex-shrink: 0;

      .param-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        letter-spacing: 1px;
      }

      .param-collapse-btn {
        padding: 0;
      }
    }

    .param-body {
      flex: 1;
      overflow: auto;
      padding: 10px 14px 14px;

      & > * {
        display: block;
        margin-bottom: 8px;
      }

      h5 {
        margin: 18px 0 10px;
        font-size: 12px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
        letter-spacing: 1px;
        padding-left: 8px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 12px;
          border-radius: 2px;
          background: var(--el-color-primary);
        }

        &:first-child {
          margin-top: 2px;
        }
      }

      .el-checkbox,
      .el-switch {
        margin-right: 0;
        font-size: 13px;
      }

      .el-switch {
        --el-switch-on-color: var(--el-color-primary);
      }

      .line {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          width: 48px;
          flex-shrink: 0;
        }

        .comp {
          flex: 1;
        }
      }
    }
  }

  .param-rail {
    width: 36px;
    min-width: 36px;
    height: 100%;
    background: #fff;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    transition: color .2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .table {
    flex: 1;
    min-width: 0;
  }
}
</style>
