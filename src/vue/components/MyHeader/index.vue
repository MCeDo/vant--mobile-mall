<template>
	<van-nav-bar left-text="返回" left-arrow @click-left="onClickLeft"/>
</template>


<script>
import { NavBar } from 'vant';

export default {
  name: 'MyHeader',
  watch: {
    $route: 'changeActive'
  },

  created() {
  },

  methods: {
  	onClickLeft() {
	  this.$router.go(-1);
    }
  },

  components: {
    [NavBar.name]: NavBar
  }
};
</script>
