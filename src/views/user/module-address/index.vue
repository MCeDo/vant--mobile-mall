<template>
  <div>
    <my-header></my-header>
    <van-radio-group v-model="default_address" @change="setDefaultAddress">
      <van-cell-group
        v-for="(item, index) in addressList"
        :key="item.id"
        class="addressGroup"
      >
        <van-cell
          isLink
          icon="dingwei"
          :title="item.consignee"
          :label="item.school"
        />

        <van-cell>
          <van-radio
            slot="title"
            :name="item.id"
            @change="setDefaultAddress(item.id)"
          >
            <span :class="item.isDefault && 'red'">{{
              item.isDefault ? '默认地址' : '设为默认'
            }}</span>
          </van-radio>
          <div>
            <router-link
              :to="{ name: 'address-edit', params: { addressId: item.id } }"
              style="margin-right: 10px;"
            >
              <van-icon name="editor" />
              编辑
            </router-link>
            <span>
              <van-icon name="lajitong" @click="del(index)" />
              删除
            </span>
          </div>
        </van-cell>
      </van-cell-group>
    </van-radio-group>

    <van-button
      class="bottom_btn"
      @click="setNewAddress"
      type="primary"
      bottomAction
    >
      添加地址
    </van-button>
  </div>
</template>

<script>
import { ADDRESS, ADDRESS_DEFAULT, ADDRESS_SET_DEFAULT } from '@/api/user';
import { Checkbox, Radio, RadioGroup } from 'vant';
import MyHeader from '../../../vue/components/MyHeader/index';

export default {
  data() {
    return {
      default_address: this.getDefaultAddressId(),
      old_default_address: this.getDefaultAddressId(),
      addressList: this.getAddress()
    };
  },

  activated() {
  },
  methods: {
    del(index) {
      this.$dialog.confirm({ message: '是否删除该地址' }).then(() => {
        this.$reqDel(ADDRESS+'/'+this.addressList[index].id).then(() => {
          this.addressList.splice(index, 1);
          this.$toast('删除成功');
        })
      }).catch(() => {});
    },
    getAddress() {
      this.$reqGet(ADDRESS).then(res => {
        let data = res.data.data;
        this.addressList = data;
      }).catch(() => {});
    },
    getDefaultAddressId() {
      this.$reqGet(ADDRESS_DEFAULT).then(res => {
        let data = res.data.data;
        this.default_address = data==undefined?-1:data.id;
        this.old_default_address = this.default_address;
      });
    },
    setDefaultAddress(id) {
      if (this.old_default_address == id) {
        return;
      }
      this.$reqPut(ADDRESS_SET_DEFAULT+this.old_default_address+'/'+id).then(() => {
        this.old_default_address = id;
      });
    },
    setNewAddress() {
      this.$router.push({ name: 'address-edit', params: { addressId: undefined } });
    }
  },

  components: {
    MyHeader,
    [Checkbox.name]: Checkbox,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup
  }
};
</script>

<style lang="scss" scoped>
.addressGroup {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.bottom_btn {
  position: fixed;
  bottom: 0;
}
</style>
