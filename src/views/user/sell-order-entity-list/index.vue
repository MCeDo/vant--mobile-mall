<template>
  <div class="order_list over-hide">
    <van-tabs
      v-model="activeIndex"
      :swipe-threshold="5"
      click="handleTabClick"
    >
      <van-tab
        v-for="(tab, tabIndex) in tabsItem"
        :title="tab.name"
        :key="tab.type"
      >
        <InfinityScroll
          class="full-page scroll-wrap height-fix42"
          :beforeRequest="beforeRequest"
          :apiUrl="listApi"
          @onLoad="onLoad(tabIndex, $event)"
        >
          <van-panel
            v-for="(el, i) in tab.items"
            class="order_list--panel"
            :key="i"
            :title="'订单编号: ' + el.id"
            :status="getStatusText(el.status)"
          >
            <div>
              <van-card
                class="order_list--van-card"
                :key="el.id"
                :desc="el.productName"
                :num="el.count"
                :price="(el.price / 100).toFixed(2)"
                :thumb="el.pic_url"
                @click.native="toOrderDetail(i)"
              />
              <div class="order_list--total">合计: {{el.totalPrice | yuan}}（含运费{{el.post_fee | yuan}}）</div>
            </div>
            <component
              slot="footer"
              :is="'status' + el.status"
              :reminder="true"
              @handle="actionHandle($event, i)"
            />
          </van-panel>
        </InfinityScroll>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { ORDER } from '@/api/order';

import { Tab, Tabs, Panel, Card, List } from 'vant';
import status0 from './handle-status-10';
import status1 from './handle-status-20';
import status2 from './handle-status-2';
import status3 from './handle-status-3';

import InfinityScroll from '@/vue/components/infinity-scroll';

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
  name: 'sell-order-list',

  props: {
    active: {
      type: [String, Number],
      default: 0
    }
  },

  data() {
    const activeIndex = this.active;
    return {
      listApi: ORDER+'/sell',
      shop_id: 1,
      activeIndex,
      tabsItem: [
        {
          name: '全部',
          status: undefined,
          items: []
        },
        {
          name: '待付款',
          status: 0,
          items: []
        },
        {
          name: '待发货',
          status: 1,
          items: []
        },
        {
          name: '待收货',
          status: 2,
          items: []
        },
        {
          name: '已完成',
          status: 3,
          items: []
        }
      ]
    };
  },

  methods: {
    onLoad(i, items) {
      this.tabsItem[i].items.push(...items);
    },
    beforeRequest() {
      const i = this.activeIndex;
      const status = this.tabsItem[i].status;
      const { shop_id } = this;
      return {
        params: {
          status,
          shop_id
        }
      };
    },
    async delOrder(i) {
      await this.$dialog.confirm({ message: '确定要删除该订单吗?' });
      this.items.splice(i, 1);
      this.$toast('已删除该订单');
    },
    async cancelOrder(i) {
      await this.$dialog.confirm({ message: '确定要取消该订单吗?' });
      if (this.activeIndex == 0) {
        this.items[i].status = 60;
      } else {
        this.items.splice(i, 1);
      }
      this.$toast('已取消该订单');
    },
    async receiptOrder(i) {
      await this.$dialog.confirm({
        message: '请确认收到货物, 确认收货后无法撤销!'
      });
      this.$reqPut(ORDER+'/'+this.tabsItem[this.activeIndex].items[i].id).then(() => {
        this.tabsItem[this.activeIndex].items[i].status = 3;
        this.$toast('已确认收货');
      })
    },
    reminderOrder(i) {
      this.$toast('已提醒卖家发货, 请耐心等待哦~');
    },
    toPay(i) {
      const id = this.tabsItem[this.activeIndex].items[i].id;
      const totalPrice = this.tabsItem[this.activeIndex].items[i].totalPrice;
      this.$router.push({ name: 'payment', params: { id: id, totalPrice: totalPrice} });
    },
    handleTabClick(index) {
      this.$router.replace({
        name: 'user-order-list',
        params: { active: index }
      });
    },
    getStatusText(status) {
      return STATUS_TEXT[status] || '';
    },
    toOrderDetail(i) {
      const order_id = this.tabsItem[this.activeIndex].items[i].id
      this.$router.push({ name: 'user-order-detail', params: { order_id: order_id, status: 'my' } });
    },
    actionHandle(handle, i) {
      this[handle] && this[handle](i);
    }
  },
  components: {
    InfinityScroll,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Panel.name]: Panel,
    [Card.name]: Card,
    [List.name]: List,
    status0,
    status1,
    status2,
    status3
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
