<template>
  <div class="user_collect">
    <form action="/search" class="fixedTop">
      <van-search placeholder="请输入商品名称" v-model="searchVal" />
    </form>

    <van-list
      v-model="loading"
      :finished="finished"
      :immediate-check="false"
      :offset="100"
      @load="loadMore"
    >
      <item-group>
        <item-card-hori
          v-for="(item, i) in items"
          :style="{ backgroundColor: !item.goods_status && '#fcfcfc' }"
          :key="i"
          :goods="item"
          @click="itemClick(i)"
        >
          <van-icon
            name="lajitong"
            slot="footer"
            @click.stop="del($event, i)"
            style="float: right;"
          />
          <van-icon
            name="edit"
            slot="footer"
            @click.stop="editGood($event, item)"
            style="float: right; margin-right: 10%"
          />
        </item-card-hori>
      </item-group>
    </van-list>

    <is-empty v-if="isEmpty">没有发布商品</is-empty>

    <div class="clear_invalid" v-if="items.length" @click="clearInvalid">
      <van-icon name="lajitong" />
      清除失效商品
    </div>
  </div>
</template>

<script>
import { GOODS_PUBLISH } from '@/api/user';
import { GOODS } from '@/api/goods';

import ItemGroup from '@/vue/components/item-group/';
import ItemCardHori from '@/vue/components/item-card-hori/';
import IsEmpty from '@/vue/components/is-empty/';
import { Search, List } from 'vant';

import loadMore from '@/vue/mixin/list-load-more';
import scrollFixed from '@/vue/mixin/scroll-fixed';

export default {
  mixins: [loadMore, scrollFixed],

  data() {
    return {
      shop_id: 1,
      items: [],
      searchVal: ''
    };
  },

  created() {
    this.resetInit();
  },

  methods: {
    initData() {
      return this.$reqGet(
        GOODS_PUBLISH,
        {
          'limit': this.pages.perPage,
          page: this.pages.currPage,
        },
        {
          hideLoading: true
        }
      ).then(res => {
        const data = res.data.data;
        const items = data.records;
        const page = {limit: data.size, currPage: data.current, pageCount: data.pages}
        this.items.push(...items);
        return page;
      });
    },
    del(event, i) {
      this.$dialog.confirm({ message: '是否删除该商品' }).then(() => {
        this.$reqDel(GOODS+'/'+this.items[i].id).then(() => {
          this.items.splice(i, 1);
        })
      });
    },
    editGood(event, item) {
      this.$router.push({path: '/publish', query: {id: item.id}})
    },
    clearInvalid() {
      this.$dialog.confirm({ message: '确定清除所有失效商品吗?' });
    },
    itemClick(i) {
      const item_id = this.items[i].id;
      this.$router.push({
        name: 'detail',
        params: { itemId: item_id }
      });
    }
  },

  components: {
    [ItemGroup.name]: ItemGroup,
    [ItemCardHori.name]: ItemCardHori,
    [Search.name]: Search,
    [IsEmpty.name]: IsEmpty,
    [List.name]: List
  }
};
</script>

<style lang="scss" scoped>
.clear_invalid {
  width: 120px;
  color: $font-color-gray;
  border: 1px solid $font-color-gray;
  margin: 0 auto;
  text-align: center;
  padding: 5px 3px;
  margin-top: 20px;
  border-radius: 3px;
}
</style>
