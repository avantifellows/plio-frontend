<template>
  <div
    class="bg-white fixed w-3/4 bp-500:w-1/2 md:w-1/3 z-10 bg-white shadow-lg rounded-md pb-4"
    data-test="optionsContainer"
  >
    <div class="w-full flex justify-end">
      <!-- close button -->
      <icon-button
        :iconConfig="closeDialogIconConfig"
        :buttonClass="closeDialogButtonClass"
        @click="closeSharePlioDialog"
        data-test="close"
      ></icon-button>
    </div>

    <p v-if="isTitlePresent" class="p-2 px-6 text-lg font-bold">{{ title }}</p>

    <hr />

    <div>
      <ul
        tabindex="-1"
        role="listbox"
        class="text-base overflow-auto focus:outline-none sm:text-sm"
        data-test="options"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 select-none relative p-2 px-6 hover:bg-primary hover:cursor-pointer hover:text-white"
          @click="setOption(optionIndex)"
          :data-test="`option-${option.value}`"
        >
          <div class="flex space-x-4 items-center">
            <!-- option text -->
            <p class="text-base w-full" data-test="label">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  name: "ListSingleSelector",
  components: {
    IconButton,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      closeDialogIconConfig: {
        // config for the icon of the close button
        enabled: true,
        iconName: "times-circle-solid",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the close button
      closeDialogButtonClass: "bg-white w-6 h-6 m-2",
    };
  },
  methods: {
    /** emits the details of the option selected */
    setOption(index) {
      this.$emit("select", this.options[index].value);
    },
    /** emits that the close button has been clicked */
    closeSharePlioDialog() {
      this.$emit("close");
    },
  },
  computed: {
    isTitlePresent() {
      return this.title != undefined && this.title != null && this.title != "";
    },
  },
  emits: ["select", "close"],
};
</script>
