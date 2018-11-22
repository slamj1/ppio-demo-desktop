<template>
  <div class="payment-table-container">
    <el-table class="ppio-plain-table payment-table" :data="paymentData.list">
      <el-table-column
          class-name="table-column-product"
          prop="product"
          label="Product"
          min-width="240">
      </el-table-column>
      <el-table-column
          prop="fee"
          label="Fee"
          min-width="150">
      </el-table-column>
    </el-table>
    <div class="total-cost">
      <p><b>Total:</b> {{paymentData.totalCost}} PPCoin</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'payment-table',
  props: ['payment-data'],
}
</script>
<style lang="scss" scoped>
.payment-table {
  color: inherit;
  text-align: center;
  margin-bottom: 10px;
}
.total-cost {
  position: relative;
  padding-left: 10px;
}
</style>
