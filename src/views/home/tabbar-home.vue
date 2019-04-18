<template>
  <div class="tab_home">
    <van-nav-bar
      :title="this.school"
      right-text="更换学校"
      left-text="发布闲置"
      @click-right="onClickRight"
      @click-left="onClickLeft"
    />
    <van-actionsheet v-model="show" :actions="actions" @select="changeSchool" />
    <van-list
      v-model="loading"
      class="scroll-load"
      :finished="finished"
      :immediate-check="false"
      :offset="100"
      @load="loadMore"
    >
      <item-group
        v-for="(group, key) in itemGroup"
        v-if="group"
        :key="key"
        class="interval_bot"
        :setting="group.setting"
      >
        <component
          v-for="item in group.page.records"
          :goods="item"
          :key="item.id"
          :is="getStyle(group.setting.style)"
          @click="toGoods(item)"
        >
          <div slot="mask" v-if="lootAll(item)">
            <img src="../../assets/images/not_enough.png" alt="已抢光" />
          </div>
          <div slot="leftTopIcon" v-if="item.as_status < 2">
            <img :src="mxStatus(item.as_status)" alt="秒杀" />
          </div>
        </component>
      </item-group>
    </van-list>
  </div>
</template>
<script>
import { HOME_module, ALL_GOODS } from '@/api/shop';
import getLocationParam from 'core/utils/location-param';

import mx_be_to from '@/assets/images/mx_be_to.png';
import mx_start from '@/assets/images/mx_start.png';

import SignBoard from './tabbar-home-sign-board';
import ShopInfoGroup from './tabbar-home-shop-info';
import ItemGroup from '@/vue/components/item-group/';
import ItemCardVert from '@/vue/components/item-card-vert/';
import ItemCardHori from '@/vue/components/item-card-hori/';

import loadMore from '@/vue/mixin/list-load-more';
import scrollFixed from '@/vue/mixin/scroll-fixed';

import { List, NavBar, Actionsheet } from 'vant';

export default {
  mixins: [loadMore, scrollFixed],

  data() {
    const shop_id = getLocationParam('shop_id');
    return {
      shop_id,
      shopInfo: null,
      itemGroup: {
        mx_goods: null,
        activity_seckill: null,
        shop_recommend: null,
        goods: null
      },
      mx_be_to,
      mx_start,
      isLoading: false,
      school: '广东技术师范大学',
      show: false,
      actions: [
        {
          name: '广东技术师范大学'
        },
        {
          name: '华南师范大学'
        },
        {
          name: '华南理工大学'
        },
        {
          name: '暨南大学'
        },
        {
          name: '中山大学'
        }
      ]
    };
  },

  computed: {
    location() {
      const shopInfo = this.shopInfo;
      const local = {
        name: shopInfo.shop_name,
        lat: shopInfo.lat,
        lng: shopInfo.lng
      };
      return local.lat && local.lng ? local : null;
    }
  },

  created() {
    this.initViews();
  },

  methods: {
    changeSchool(item) {
      this.school = item.name;
      this.initData();
      this.show = false;
    },
    onClickRight() {
      this.show = true;
    },
    onClickLeft() {
      this.$router.push({ path: '/publish'});
    },
    initViews() {
      this.$reqGet(HOME_module, {
        'limit': this.pages.limit,
        page: 1
      }).then(res => {
        const {
          // mx_goods,
          shop_recommend,
          activity_seckill,
          goods
        } = this.decorate(res.data.data);
        // this.itemGroup.mx_goods = mx_goods;
        this.itemGroup.shop_recommend = shop_recommend;
        this.itemGroup.activity_seckill = activity_seckill;
        this.itemGroup.goods = goods;
        const page = goods.page;
        console.log(page)
        this.setPages(page);
      });
    },

    initData() {
      return this.$reqGet(ALL_GOODS, {
        shop_id: this.shop_id,
        'limit': this.pages.perPage,
        page: this.pages.currPage,
        school: this.school
      }).then(res => {
        const { items, page } = res.data.data;
        console.log(res.data.data)
        this.itemGroup.goods && this.itemGroup.goods.items.push(...items);
        return page;
      });
    },

    toGoods(item) {
      // 如果是秒杀商品, 并且已经抢光
      if (this.lootAll(item)) {
        this.$dialog.alert({ message: '该秒杀商品已抢光，看看别的吧！' });
        return;
      }
      this.$router.push({ path: `/items/detail/${item.id}` });
    },

    groupIcon(key) {
      const iconGroup = {
        activity_seckill: 'naozhong',
        goods: 'list',
        mx_goods: 'n4',
        shop_recommend: 'good'
      };
      return iconGroup[key] || '';
    },

    getStyle(style) {
      return style ? 'item-card-vert' : 'item-card-hori';
    },

    decorate({ mx_goods, shop_recommend, activity_seckill, goods }) {
      if (mx_goods) {
        mx_goods.setting.icon = 'n4';
        mx_goods.setting.title_desc = '分享得金豆';
        mx_goods.setting.title_color = '#db3d3c';
        mx_goods.setting.item_len = mx_goods.page.records.length;
      }
      if (shop_recommend) {
        shop_recommend.setting.icon = 'good';
        shop_recommend.setting.item_len = shop_recommend.page.records.length;
      }
      if (activity_seckill) {
        activity_seckill.setting.icon = 'naozhong';
        activity_seckill.setting.title_color = '#db3d3c';
        activity_seckill.setting.item_len = activity_seckill.page.records.length;
      }
      if (goods) {
        goods.setting.icon = 'list';
        goods.setting.item_len = goods.page.records.length;
      }
      return {
        // mx_goods,
        shop_recommend,
        activity_seckill,
        goods
      };
    },

    lootAll(item) {
      return (
        typeof item.as_status !== 'undefined' && item.sold_num == item.total
      );
    },

    mxStatus(as_status) {
      return as_status ? this.mx_start : this.mx_be_to;
    }
  },

  components: {
    [List.name]: List,
    [SignBoard.name]: SignBoard,
    [ShopInfoGroup.name]: ShopInfoGroup,
    [ItemGroup.name]: ItemGroup,
    [ItemCardVert.name]: ItemCardVert,
    [ItemCardHori.name]: ItemCardHori,
    [NavBar.name]: NavBar,
    [Actionsheet.name]: Actionsheet
  }
};
</script>
<style lang="scss" scoped>
.interval_bot {
  margin-bottom: 10px;
}
</style>
