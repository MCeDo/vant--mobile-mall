<template>
  <div class="order-goods">
    <van-card
      v-for="item in goods"
      :key="item.id"
      :title="item.name"
      :desc="item.description"
      :num="item.buy_num"
      :price="item.price | priceFilter"
      :thumb="item.images[0].url"
    >
      <div slot="footer">
        <!--生成日期 {{new Date()}}-->
      </div>
    </van-card>

    <van-cell-group>
      <van-field v-model="remark" placeholder="请输入备注" label="订单备注">
        <template slot="icon">
          3/50
        </template>
      </van-field>

      <van-cell title="商品金额">
        <span class="red">{{ total | yuan }}</span>
      </van-cell>
      <!--<van-cell title="邮费" value="¥8.96"></van-cell>-->
      <!--<van-cell title="税费" value="¥8.96"></van-cell>-->
      <!--<van-cell title="多件随机优惠">-->
      <!--<span class="red">{{1000 | yuan}}</span>-->
      <!--</van-cell>-->
    </van-cell-group>
  </div>
</template>

<script>
import { Card, Field } from 'vant';

export default {
  name: 'bottom-goods-info',
  props: {
    tempOrder: {
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
  },
  data() {
    return {
      remark: '',
      goods: [this.$route.params]
    };
  },
  computed: {
    total() {
      let price = this.goods[0].price * this.goods[0].buy_num;
      this.$emit('getOrder', this.goods[0]);
      return price;
    }
  },

  filters: {
    priceFilter(data) {
      return parseFloat(data / 100);
    }
  },

  components: {
    [Card.name]: Card,
    [Field.name]: Field
  }
};
</script>
<style lang="scss" scoped>
.order-goods {
  background-color: #fff;
}
</style>
