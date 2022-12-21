<script lang="ts">
export default {
  name: 'Wish',
  props: ['wish']
};
</script>

<template>
  <div>
    <p>{{ wish.title }}</p>
  </div>
</template>
