<template>
  <fast-table :option="tableOption">
    <fast-table-column prop="id" label="ID"/>
    <fast-table-column-input prop="orderNo" label="订单编号" first-filter/>
    <fast-table-column-select prop="performType" label="发货方式" :options="performTypeOptions" :editable="false"/>
    <fast-table-column-input prop="sapNo" label="SAP销售单号"/>
    <fast-table-column-input prop="thirdNo" label="电商订单号"/>
    <fast-table-column-object prop="shopCode" label="门店编码"
                              dialog-width="80%" :table-option="storeOption" show-field="code"
                              :pick-map="{code: 'shopCode', name: 'shopName', salesNetType: 'shopType'}" />
    <fast-table-column-input prop="shopName" label="门店名称" :editable="false"/>
    <fast-table-column-select prop="shopType" label="门店类型" :editable="false" :options="storeTypeOptions"/>
    <fast-table-column-date-picker prop="orderDate" label="下单日期"/>
    <fast-table-column-number prop="count" label="数量"/>
    <fast-table-column-number prop="totalAmount" label="标准零售价"/>
    <fast-table-column-select prop="orderStatus" label="订单状态" :multiple="false" :options="orderStatusOptions" :editable="false"/>
    <fast-table-column-input prop="provinceNo" label="地址(省编码)"/>
    <fast-table-column-input prop="provinceName" label="地址(省名称)"/>
    <fast-table-column-input prop="cityNo" label="地址(市编码)"/>
    <fast-table-column-input prop="cityName" label="地址(市名称)"/>
    <fast-table-column-input prop="countyNo" label="地址(区号)"/>
    <fast-table-column-input prop="countyName" label="地址(区名)"/>
    <fast-table-column-textarea prop="street" label="地址(详细)"/>
    <fast-table-column-input prop="receiverName" label="收件人姓名"/>
    <fast-table-column-input prop="receiverMobi" label="收件人联系电话"/>
    <fast-table-column prop="createName" label="创建人" :editable="false"/>
    <fast-table-column-date-picker prop="createTime" label="创建时间" :editable="false"/>
  </fast-table>
</template>
<script>
import {FastTableColumn, FastTableColumnImg, FastTableColumnSelect, FastTableOption} from '../../../packages/index.js'
import FastTableColumnDatePicker
  from "../../../packages/components/table-column-date-picker/src/table-column-date-picker.vue";
import FastTableColumnTextarea from "../../../packages/components/table-column-textarea/src/table-column-textarea.vue";
import {h} from "vue";
export default {
  name: "OrderPage",
  components: {FastTableColumnTextarea, FastTableColumnDatePicker},
  data() {
    return {
      performTypeOptions: [
        {label: '总部发货', value: 'CENTER'},
        {label: '门店自提', value: 'SHOP'},
      ],
      orderStatusOptions: [
        {label: '待处理', value: 'UNDEFINE'},
        {label: '已驳回待修改', value: 'REJECT'},
        {label: '待付款', value: 'CREATE'},
        {label: '待审核', value: 'PAYED'},
        {label: '待发货', value: 'AUDIT'},
        {label: '待收货', value: 'SEND'},
        {label: '已完成', value: 'COMPLETE'},
        {label: '已关闭', value: 'CLOSE'},
      ],
      storeTypeOptions: [
        { label: "线下直营门店", value: "OFFLINE_DIRECT"},
        { label: "线下代理门店", value: "OFFLINE_AGENT"},
        { label: "渠道", value: "CHANNEL"},
        { label: "线上电商", value: "ONLINE"},
        { label: "H端", value: "ORGANIZATION"}
      ],
      storeStatusOption: [
        {label: '未开业', value: 'PREPARE'},
        {label: '装修中', value: 'DECORATION'},
        {label: '装修完成', value: 'DECORATIONCOMPLETE'},
        {label: '营业中', value: 'OPEN'},
        {label: '撤店', value: 'CLOSE'}
      ],
      storeOption: new FastTableOption({
        context: this,
        module: 'store',
        // 预设前提条件的两种方式:
        // 方式1
        conds: [{col: 'status', opt: '=', 'val': 'OPEN'}],
        // 方式2
        // beforeLoad({query}) {
        //   query.conds.push({col: 'status', opt: '=', 'val': 'OPEN'})
        //   return Promise.resolve()
        // },
        render: () => {
          return [
            h(FastTableColumn, {prop: 'id', label: 'id'}),
            h(FastTableColumn, {prop: 'code', label: '门店编码', minWidth: '200px'}),
            h(FastTableColumn, {prop: 'name', label: '门店名称', minWidth: '200px', firstFilter: true}),
            h(FastTableColumnSelect, {prop: 'salesNetType', label: '门店类型', options: this.storeTypeOptions}),
            h(FastTableColumnSelect, {prop: 'status', label: '门店状态', options: this.storeStatusOption})
          ]
        }
      }),
      tableOption: new FastTableOption({
        context: this,
        module: 'orders',
        style: {
          flexHeight: true
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
