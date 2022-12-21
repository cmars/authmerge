<script lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import AddWish from './components/AddWish.vue';
import Giftpool from './components/Giftpool.vue';

export default {
  name: 'giftpool',
  components: {
    Giftpool,
    AddWish,
  },
  data() {
    return {
      wishlist: [
        {
          id: 0,
          title: 'Red Ryder BB Gun',
        },
        {
          id: 1,
          title: 'Football',
        },
      ],
    };
  },
  mounted(){
    const maybeWishlistJSON = localStorage.getItem('wishlist');
    if (maybeWishlistJSON) {
      this.wishlist = JSON.parse(maybeWishlistJSON);
    }
  },
  methods: {
    addWishMethod(newWish: any) {
      this.wishlist = [...this.wishlist, newWish];
    },
  },
  watch: {
    wishlist: {
      handler() {
        console.log('wishlist changed!');
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      },
    },
  },
};
</script>

<template>
  <div id="app">
    <a href="/" target="_blank">
      <img src="./assets/giftpool.png" class="logo" alt="Giftpool logo" />
    </a>
    <h1>My Gift Wishlist</h1>
    <AddWish v-on:add-wish-event="addWishMethod" />
    <Giftpool v-bind:wishlist="wishlist" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ccc;
  margin-top: 40px;
}
</style>
