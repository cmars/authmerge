<script lang="ts">
import Wish from './Wish.vue';
import AddWish from './AddWish.vue';

export default {
  name: 'Giftpool',
  props: ['wishlist'],
  components: {
    Wish
  }
};
</script>

<template>
  <div>
    <div v-bind:key="wish.id" v-for="wish in wishlist">
        <Wish v-bind:wish="wish"></Wish>
    </div>
  </div>
</template>

<style scoped></style>
