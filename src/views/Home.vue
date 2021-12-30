<template>
    <div class="home">
		

		<div class="list">
			物流列表
		</div>
	</div>
</template>

<script lang="ts">
	import { Component, Vue } from "vue-property-decorator";

	import { getMapConfigJson , loginFun } from '@/utils/api';

	@Component({
		components: {

		},
	})
	export default class Home extends Vue {

		async mounted(){
			console.log("页面加载完毕")

		}
		
	}
</script>

<style lang="less" scoped>

</style>>
