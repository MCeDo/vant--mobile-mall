<template>
  <van-cell-group>
    <van-field
      v-model="address.consignee"
      required
      clearable
      label="收件人"
      placeholder="请输入收件人"
    />

      <van-field
              v-model="address.userId"
              required
              clearable
              label="收件人ID"
              v-show="false"
      />

    <van-field
      v-model="address.phone"
      label="联系方式"
      placeholder="请输入联系方式"
      required
    />
    <van-cell
      title="学校"
      :value="address.school"
      isLink
      @click.native="showSchoolList"
    />
    <van-actionsheet
      v-model="showSchool"
      :actions="schoolList"
      @select="selectSchool"
    />
    <van-field
      v-model="address.address"
      label="详细地址"
      placeholder="请输入详细地址"
      required
    />

	  <van-button size="large" type="info" round style="margin-top: 10%;" @click="save">
		  <span v-show="this.addressId == undefined">添加地址</span>
		  <span v-show="this.addressId != undefined">修改地址</span>
	  </van-button>
  </van-cell-group>
</template>

<script>
import { AddressEdit, Field, Actionsheet,Button } from 'vant';
// import areaList from './area.json';
import { ADDRESS } from '@/api/user';

export default {
  name: 'address-edit',

  props: {
    addressId: [Number, String]
  },

  data() {
    return {
      schoolList: [
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
      ],
      showSchool: false,
      isSave: false,
      address: {
        id: this.addressId,
        userId: undefined,
        consignee: '',
        phone: '',
        school: '',
        address: '',
        defaultAddress: 0
      },
      init: this.initData()
    };
  },

  activated() {
    console.log(this.address)
    setTimeout(() => {
      this.addressInfo = {
        id: this.addressId,
        name: 'qianzhaoy',
        tel: '13454193338',
        province: '浙江省',
        city: '杭州市',
        county: '西湖区',
        address_detail: '是的是的',
        area_code: '330106',
        postal_code: 123456
      };
    }, 1000);
  },

  methods: {
    initData() {
      if (this.addressId == undefined) {
        return;
      }
      this.$reqGet(ADDRESS+'/'+this.addressId).then(res => {
        const data = res.data.data;
        this.address = data;
        return data;
      });
    },
    showSchoolList() {
      this.showSchool = true;
    },
    selectSchool(data) {
      this.address.school = data.name;
      this.showSchool = false;
    },
    save() {
      let req = undefined;
      if (this.addressId == undefined) req = this.$reqPost;
      else req = this.$reqPut;
      console.log(this.address);
      req(ADDRESS, this.address).then(res => {
        console.log(res);
        if (res.status == 200) {
          this.$toast('成功');
          this.$router.push({path: '/user/address'});
        }
      })
    }
  },

  components: {
    [AddressEdit.name]: AddressEdit,
    [Actionsheet.name]: Actionsheet,
    [Button.name]: Button,
    [Field.name]: Field
  }
};
</script>
