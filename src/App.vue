<template>
  <div class="demos">
<!--    <H2>Easy Demo</H2>-->
<!--    <easy-demo></easy-demo>-->
<!--    <H2>Full Demo</H2>-->
    <full-demo></full-demo>
<!--    <order-page></order-page>-->

  </div>
</template>

<script>
import EasyDemo from "@/example/easy/EasyDemo.vue"
import FullDemo from "./example/full/FullDemo.vue"
import OrderPage from "@/example/order/OrderPage.vue";

export default {
  name: "App",
  components: {EasyDemo, FullDemo, OrderPage},
  data() {
    return {}
  }
}
</script>

<style scoped lang="scss">
  .demos {
    height: 100%;
  }
</style>
