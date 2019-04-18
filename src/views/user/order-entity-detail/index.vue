<template>
  <div class="order_list over-hide" onscroll="this.confirmPostalCode()">
    <van-cell-group>
      <van-cell title="物品名称" :value="order.productName"></van-cell>
      <van-cell title="购买数量" :value="order.count"/>
      <van-cell title="单价" :value="order.price" @click="showSex = true" />
      <van-cell title="总价" :value="order.totalPrice"/>
      <van-cell title="收件人" :value="order.consignee" />
      <van-cell title="联系电话" :value="order.phone" />
      <van-cell title="订单情况"  :value="this.getOrderStatus(order.status)" />
      <van-cell title="配送方式"  :value="order.delivery" />
      <van-cell title="配送地址"  :value="order.address" />
      <van-cell title="创建时间"  :value="order.createdTime" />
      <van-cell title="支付时间"  :value="order.paidTime" />
      <van-field
              :disabled="this.status!='my'"
              v-model="order.postalCode"
              label="快递编号"
              placeholder="请完善快递编号"
      >
        <van-button
                v-show="this.status=='my'"
                @click="confirmPostalCode"
                slot="button" size="small" type="primary">确认</van-button>
      </van-field>
    </van-cell-group>
    <van-button
            v-show="this.status!='my' && this.order.status!=3"
            @click="finishOrder()"
            slot="button" size="large" round type="primary">确认收货</van-button>
  </div>
</template>

<script>
import { ORDER } from '@/api/order';
import { Field, Button } from 'vant';
import status0 from './handle-status-10';
import status1 from './handle-status-20';
import status2 from './handle-status-25';
import status3 from './handle-status-30';
import status40 from './handle-status-40';
import status50 from './handle-status-50';
import status60 from './handle-status-60';
import status70 from './handle-status-70';

const STATUS_TEXT = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '已完成',
  50: '退款成功',
  60: '交易关闭',
  70: '交易关闭'
};

export default {
  name: 'order-detail',

  data() {
    return {
      order: this.getOrderDetail(),
      // 我的订单详情/我卖出的物品订单详情
      status: this.$route.params.status,
    };
  },

  methods: {
    // 完成订单
    finishOrder() {
      this.$reqPut(ORDER+'/'+this.order.id).then(() => {
        this.order.status = 3;
        this.$toast('订单完成')
      })
    },
    // 补充快递编号
    confirmPostalCode() {
      // 修改订单的快递编号
      var temp = {};
      temp.id = this.order.id;
      temp.postalCode = this.order.postalCode
      this.$reqPut(ORDER+'/postal', temp).then(() => {
        this.$toast('成功');
      });
    },
    getOrderDetail() {
      const orderId = this.$route.params.order_id;
      this.$reqGet(ORDER+'/'+orderId).then(res => {
        this.order = res.data.data;
      });
    },
    getOrderStatus(status) {
      return STATUS_TEXT[status] || '';
    }
  },
  components: {
    [Button.name]: Button,
    [Field.name]: Field,
    status0,
    status1,
    status2,
    status3,
    status40,
    status50,
    status60,
    status70
  }
};
</script>

<style lang="scss" scoped>
.order_list {
  padding-bottom: 0;
  overflow-y: hidden;
  &--footer_btn {
    text-align: right;
  }
  &--panel {
    margin-bottom: 10px;
  }

  &--van-card {
    background-color: #fafafa;
  }

  &--total {
    text-align: right;
    padding: 10px;
  }
}
</style>
