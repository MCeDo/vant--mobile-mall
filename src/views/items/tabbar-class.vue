<template>
	<div class="tab_class">
		<div class="tal_class_searchBox">
			<van-search placeholder="点击前往搜索"/>
			<div class="tal_class_searchMask"  @click="$router.push({ name: 'search' })"></div>
		</div>
		<class-tree
      class="height-fix42"
			@class-click="toItemDetail"
			@all-click="toItemList"
			:list="list"
		></class-tree>

		<is-empty v-if="isEmpty">抱歉,店主还未上架商品</is-empty>
	</div>
</template>

<script>
import { GOODS_CATEGORY } from '@/api/goods';

import { Search } from 'vant';
import classTree from './tabbar-class-tree';
import IsEmpty from '@/vue/components/is-empty';

export default {
  data() {
    return {
      list: [],
      isEmpty: false
    };
  },

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.$reqGet(`${GOODS_CATEGORY}`).then(res => {
        // const data = this.removeNoChild(res.data.data);
        const data = res.data.data;
        this.list = data.records;
        this.isEmpty = !data.records || !data.records.length;
      });
    },
    removeNoChild(data) {
      return data.filter(item => item.children && item.children.length);
    },
    toItemList(id = '') {
      this.$router.push({
        name: 'list',
        query: { keyword: '', cateId: id }
      });
    },
    toItemDetail(id = '') {
    	console.log('ddd')
	  this.$router.push({
		  path: '/items/detail/'+id,
		  query: { keyword: '', itemId: id }
	  });
    }
  },
  components: {
    [Search.name]: Search,
    [classTree.name]: classTree,
    [IsEmpty.name]: IsEmpty
  }
};
</script>


<style scoped>
.tab_class {
  overflow: hidden;
  background-color: #fff;
}

.height-fix {
  padding-bottom: 42px;
}

.tal_class_searchBox {
  position: relative;
}

.tal_class_searchMask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
}
</style>
