<template>
  <div>
    <form @submit="addWish">
      <input
        type="text"
        v-model="title"
        name="title"
        placeholder="Add wish..."
      />
      <input type="submit" value="Submit" class="btn" />
    </form>
  </div>
</template>

<script lang="ts">
import {v4} from 'uuid';

export default {
  name: 'AddWish',
  data() {
    return {
      title: '',
    };
  },
  methods: {
    addWish(event: any) {
      if (event) {
        event.preventDefault();
      }
      const newWish = {
        title: this.title,
        id: v4(),
      };

      this.$emit('add-wish-event', newWish);
      this.title = '';
    },
  },
};
</script>
