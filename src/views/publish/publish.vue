<template>
  <div>
    <van-nav-bar
      left-arrow
      @click-left="back"
      right-text="发布"
      @click-right="publishGood"
    />

    <van-cell-group>
      <van-field
        v-model="good.name"
        required
        clearable
        label="物品名称"
        placeholder="请输入物品名称"
      />
      <van-cell
        title="类别"
        :value="good.cate"
        isLink
        @click.native="showCateList"
      />
      <van-actionsheet
        v-model="cateShow"
        :actions="cateList"
        @select="selectCate"
      />
      <van-field
        v-model="good.title"
        required
        clearable
        label="物品标题"
        placeholder="请输入物品标题"
      />
      <van-field
        v-model="good.description"
        required
        clearable
        label="描述"
        placeholder="请输入物品描述"
      />
      <van-field
        v-model="good.newLevel"
        required
        clearable
        label="新旧程度"
        placeholder="数字6表示6成新"
      />
      <van-field
        v-model="good.price"
        required
        clearable
        label="价格"
        placeholder="请输入物品价格"
      />
      <van-field
        v-model="good.num"
        required
        clearable
        label="数量"
        placeholder="请输入物品数量"
      />
      <van-radio-group v-model="good.bahrain">
        <van-cell-group>
          <van-cell title="可刀" clickable @click="good.bahrain = 1">
            <van-radio name="1" />
          </van-cell>
          <van-cell title="不可刀" clickable @click="good.bahrain = 0">
            <van-radio name="0" />
          </van-cell>
        </van-cell-group>
      </van-radio-group>
      <van-field
        v-model="good.address"
        required
        clearable
        label="详细地址"
        placeholder="请输入详细地址"
        autosize
        rows="1"
      />
      <van-uploader v-model="good.images" :after-read="onRead">
        <van-field label="点击图片删除">
          <van-button slot="button" size="small" type="info"
            >上传图片</van-button
          >
        </van-field>
      </van-uploader>
      <van-swipe :autoplay="3000">
        <van-swipe-item
          v-for="(image, index) in good.images"
          :key="index"
          @click="delePic(index)"
        >
          <img :src="image.picUrl" width="100%" />
        </van-swipe-item>
      </van-swipe>
    </van-cell-group>
  </div>
</template>

<script>
import { GOODS, GOODS_CATE, GOODS_DETAIL } from '../../api/goods';
import { GOODS_PUBLISH, IMAGES } from '../../api/user';
import {
  Field,
  Actionsheet,
  Uploader,
  Button,
  Swipe,
  SwipeItem,
  RadioGroup,
  Radio,
  NavBar,
  Dialog,
  Toast
} from 'vant';

export default {
  name: 'publish',
  components: {
    [Field.name]: Field,
    [Actionsheet.name]: Actionsheet,
    [Button.name]: Button,
    [Uploader.name]: Uploader,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Radio.name]: Radio,
    [NavBar.name]: NavBar,
    [Dialog.name]: Dialog,
    [Toast.name]: Toast,
    [RadioGroup.name]: RadioGroup
  },

  data() {
    return {
      good: {
        id: undefined,
        name: '',
        cateId: 0,
        cate: '',
        userId: undefined,
        username: '',
        school: '',
        description: '',
        title: '',
        newLevel: undefined,
        bahrain: 0,
        price: 0,
        num: 1,
        address: '',
        images: []
      },
      cateShow: false,
      cateList: [
        {
          loading: true
        }
      ]
    };
  },
  activated: function() {
    this.resetGood();
    this.initData();
  },
  methods: {
    delePic(index) {
      Dialog.confirm({
        title: '图片删除',
        message: '确定删除？'
      })
        .then(() => {
          // on close
          this.$reqDel(GOODS+'/pic/'+this.good.images[index].id).then(() => {
            this.good.images.splice(index, 1);
            this.$toast('删除成功');
          })
        })
        .catch(() => {});
    },
    initData() {
      let goodId = this.$route.query.id;
      if (goodId != undefined) {
        this.$reqGet(GOODS_DETAIL + '/' + goodId).then(res => {
          this.good = res.data.data;
        });
      }
    },
    back() {
      this.$router.go(-1);
    },
    publishGood() {
      if (this.good.id != undefined) {
        console.log(this.good.id);
        // TODO update data
        this.$reqPut(GOODS, this.good).then(res => {
          console.log(res);
          Toast('修改成功');
          this.$router.push({ path: '/user/collect' });
        });
      } else {
        //TODO create data
        this.good.username = localStorage.getItem('username');
        this.$reqPost(GOODS_PUBLISH, this.good).then(res => {
          const data = res.data.data;
          this.good.id = data.id;
          this.good.images = data.images;
          Toast('发布成功');
          this.resetGood();
          this.$router.push({ path: '/user/collect' });
        });
      }
      console.log(this.good);
    },
    resetGood() {
      this.good.id = undefined;
      this.good.name = '';
      this.good.cateId = 0;
      this.good.cate = '';
      this.good.userId = undefined;
      this.good.username = '';
      this.good.school = '';
      this.good.description = '';
      this.good.title = '';
      this.good.newLevel = undefined;
      this.good.bahrain = 0;
      this.good.price = 0;
      this.good.num = 1;
      this.good.address = '';
      this.good.images = [];
    },
    onRead(file) {
      let formData = new FormData();
      formData.append('file', this.dataURLtoFile(file.content, file.file.type));
      var temp = {
        id: undefined,
        productId: this.good.id,
        picUrl: ''
      }
      this.$reqPost(IMAGES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        const data = res.data.data;
        temp.picUrl = data;
        if (this.good.id != undefined) this.addProductPic(temp);
        else this.good.images.push(temp);
        console.log(this.good.images)
      });
    },
    // 添加物品对应的照片
    addProductPic(productPic) {
      this.$reqPost(GOODS+'/pic', productPic).then(res => {
        productPic.id = res.data.data;
        this.good.images.push(productPic);
        return productPic.id;
      })
    },
    //将base64转换为blob
    dataURLtoFile: function(base64Data, type) {
      //去掉base64中的换行符，webkit会自动去除，但是IOS9以及IOS8中不会自动去除，导致转换出错
      base64Data = base64Data.replace(/\s/g, '');

      var text = window.atob(base64Data.split(',')[1]);
      var buffer = new ArrayBuffer(text.length);
      var ubuffer = new Uint8Array(buffer);
      for (var i = 0; i < text.length; i++) {
        ubuffer[i] = text.charCodeAt(i);
      }

      var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
      var blob;

      if (Builder) {
        var builder = new Builder();
        builder.append(buffer);
        blob = builder.getBlob(type);
      } else {
        blob = new window.Blob([buffer], {
          type: type
        });
      }
      return blob;
    },
    showCateList() {
      this.cateShow = true;
      this.$reqGet(GOODS_CATE).then(res => {
        console.log(res);
        let data = res.data.data;
        this.cateList = data.records;
      });
    },
    selectCate(data) {
      this.good.cateId = data.id;
      this.good.cate = data.name;
      this.cateShow = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.interval_bot {
  margin-bottom: 10px;
}
</style>
