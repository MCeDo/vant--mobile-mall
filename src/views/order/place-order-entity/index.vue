<template>
  <div class="place_order_entity">
    <top-user-info v-on:getAddressVal="createAddress" style="margin-bottom: 20px;" />
    <bottom-goods-info v-on:getOrder="createOrder" />
    <van-submit-bar
      :price="this.order.totalPrice"
      label="总计："
      buttonText="提交订单"
      :loading="isSubmit"
      :disabled="isDisabled"
      @submit="onSubmit"
    />
  </div>
</template>

<script>
import { ORDER } from '@/api/order';
import topUserInfo from './top-user-info';
import bottomGoodsInfo from './bottom-goods-info';
import { SubmitBar } from 'vant';

export default {
  data() {
    return {
      isSubmit: false,
      isDisabled: false,
      totalPrice: 0,
      isDaoDian: false,
      order: {
        id: undefined,
        productId: undefined,
        productName: '',
        count: 0,
        price: 0,
        totalPrice: 0,
        userId: undefined,
        consignee: '',
        phone: '',
        pay: 0,
        delivery: '',
        address: '',
        confirm: 0,
        createdTime: undefined
      }
    };
  },

  methods: {
    onSubmit() {
      this.isSubmit = true;
      console.log(this.order);
      this.$reqPost(ORDER, this.order).then(res => {
        console.log(res);
        this.order.id = res.data.data;
        this.$router.replace({ name: 'payment', params:{totalPrice: this.order.totalPrice, id:this.order.id}});
      });
    },
    createOrder(data) {
      this.order.productId = data.id;
      this.order.productName = data.name;
      this.order.count = data.buy_num;
      this.order.price = data.price;
      this.order.totalPrice = this.order.price * this.order.count;
    },
    createAddress(data) {
      if (typeof data === 'boolean') {
        this.isDaoDian = data;
        this.order.delivery = '自提';
        this.order.address = '';
      }else {
        this.order.address = data.address;
        this.order.phone = data.phone;
        this.order.consignee = data.consignee;
        this.order.delivery = '快递';
      }
    }
  },

  components: {
    [SubmitBar.name]: SubmitBar,
    [topUserInfo.name]: topUserInfo,
    [bottomGoodsInfo.name]: bottomGoodsInfo
  }
};
</script>

<style lang="scss" scoped>
.place_order_entity {
  padding-bottom: 70px;
}
</style>
