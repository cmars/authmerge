<script lang="ts">
import * as automerge from '@automerge/automerge';
import {markRaw} from 'vue';
import * as localforage from 'localforage';

import AddWish from './components/AddWish.vue';
import Giftpool from './components/Giftpool.vue';
import {GiftPlan} from './types';
import {v4} from 'uuid';

/**
 * AppState represents the local application state.
 */
interface AppState {
  // giftplan contains the actual automerge document. It must be marked as raw
  // in Vue 3, otherwise the reactivity throws exceptions on internal automerge
  // symbol properties.
  // See https://github.com/vuejs/core/issues/3024 for details.
  giftplan: automerge.Doc<GiftPlan>;

  // localChanges counts the number of local changes made in the browser. It's
  // used purely as a surrogate for reacting to changes in the automerge
  // document, which doesn't play nice with Vue 3 reactivity.
  localChanges: number;

  actorId: string;
}

export default {
  name: 'giftpool',
  components: {
    Giftpool,
    AddWish,
  },
  data(): AppState {
    return {
      localChanges: 0,
      actorId: v4(),
      giftplan: markRaw(
        automerge.from({
          wishlist: [],
          messages: [],
        })
      ),
    };
  },
  async mounted() {
    const bin: Uint8Array | null = await localforage.getItem('giftplan');
    if (bin) {
      this.giftplan = markRaw(automerge.load(bin));
    }

    const actorId: string | null = await localforage.getItem('actorId');
    if (actorId) {
      this.actorId = actorId;
    } else {
      this.actorId = v4();
      await localforage.setItem('actorId', this.actorId);
    }
  },
  methods: {
    addWishMethod(newWish: any) {
      this.giftplan = markRaw(
        automerge.change(this.giftplan, doc => {
          doc.wishlist.push(newWish);
        })
      );
      this.localChanges++;
    },
  },
  watch: {
    revision: {
      handler() {
        localforage.setItem('giftplan', automerge.save(this.giftplan));
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
    <Giftpool v-bind:wishlist="giftplan.wishlist" />
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
