<template>
  <div>
    <select
      v-model="localSelectedItemIndex"
      class="border border-gray-300 rounded-xl bg-primary-button text-white px-2 shadow-lg focus:outline-none focus:ring-1 focus:ring-white font-bold text-md py-1"
    >
      <option
        v-for="(option, optionIndex) in optionsList"
        :value="option.value"
        :key="optionIndex"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "ItemDropDown",
  props: {
    optionsList: {
      default: () => [],
      type: Array,
    },
    selectedItemIndex: {
      default: 0,
      type: Number,
    },
  },
  computed: {
    localSelectedItemIndex: {
      get() {
        return this.selectedItemIndex;
      },
      set(localSelectedItemIndex) {
        this.$emit("update:selectedItemIndex", localSelectedItemIndex);
      },
    },
  },
  emits: ["update:selectedItemIndex"],
};
</script>
