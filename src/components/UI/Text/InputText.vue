<template>
  <div class="grid grid-cols-1 gap-y-1">
    <div class="flex">
      <p class="text-xs pl-2">{{ title }}</p>
    </div>
    <input
      class="resize-none border rounded-md h-10 pl-4 col-span-1"
      type="text"
      name="placeholder"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  props: {
    placeholder: {
      default: "",
      type: String,
    },
    title: {
      default: "",
      type: String,
    },
  },
};
</script>
