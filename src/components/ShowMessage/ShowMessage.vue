<template>
  <div class="errorPage">
    <van-empty image="error" :description="message" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Empty } from 'vant';

export default {
  name: "ShowError",
  components: {
    [Empty.name]: Empty, // 正确注册Vant组件的方式
  },
  props: {
    type: String,
    title: String,
    code: String,
    message: String,
  },
  setup(props) {
    // 使用Composition API的setup函数
    // 如果需要响应式数据或生命周期钩子，可以在这里定义
    
    onMounted(() => {
      console.log("组件中title：", props.title);
      console.log("组件中type：", props.type);
      console.log("组件中code：", props.code);
      console.log("组件中msg：", props.message);
    });

    // 注意：这里没有返回值，因为我们没有需要暴露给模板的额外响应式属性
  },
};
</script>

<style scoped>
</style>