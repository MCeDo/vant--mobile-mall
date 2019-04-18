<template>
	<div slot="footer" class="order_list--footer_btn">
		<van-button size="small" type="danger" @click="$emit('handle', 'toOrderDetail')" :disabled="!reminder">填写快递编号</van-button>
	</div>
</template>

<script>
export default {
  props: {
    reminder: Boolean
  }
};
</script>
