<template>
  <SlidePopup @close="f_close">
    <h2 slot="header">Billing Records</h2>
    <el-table
        slot="content"
        max-height="500"
        class="ppio-list-table billing-table"
        :data="recordsData"
        stripe
        style="width: 100%">
      <el-table-column
          label="time"
          width="200"
          class-name="table-column-time">
        <template slot-scope="scope">
          <p class="billing-time">{{f_getTime(scope.row.timestamp)}}</p>
        </template>
      </el-table-column>
      <el-table-column
          prop="comment"
          label="Product">
      </el-table-column>
      <el-table-column
          prop="amount"
          label="Transaction"
          width="240">
      </el-table-column>
    </el-table>
  </SlidePopup>
</template>

<script>
import moment from 'moment'
import { ACT_GET_BILLING_RECORDS } from '../constants/store'
import SlidePopup from '../components/SlidePopup'

export default {
  name: 'billing-records',
  props: ['recordsData'],
  components: {
    SlidePopup,
  },
  mounted() {
    console.log('billing records mounted')
    this.$store.dispatch(ACT_GET_BILLING_RECORDS)
  },
  methods: {
    f_getTime(timestamp) {
      return moment(timestamp).format('YYYY/MM/DD hh:mm:ss')
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_BILLING_RECORDS)
    },
  },
}
</script>
