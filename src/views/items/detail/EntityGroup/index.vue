<template>
  <div class="item_cell_group">
    <van-cell-group>
      <van-cell
        title="选择规格"
        isLink
        :value="selectSku.selectedSkuComb.sku_str"
        @click.native="skuClick"
      />
      <van-cell title="商品属性" isLink @click.native="propsPopup = true" />
      <van-cell
        title="配送至"
        isLink
        :value="addressVal.school"
        @click.native="addressPopup = true"
      />
      <van-cell
        title="配送方式"
        isLink
        :value="postFee"
        @click.native="postShow = true"
      />
    </van-cell-group>

    <van-sku
      v-model="showSku"
      :showAddCartBtn="showAddCartBtn"
      :buyText="buyText"
      :sku="skus.sku"
      :goods="skus.goods_info"
      :goodsId="goodsInfo.id"
      :disableStepperInput="true"
      @buy-clicked="buyGoods"
    />

    <van-popup v-model="propsPopup" position="bottom">
      <popup-props :propsStr="props_str"></popup-props>
    </van-popup>

    <van-popup v-model="areaPopup" position="bottom">
      <popup-area
        v-if="areaPopup"
        @confirm="emitAddressVal"
        @cancel="areaPopup = false"
      />
    </van-popup>

    <van-popup v-model="addressPopup" position="bottom">
      <popup-address
        :is-show="addressPopup"
        :addressVal="addressVal"
        :default-id="defaultId"
        @confirm="emitAddressVal"
        @area-click="areaClick"
      />
    </van-popup>
    <van-actionsheet
      v-model="postShow"
      :actions="postVal"
      @select="emitPostVal"
    />
  </div>
</template>

<script>
const popupArea = () =>
  import(/* webpackChunkName: "popup-area" */ './popup-area');
import popupAddress from './popup-address';
import popupProps from './popup-props';
import actionMixin from '../mix';
import { ADDRESS_DEFAULT } from '@/api/user';
import { Actionsheet } from 'vant';
// import { POST_FEE } from '@/api/shop';

export default {
  name: 'entity-group',

  props: {
    goodsInfo: {
      type: Object,
      default: () => ({})
    },
    selectSku: {
      type: Object,
      default: () => ({})
    },
    addressVal: {
      type: Object,
      default: () => ({})
    }
  },

  mixins: [actionMixin],

  data() {
    const sku = this.skuAdapter(this.goodsInfo.skus, this.goodsInfo.prop_imgs);
    const goods_info = this.setSkuGoodsInfo(this.goodsInfo);
    const postFee = '自提';
    return {
      postFee,
      propsPopup: false,
      addressPopup: false,
      postShow: false,
      areaPopup: false,
      skus: {
        sku,
        goods_info
      },
      defaultId: -1,
      postVal: [
        {
          name: '自提'
        },
        {
          name: '快递'
        }
      ]
    };
  },

  computed: {
    props_str() {
      let props = [
        {key: '类别',value: this.goodsInfo.cate},
        {key: '物品名称', value: this.goodsInfo.name}
      ];
      return props;
    },
    weight() {
      return parseFloat(this.goodsInfo.weight) * this.selectSku.selectedNum;
    }
  },

  created() {
    this.getAddressDefault();
  },

  methods: {
    emitPostVal(item) {
      this.postFee = item.name;
      this.postShow = false;
    },
    areaClick() {
      this.areaPopup = true;
      this.addressPopup = false;
    },
    emitAddressVal(data) {
      this.$emit('update:addressVal', data);
    },
    setSkuGoodsInfo({ name, images, price }) {
      return {
        title: name,
        picture: images[0].picUrl,
        price: price
      };
    },
    getAddressDefault() {
      localStorage.getItem('Authorization') &&
        this.$reqGet(ADDRESS_DEFAULT).then(res => {
          const data = res.data.data;
          this.defaultId = data.id;
          this.emitAddressVal(data);
        });
    },
    skuAdapter(skus = [], prop_imgs = []) {
      const tree = this.setSkuTree(skus, prop_imgs);
      const list = this.setSkuList(skus);
      const skuInfo = {
        price: parseInt(this.goodsInfo.price) / 100, // 未选择规格时的价格
        stock_num: this.goodsInfo.num, // 总库存
        collection_id: '', // 无规格商品skuId取collection_id，否则取所选sku组合对应的id
        none_sku: false, // 是否无规格商品
        hide_stock: false
      };
      return {
        tree,
        list,
        ...skuInfo
      };
    },
    setSkuList(skus) {
      skus.forEach(sku => {
        sku.props.split(';').forEach((str, i) => {
          sku[`s${i + 1}`] = str.match(/[^:]*:([^:]*)/)[1];
        });
        // key值转换适配, 后端数据和组件要求的key不一致
        sku.stock_num = sku.num;
        sku.goods_id = sku.props;
        sku.sku_str = sku.props_str;
        sku.price = sku.price;
      });
      return skus;
    },
    setSkuTree(skus, prop_imgs) {
      const skulist = [];
      skus.forEach(el => {
        const propImg = prop_imgs.find(img => img.props == el.props);
        el.props_str_arr = el.props_str.split(';').filter(str => str != '');
        el.props_arr = el.props.split(';').filter(str => str != '');
        el.imgUrl = propImg ? propImg.url : '';
      });
      skus.forEach(el => {
        el.props_str_arr.forEach((sku, i) => {
          const prop = el.props_arr[i];
          // 大规格
          const pName = sku.substr(0, sku.indexOf(':'));
          const k_id = prop.substr(0, prop.indexOf(':'));
          // 规格值 prop_values
          const vName = sku.substr(sku.indexOf(':') + 1);
          const vid = prop.substr(prop.indexOf(':') + 1);

          if (!skulist[i]) {
            skulist[i] = {
              k_id,
              k: pName,
              v: [
                {
                  id: vid,
                  name: vName,
                  imgUrl: el.imgUrl
                }
              ],
              k_s: `s${i + 1}`
            };
          } else {
            const isPass = skulist[i].v.some(val => val.id == vid);
            !isPass &&
              skulist[i].v.push({
                id: vid,
                name: vName,
                imgUrl: el.imgUrl
              });
          }
        });
      });
      return skulist;
    }
  },

  components: {
    popupArea,
    [popupAddress.name]: popupAddress,
    [popupProps.name]: popupProps,
    [Actionsheet.name]: Actionsheet
  }
};
</script>

<style lang="scss" scoped></style>
