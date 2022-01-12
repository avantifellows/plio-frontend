<template>
  <div
    class="bg-white fixed w-3/4 bp-500:w-1/2 lg:w-1/3 z-10 shadow-lg rounded-md pb-4"
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

    <p v-if="isTitlePresent" class="p-2 px-6 text-lg font-bold" data-test="title">
      {{ title }}
    </p>

    <hr />

    <div>
      <ul
        tabindex="-1"
        role="listbox"
        class="text-base overflow-auto focus:outline-none sm:text-sm max-h-48"
        data-test="options"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 select-none relative p-2 px-6 hover:bg-primary hover:cursor-pointer hover:text-white"
          @click="setOption(optionIndex)"
          :data-test="`option-${optionIndex}`"
        >
          <div class="flex space-x-4 items-center">
            <!-- option text -->
            <p class="text-base w-full" data-test="label">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- info on receiving data from embeds -->
    <div class="px-6 p-2 mt-4" v-if="isInfoPresent" data-test="info">
      <div class="w-full p-2 rounded-md border border-yellow-400 flex flex-row space-x-4">
        <!-- icon -->
        <inline-svg
          :src="getImageSource('exclamation-circle-solid.svg')"
          class="w-8 h-8 sm:w-6 sm:h-6 text-yellow-600 fill-current place-self-center transform rotate-180"
        ></inline-svg>
        <!-- text -->
        <p class="text-xs sm:text-sm text-yellow-600" data-test="infoText">
          {{ info }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import Utilities from "@/services/Functional/Utilities.js";

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
    info: {
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
    ...Utilities,
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
      return this.title != undefined && this.title != "";
    },
    isInfoPresent() {
      return this.info != undefined && this.title != "";
    },
  },
  emits: ["select", "close"],
};
</script>
