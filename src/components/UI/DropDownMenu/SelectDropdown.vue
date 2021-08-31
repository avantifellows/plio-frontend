<template>
  <div>
    <select
      v-model="localValue"
      class="border border-gray-300 rounded-xl bg-primary-button text-white px-2 shadow-lg focus:outline-none focus:ring-1 focus:ring-white font-bold text-md py-1 appearance-none bg-selectbox-arrow bg-no-repeat bg-10% pr-8 bg-right-10%"
    >
      <option
        v-for="(option, optionIndex) in optionsList"
        :value="option.value"
        :key="optionIndex"
      >
        <p>{{ option.label }}</p>
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "SelectDropdown",
  props: {
    optionsList: {
      default: () => [],
      type: Array,
    },
    value: {
      default: 0,
      type: Number,
    },
  },
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(localValue) {
        this.$emit("update:value", localValue);
      },
    },
  },
  emits: ["update:value"],
};
</script>
