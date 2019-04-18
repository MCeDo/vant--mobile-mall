<template>
  <div>
    <van-cell-group>
      <van-cell
        icon="dingwei"
        isLink
        :title="consignee"
        :label="address"
		@click.native="addressPopup = true"
      />

      <van-cell
        class="daodian"
        title="上门自提"
        label=""
      >
        <van-checkbox v-model="isDaoDian" slot="icon" @click="sendIsDaoDian"></van-checkbox>
      </van-cell>

      <!--<van-cell icon="id-card" title="张三" label="330327********1574" isLink />-->
    </van-cell-group>
    <van-popup v-model="addressPopup" position="bottom">
      <popup-address
        :is-show="addressPopup"
        :addressVal="addressVal"
        :default-id="defaultId"
        @confirm="emitAddressVal"
        @area-click="areaClick"
      />
    </van-popup>
  </div>
</template>

<script>
import { Popup, Actionsheet, Checkbox } from 'vant';
import popupAddress from '../../items/detail/EntityGroup/popup-address';
import popupProps from '../../items/detail/EntityGroup/popup-props';
import { ADDRESS_DEFAULT } from '@/api/user';

export default {
  name: 'top-user-info',
  props: {
    addressVal: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      isDaoDian: false,
      addressPopup: false,
      consignee: '三',
      phone: '13512124547',
	  address: '浙江省 杭州市 西湖区 创新创业园',
      defaultId: -1
    };
  },

  methods: {
    getAddressDefault() {
	  localStorage.getItem('Authorization') &&
	  this.$reqGet(ADDRESS_DEFAULT).then(res => {
		  const data = res.data.data;
		  this.defaultId = data.id;
		  this.emitAddressVal(data);
	  });
    },
  	emitAddressVal(data) {
      this.school = data.school;
      this.address = data.address;
      this.consignee = data.consignee;
	  // this.addressVal.id = data.id;
      data.isDaoDian = this.isDaoDian;
      this.$emit('getAddressVal', data);
    },
    areaClick() {
      // this.areaPopup = true;
      this.addressPopup = false;
    },
    sendIsDaoDian() {
      this.$emit('getAddressVal', this.isDaoDian);
    }
  },
  created() {
	  this.getAddressDefault();
  },
  components: {
    [popupAddress.name]: popupAddress,
    [popupProps.name]: popupProps,
    [Checkbox.name]: Checkbox,
    [Popup.name]: Popup,
    [Actionsheet.name]: Actionsheet
  }
};
</script>

<style lang="scss">
.daodian {
  .van-checkbox .van-icon-success {
    height: 16px;
    width: 16px;
    font-size: $font-size-small;
    &::before {
      line-height: 16px;
    }
  }
  .van-checkbox__input {
    height: 16px;
  }
  .van-checkbox__label {
    margin-left: 0;
  }
  .shop_address {
    padding-left: 25px;
    box-sizing: border-box;
  }
}
</style>
