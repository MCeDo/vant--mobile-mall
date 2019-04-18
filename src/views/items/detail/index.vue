<template>
  <div class="item_detail">
    <van-swipe :autoplay="3000">
      <van-swipe-item v-for="(image, index) in itemImgs" :key="index">
        <img v-lazy="image.picUrl" width="100%" />
      </van-swipe-item>
    </van-swipe>

    <van-cell-group class="item_cell_group" v-if="goods">
      <van-cell class="item_info">
        <div>
          <span class="item_price">{{ goods.sales_price | yuan }}</span>
          <span class="item_market_price">{{ goods.market_price | yuan }}</span>
        </div>
        <div class="item-title">
          <van-tag plain type="danger" v-if="goods.is_haitao">海淘</van-tag>
          {{ goods.name }}
        </div>
        <div class="item_intro">{{ goods.sell_point }}</div>
        <div class="item_dispatch">发货地: {{ goods.school }}</div>
      </van-cell>
    </van-cell-group>

    <component
      v-if="goods"
      ref="goodAction"
      v-bind:is="goods.is_virtual ? 'virtual-group' : 'entity-group'"
      :selectSku.sync="selectSku"
      :addressVal.sync="addressVal"
      :mobile="mobile"
      :goods-info="goods"
      @skuBuy="doBuyNow"
    />

    <div class="item_desc" v-if="goods">
      <div class="item_desc_title">商品详情</div>
      <div class="item_desc_wrap" v-html="goods.description"></div>
      <div class="item_desc_wrap">
        <img v-for="i in goods.images" :src="i.picUrl" v-bind="i"/>
      </div>
    </div>

    <div class="item_desc" v-if="goods">
      <div class="item_comment">
        <span>留言</span>
        <van-button
          class="item_comment_btn"
          size="small"
          type="info"
          @click="commentShow = true"
          >发表留言</van-button
        >
      </div>
      <div v-show="this.commentList.length == 0">暂无留言</div>
      <div v-for="comment in this.commentList" v-bind="comment">
        <van-panel
          :title="
            comment.username +
              (comment.replyId === null ? '' : '回复@' + comment.replyName)
          "
          :desc="comment.content"
        >
          <!--<div>{{comment.content}}</div>-->
          <div slot="footer">
            <van-button
              size="small"
              v-show="userId != comment.userId"
              @click="reply(comment)"
              >回复</van-button
            >
            <van-button
              size="small"
              type="danger"
              v-show="userId == comment.userId"
              @click="delComment(comment.id)"
              >删除</van-button
            >
          </div>
        </van-panel>
      </div>
    </div>
    <van-popup v-model="commentShow" position="bottom" :overlay="true">
      <div>发表留言</div>
      <van-cell-group>
        <van-field
          v-model="message"
          label="留言"
          type="textarea"
          placeholder=""
          rows="1"
          autosize
        />
        <van-button
          type="info"
          size="small"
          round
          class="item_comment_conf"
          @click="comment"
          >发表</van-button
        >
      </van-cell-group>
    </van-popup>
    <van-goods-action>
      <van-goods-action-mini-btn
        @click="doContact"
        icon="wangwang"
        iconClass="red afterTag"
      />
      <van-goods-action-mini-btn @click="toCart" icon="cart" :info="cartInfo" />
      <van-goods-action-mini-btn @click="addCollect" icon="shoucang" />
      <van-goods-action-big-btn @click="addCart" text="加入购物车" />
      <van-goods-action-big-btn primary @click="doBuyNow" text="立即购买" />
    </van-goods-action>

    <van-popup v-model="showContact">
      <md-kefu mobile="16454193338" />
    </van-popup>
  </div>
</template>

<script>
import { Button, Panel, Field } from 'vant';
import { GOODS_DETAIL } from '@/api/goods';
import { COMMENT } from '@/api/comment';

import {
  Swipe,
  SwipeItem,
  GoodsAction,
  GoodsActionBigBtn,
  GoodsActionMiniBtn,
  Popup
} from 'vant';

import md_kefu from '@/vue/components/md-kefu/';

export default {
  props: {
    itemId: [String, Number]
  },

  data() {
    const isLogin = !!localStorage.getItem('Authorization');
    const userId = localStorage.getItem('userId');
    return {
      isLogin,
      userId,
      showContact: false,
      cartInfo: '5',
      mobile: '13454193338',
      selectSku: {
        selectedNum: 1,
        selectedSkuComb: {}
      },
      addressVal: {
        id: null,
        school: '',
        address: '',
        default_address: ''
      },
      goods: null,
      commentModel: false,
      commentList: [],
      commentShow: false,
      message: '',
      temp: {
        id: undefined,
        productId: undefined,
        userId: undefined,
        username: '',
        content: '',
        replyId: undefined,
        replyName: ''
      }
    };
  },

  computed: {
    itemImgs() {
      return this.goods ? this.goods.images : [];
    }
  },

  created() {
    this.initData();
  },

  methods: {
    delComment(id) {
      this.$dialog.confirm({ message: '是否删除该留言' }).then(() => {
        this.$reqDel(COMMENT + '/' + id).then(res => {
          this.$toast(res.data.msg);
          for (let i = 0; i < this.commentList.length; i++) {
            if (this.commentList[i].id == id) {
              this.commentList.splice(i, 1);
              break;
            }
          }
        });
      });
    },
    getCommentList() {
      this.$reqGet(COMMENT+'/product', {productId: this.goods.id}).then(res => {
        const data = res.data.data;
        this.commentList = data;
        return data;
      });
    },
    reply(comment) {
      this.temp.replyId = comment.userId;
      this.temp.replyName = comment.username;
      this.commentShow = true;
    },
    comment() {
      this.temp.userId = this.userId;
      this.temp.username = localStorage.getItem('username');
      this.temp.content = this.message;
      this.temp.productId = this.goods.id;
      this.$reqPost('/shop/comment', this.temp).then(res => {
        this.commentList.push(res.data.data);
        this.resetTemp();
        this.$toast('发表成功');
      });
    },
    resetTemp() {
      this.message = '';
      this.commentShow = false;
      this.temp.userId = undefined;
      this.temp.id = undefined;
      this.temp.username = '';
      this.temp.content = '';
      this.temp.replyId = undefined;
      this.temp.replyName = '';
      this.temp.productId = undefined;
    },
    initData() {
      this.$reqGet(`${GOODS_DETAIL}` + this.itemId, {
        expand: 'desc,skus,prop_imgs,item_imgs'
      }).then(res => {
        this.goods = res.data.data;
        this.getCommentList();
      });
    },

    doBuyNow() {
      if (this.goods.num == 0) {
        this.$toast('物品已卖完');
        return;
      }
      if (
        (this.goods.has_sku && this.selectSku.sku_id) ||
        !this.goods.has_sku
      ) {
        this.goods.buy_num = this.selectSku.selectedNum;
        this.$router.push({
          name: 'placeOrderEntity',
          params: this.goods
        });
      } else {
        const goodAction = this.$refs.goodAction;
        goodAction.showSku = true;
        goodAction.isSkuBuy = true;
      }
    },
    addCart() {
      if (this.goods && this.selectSku) {
        this.$toast({
          message: '已添加至购物车',
          duration: 1500
        });
        this.cartInfo = String(parseInt(this.cartInfo) + 1);
      }
    },
    doContact() {
      this.showContact = true;
    },
    toCart() {
      this.$router.push({
        name: 'cart'
      });
    },
    addCollect() {
      this.$toast({
        message: '已添加至我的收藏',
        duration: 1500
      });
    }
  },

  components: {
    [md_kefu.name]: md_kefu,
    [Popup.name]: Popup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [GoodsAction.name]: GoodsAction,
    [GoodsActionBigBtn.name]: GoodsActionBigBtn,
    [GoodsActionMiniBtn.name]: GoodsActionMiniBtn,
    [Button.name]: Button,
    [Panel.name]: Panel,
    [Field.name]: Field,
    'entity-group': () =>
      import(/* webpackChunkName: "EntityGroup" */ './EntityGroup/index'),
    'virtual-group': () =>
      import(/* webpackChunkName: "VirtualGroup" */ './VirtualGroup/index.vue')
  }
};
</script>

<style lang="scss" scoped>
.item_detail {
  img {
    max-width: 100%;
  }
}

.item_cell_group {
  margin-bottom: 15px;
}

.item_price {
  font-size: 20px;
  color: $red;
  margin-right: 10px;
}

.item_market_price {
  color: $font-color-gray;
  text-decoration: line-through;
  font-size: $font-size-small;
}

.item-title {
  line-height: 1.4;
}

.item_dispatch {
  font-size: $font-size-small;
  color: $font-color-gray;
}

.item_intro {
  line-height: 18px;
  margin: 5px 0;
  font-size: $font-size-small;
  color: $font-color-gray;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.item_desc {
  background-color: #fff;
  p {
    padding: 0 10px;
  }
  /deep/ img {
    max-width: 100%;
    display: block;
  }
}

.item_desc_title {
  @include one-border;
  padding: 10px 0;
  text-align: center;
}
.item_comment {
  @include one-border;
  padding: 10px 0;
  color: deepskyblue;
  text-align: left;
}
.item_comment_btn {
  @include one-border;
  float: right;
}
.item_comment_conf {
  @include one-border;
  float: right;
}
</style>
