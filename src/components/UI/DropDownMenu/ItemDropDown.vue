<template>
  <Dropdown
    v-model="localSelectedItemIndex"
    :options="optionsList"
    optionLabel="label"
    optionValue="index"
  >
  </Dropdown>
</template>

<script>
import Dropdown from "primevue/dropdown";

export default {
  name: "ItemDropDown",
  components: {
    Dropdown,
  },
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
