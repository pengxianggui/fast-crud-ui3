<template>
  <fast-table ref="fastTable" class="fast-table" :option="tableOption" :key="tableKey"
              @current-change="handleCurrentChange"
              @row-click="handleRowClick"
              @row-dblclick="handleRowDblClick"
              @select="handleSelect"
              @selection-change="handleSelectionChange"
              @select-all="handleSelectAll">
    <template #quickFilter="{size}">
      <el-form-item label="自定义筛选项">
        <el-input :size="size" v-model="customQueryParam.keyword" placeholder="同时筛选姓名和仰慕者姓名"/>
      </el-form-item>
    </template>
    <fast-table-column label="ID" prop="id"/>
    <fast-table-column-img label="头像" prop="avatarUrl" :fixed="params.fixedAvatar" :filter="false" required/>
    <fast-table-column-img prop="gallery" label="相册" :multiple="true" :limit="10"
                           :before-remove="handleGalleryBeforeRemove"
                           :on-success="handleGalleryUploadSuccess"
                           :on-remove="handleGalleryRemove"
                           :response-handler="handleGalleryResponseHandle"
                           :on-change="handleGalleryChange"
                           width="300px"/>
    <fast-table-column-input label="姓名" prop="name" first-filter required/>
    <fast-table-column-number label="年龄" prop="age" required quick-filter
                              :min="18" :max="60"
                              :rules="[{type: 'number', min: 18, max: 60, message: '年龄必须在[18,60]之间'}]"
                              @change="handleAgeChange"/>
    <fast-table-column-select label="性别" prop="sex" :options="sexOptions" :multiple_q="true" quick-filter required>
      <template #header="{column, $index}">
        <span>{{ $index + '.' + column.label }}</span>
      </template>
      <template #normal="{row: {row}}">
        <el-tag v-if="row.sex === '1'">男</el-tag>
        <el-tag v-else-if="row.sex === '0'" type="danger">女</el-tag>
        <span v-else></span>
      </template>
    </fast-table-column-select>
    <fast-table-column-select label="属国" prop="state" :options="stateOptions"
                              :quick-filter="true" quick-filter-block quick-filter-checkbox
                              val-key="code" label-key="name"
                              :default-val_q="['1', '2', '3']"
                              :disable-val="['4']"
                              required/>
    <fast-table-column label="仰慕者Id" prop="loveId"/>
    <fast-table-column-object label="仰慕者姓名" prop="loveName"
                              :table-option="loveOption" show-field="name" :pick-map="{id: 'loveId'}"/>
    <fast-table-column-textarea label="简介" prop="info"/>
    <fast-table-column-switch label="已毕业" prop="graduated" active-text="Y" inactive-text="N" quick-filter required/>
    <fast-table-column-time-picker label="幸运时刻" prop="luckTime" width="120px"
                                   :editable="({editRow}) => !(editRow.age > 35)" required/>
    <fast-table-column-date-picker label="生日" prop="birthday" quick-filter
                                   :disabled-date="(time) => time.getTime() > Date.now()"
                                   required/>
    <fast-table-column-file label="简历" prop="resumeUrl" :multiple="true" :limit="3" :show-overflow-tooltip="false"/>
    <fast-table-column-input prop="idCard" label="身份证号" min-width="180px"/>
    <fast-table-column-input prop="address" label="地址" min-width="200px"/>
    <fast-table-column-input prop="phone" label="联系电话" min-width="150px"/>
    <fast-table-column-date-picker label="创建时间" prop="createTime" width="200px"
                                   :disabled-date_q="(time) => time.getTime() > Date.now()"
                                   type="datetime"
                                   :quick-filter="false" :default-val_q="defaultQueryOfCreatedTime"
                                   value-format_e="YYYY-MM-DDTHH:mm:ss"
                                   :editable="false"/>
    <el-table-column label="操作" width="60px" fixed="right">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="edit(scope)">编辑</el-button>
      </template>
    </el-table-column>
    <template #button="scope">
      <el-button :size="scope.size" @click="tryPick(false)">Try Pick</el-button>
      <el-button :size="scope.size" @click="tryPick(true)">Try Pick(多选)</el-button>
      <!--      <div class="sick-msg">这是一段提示</div>-->
    </template>
    <template #foot="scope">
      <div>
        <el-button :size="scope.size" :icon="Link" @click="expandButton(scope, 'code')">查看源码</el-button>
        <el-button :size="scope.size" :icon="Link" @click="expandButton(scope, 'doc')">查看文档</el-button>
      </div>
    </template>
  </fast-table>
</template>

<script>
import {h, markRaw} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus';
import {FastTableColumnImg, FastTableColumn, FastTableOption, util} from "../../../packages";
import staticDict from './dict'
import {pick} from "../../../packages/util/pick";
import {Cpu, Link, Plus} from "@element-plus/icons-vue";

export default {
  name: "MyTable",
  computed: {
    Link() {
      return Link
    }
  },
  props: {
    params: Object
  },
  data() {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setTime(monthAgo.getTime() - 3600 * 1000 * 24 * 30);
    return {
      customQueryParam: {
        keyword: null
      },
      tableOption: new FastTableOption({
        context: this, // important! 否则钩子函数里无法获取当当前组件实例上下文
        title: '',
        module: 'student', // 配置了这个, 默认分页接口就是: /student/page, 新增接口就是: /student/insert, 其它同理
        enableDblClickEdit: true,
        enableMulti: true,
        enableColumnFilter: true,
        lazyLoad: false,
        editType: 'inline', // 默认inline
        // insertable: true,
        insertable: (scope) => true, // 支持一个返回布尔的函数
        updatable: true,
        deletable: true,
        createTimeField: 'createTime', // 审计字段——创建时间
        // sortField: 'createTime', // 默认为createTimeField值
        // sortDesc: true, // 默认为true
        moreButtons: [
          {
            // 这是一个完整的配置，其中: label、click是必须的
            icon: markRaw(Cpu),
            label: '扩展按钮',
            click: (scope) => this.expandMoreButton(scope),
            // showable: true, // 默认true
            // disable: false // 默认false
          },
          {
            icon: markRaw(Plus),
            label: '插入一行(空)',
            click: (scope) => this.$refs['fastTable'].addRow()
          },
          {
            label: '插入多行(带默认值)',
            click: (scope) => this.$refs['fastTable'].addRows([{name: '貂蝉', age: 21}, {name: '吕布', age: 27}])
          },
          {
            label: '弹窗新增',
            click: (scope) => this.$refs['fastTable'].addForm()
          },
          {
            label: '禁用掉',
            click: (scope) => console.log(scope),
            disable: true,
            // disable: (scope) => true // 这样也可以, 就可以动态判断了，比如根据当前选中/勾选的值(怎么获取当前选中/勾选的值? 尝试打印下scope)
          },
          {
            label: '隐藏掉',
            click: (scope) => console.log(scope),
            showable: false,
            // showable: (scope) => true // 这样也可以, 就可以动态判断了，比如根据当前选中/勾选的值(怎么获取当前选中/勾选的值? 尝试打印下scope)
          }
        ],
        pagination: {
          size: 10,
          "page-sizes": [5, 10, 20, 50, 100]
        },
        style: {
          flexHeight: true,
          size: 'default', // small,default,large
          bodyRowHeight: '45px',
          formLabelWidth: 'auto', // 默认为auto
          formLayout: 'id,avatarUrl, name|age|sex, graduated|state|state, loveId|loveName|loveName, info, birthday|luckTime, resumeUrl, createTime', // 弹窗表单布局设置
          quickFilterSpan: 3
        },
        beforeReset({query}) {
          this.customQueryParam.keyword = null // 重置自定义筛选项
          return Promise.resolve()
        },
        /**
         * 典型场景: 追加筛选条件
         * @param query
         * @return {Promise<never>|Promise<void>}
         */
        beforeLoad({query}) {
          if (this.params.pageLoadable) {
            query.extra.keyword = this.customQueryParam.keyword
            return Promise.resolve();
          }
          this.showMsg('warning', '未勾选【允许加载分页】, 不会分页请求')
          return Promise.reject()
        },
        loadSuccess({query, res}) {
          if (this.params.loadSuccessTip) {
            this.showMsg('success', '分页加载成功!')
          }
          return Promise.resolve(res);
        },
        loadFail({query, error}) {
          if (this.params.customLoadFailTip) {
            this.showMsg('error', '哦豁, 分页加载失败了:' + JSON.stringify(error));
            return Promise.reject();
          }
          return Promise.resolve(); // 可以通过reject覆盖默认的加载失败提示
        },
        beforeInsert({fatRows, rows, editRows}) {
          if (editRows.findIndex(r => r.name === '司马懿') > -1 && this.params.disableInsertSmy) {
            this.showMsg('warning', '你已勾选【不允许添加司马懿】')
            return Promise.reject();
          }
          return Promise.resolve(editRows);
        },
        insertSuccess({fatRows, rows, editRows, res}) {
          if (this.params.customInsertSuccessTip) {
            this.showMsg('success', '啧啧啧, 插入成功啦!')
            return Promise.reject(); // 取消内置的插入成功提示
          }
          return Promise.resolve();
        },
        insertFail({fatRows, rows, editRows, error}) {
          if (this.params.customInsertFailTip) {
            this.showMsg('error', '哦豁, 插入失败了!')
            return Promise.reject();
          }
          return Promise.resolve();
        },
        beforeToUpdate({fatRows, rows}) {
          if (rows.findIndex(r => r.name === '曹操') > -1 && this.params.disableUpdate) {
            this.showMsg('warning', "你已勾选【曹操不允许编辑】")
            return Promise.reject();
          }
          return Promise.resolve();
        },
        beforeUpdate({fatRows, rows, editRows}) {
          if (editRows.findIndex(r => r.name === '皇帝') > -1 && this.params.disableUpdateToHd) {
            this.showMsg('warning', '你已勾选【名字不允许改为皇帝】')
            return Promise.reject();
          }
          return Promise.resolve(editRows);
        },
        updateSuccess({fatRows, rows, editRows, res}) {
          return Promise.resolve();
        },
        updateFail({fatRows, rows, editRows, error}) {
          return Promise.resolve();
        },
        beforeDeleteTip({fatRows, rows}) {
          if (rows.findIndex(r => r.name === '诸葛亮') > -1 && this.params.notDelete) {
            this.showMsg('warning', '你已勾选【不能删除诸葛亮】')
            return Promise.reject();
          }
          return Promise.resolve();
        },
        beforeDelete({fatRows, rows}) {
          const {notDeleteAfterConfirm} = this.params;
          if (rows.findIndex(r => r.name === '赵云') > -1 && notDeleteAfterConfirm) {
            this.showMsg('warning', '删除记录中包含赵云, 你已勾选不能删除赵云')
            return Promise.reject();
          }
          return Promise.resolve(rows);
        },
        deleteSuccess({fatRows, rows, res}) {
          const {disableDefultDeleteSuccessTip} = this.params;
          if (disableDefultDeleteSuccessTip && rows.findIndex(r => r.name === '吕蒙') > -1) {
            this.showMsg('success', '恭喜恭喜! 删除对象中包含吕蒙')
            return Promise.reject(); // 通过reject覆盖默认的删除成功提示
          }
          return Promise.resolve();
        },
        deleteFail({fatRows, rows, error}) {
          if (this.params.customDeleteFailTip) {
            this.showMsg('error', '哦豁, 删除失败了! ' + JSON.stringify(error))
            return Promise.reject(); // 通过reject覆盖默认的删除失败提示
          }
          return Promise.resolve();
        },
        beforeCancel({fatRows, rows, status}) {
          if (status === 'update' && this.params.disableCancelWhenUpdate) {
            this.showMsg('warning', '你已经勾选更新时不允许取消')
            return Promise.reject();
          }
          return Promise.resolve();
        }
      }),
      loveOption: new FastTableOption({
        module: 'student',
        conds: [
          // 预筛
          // {col: 'name', opt: '=', val: '利威尔'} // 写法一
          // new Cond('name', 'like', '利威尔') // 写法二
        ],
        render() {
          return [
            h(FastTableColumn, {prop: 'id', label: 'id'}),
            h(FastTableColumnImg, {prop: 'avatarUrl', label: '头像'}),
            h(FastTableColumn, {prop: 'name', label: '姓名1', firstFilter: true})
          ]
        }
      }),
      tableKey: 0,
      defaultQueryOfCreatedTime: [monthAgo, now],
      ...staticDict
    }
  },
  methods: {
    updateOption(key, val) {
      this.tableOption[key] = val;
    },
    updateOptionStyle(key, val) {
      this.tableOption.style[key] = val;
      this.tableKey++;
    },
    edit({row: fatRow, column, $index}) {
      // const {row, editRow, config, status} = fatRow
      console.log(fatRow)
      this.$refs['fastTable'].updateForm(fatRow)
    },
    handleGalleryUploadSuccess(response, file, fileList, scope) {
      const {row: {row: {name}}} = scope
      ElMessage.success(`${name}的相册上传成功!`)
    },
    handleGalleryBeforeRemove(file, fileList, scope) {
      console.log('tableKey', this.tableKey)
      const {row: {row: {name}}} = scope
      return new Promise((resolve, reject) => {
        ElMessageBox.confirm(`确定要从${name}的相册中移除?`, 'Warning', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(false)
        })
      })
    },
    handleGalleryRemove(file, fileList, scope) {
      const {row: {row: {name}}} = scope
      ElMessage.success(`${name}的相册移除成功!`)
    },
    handleGalleryResponseHandle(response, file, fileList, scope) {
      const {row: {row: {name}}} = scope
      ElMessage.success(`${name}的相册上传成功! 你可以在这个钩子函数里根据上传接口的响应数据解析出地址。响应:${response}`)
      return response
    },
    handleGalleryChange(file, fileList, scope) {
      const {row: {row: {name}}} = scope
      ElMessage.success(`${name}的相册更新成功!`)
    },
    handleAgeChange(age, scope) {
      const {row: {row, editRow, status, config}, column, $index} = scope
      console.log('index:', $index);
      console.log('status:', status);
      console.log('editRow:', editRow);
      console.log('row:', row);
      console.log('config:', config);
      console.log('column:', column);
      if (this.params.autoSetGraduatedWhenAgeChange) {
        if (util.isNumber(age) && age > 50) {
          editRow.graduated = true;
          config['graduated'].props.disabled = true
        } else {
          config['graduated'].props.disabled = false
        }
      }
    },
    handleCurrentChange({fatRow, row}) {
      console.log('current-change..........................................................')
      console.log('fatRow:', fatRow);
      console.log('row:', row);
    },
    handleSelect({fatRows, rows, fatRow, row}) {
      console.log('select..........................................................')
      console.log('fatRows:', fatRows);
      console.log('rows:', rows);
      console.log('fatRow:', fatRow);
      console.log('row:', row);
    },
    handleSelectionChange({fatRows, rows}) {
      console.log('selection-change..........................................................')
      console.log('fatRows:', fatRows);
      console.log('rows:', rows);
    },
    handleSelectAll({fatRows, rows}) {
      console.log('select-all..........................................................')
      console.log('fatRows:', fatRows)
      console.log('rows:', rows)
    },
    handleRowClick({fatRow, row, column, event}) {
      console.log('row-click..........................................................')
      console.log('fatRow:', fatRow);
      console.log('row:', row);
      console.log('column:', column);
      console.log('event:', event);
    },
    handleRowDblClick({fatRow, row, column, event}) {
      console.log('row-dblclick..........................................................')
      console.log('fatRow:', fatRow);
      console.log('row:', row);
      console.log('column:', column);
      console.log('event:', event);
    },
    expandButton({choseRow, checkedRows, editRows}, type) {
      if (type === 'code') {
        window.open('https://github.com/pengxianggui/fast-crud-ui3/blob/main/src/example/full/MyTable.vue', '_blank')
      } else if (type === 'doc') {
        window.open('http://pengxg.cc/tags/fast-crud', '_blank')
      }
    },
    tryPick(multiple) {
      pick({
        option: this.loveOption,
        multiple: multiple,
        dialog: {
          width: '80%'
        }
      }).then((data) => {
        ElMessage.success('打开控制台查看你选择的数据!')
        console.log('你选择数据:', data)
      }).catch(() => {
        ElMessage.info('你取消了')
      })
    },
    expandMoreButton({choseRow, checkedRows, editRows}) {
      ElMessage.info('你点击了扩展按钮，你可以控制台查看可以获取到的信息')
      console.log('choseRow', choseRow)
      console.log('checkedRows', checkedRows)
      console.log('editRows', editRows)
    },
    showMsg(type, msg) {
      ElMessage({
        message: msg,
        type: type
      })
    }
  }
}
</script>

<style scoped lang="scss">
.sick-msg {
  position: absolute;
  left: 0;
}
:deep(.fc-fast-table-operation-bar) {
  //height: 50px;
}
</style>
