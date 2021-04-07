<template>
  <div class="text-white">akkkkkkkkkkka</div>
</template>

<script>
export default {
  props: {
    itemList: {
      // list of items
      default: () => {},
      type: Array,
    },
    selectedItemIndex: {
      // index of the selected item
      default: 0,
      type: Number,
    },
  },
};
</script>
