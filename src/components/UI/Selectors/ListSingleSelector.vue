<template>
  <div class="bg-white fixed z-10 shadow-2xl rounded-md pb-4" :class="mainContainerClass">
    <div class="w-full flex justify-end" v-if="isCloseButtonShown">
      <!-- close button -->
      <icon-button
        :iconConfig="closeDialogIconConfig"
        :buttonClass="closeDialogButtonClass"
        @click="closeSharePlioDialog"
        data-test="close"
      ></icon-button>
    </div>

    <p v-if="isHeadingPresent" class="p-2 px-6 text-lg font-bold" data-test="heading">
      {{ heading }}
    </p>

    <hr v-if="isHeadingPresent" />

    <div>
      <ul
        tabindex="-1"
        role="listbox"
        class="text-base overflow-auto focus:outline-none sm:text-sm"
        :class="optionsContainerClass"
        data-test="options"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 select-none relative hover:cursor-pointer"
          :class="option.class || ''"
          @click="setOption(optionIndex)"
          :data-test="`option-${optionIndex}`"
        >
          <div class="flex space-x-4 items-center">
            <p v-if="isOptionTypeText(option)" class="text-base w-full" data-test="value">
              {{ option.data }}
            </p>

            <CompoundListItem
              v-if="isOptionTypeCompoundListItem(option)"
              :title="option.data.title"
              :description="option.data.description"
              :imageConfig="option.data.imageConfig"
              class="text-base w-full"
              data-test="value"
            ></CompoundListItem>
          </div>
        </li>
      </ul>
    </div>

    <!-- any optional info regarding the list -->
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
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import CompoundListItem from "@/components/Collections/ListItems/CompoundListItem.vue";

export default {
  name: "ListSingleSelector",
  components: {
    IconButton,
    CompoundListItem,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
    heading: {
      type: String,
      default: "",
    },
    info: {
      type: String,
      default: "",
    },
    isCloseButtonShown: {
      type: Boolean,
      default: true,
    },
    optionsContainerClass: {
      type: String,
      default: "",
    },
    containerClass: {
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
      closeDialogButtonClass: "bg-white w-4 h-4 lg:w-6 lg:h-6 m-1 lg:m-2",
    };
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,
    isOptionTypeText(option) {
      return option.type == "text";
    },
    isOptionTypeCompoundListItem(option) {
      return option.type == "CompoundListItem";
    },
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
    mainContainerClass() {
      return [{ "pt-4": !this.isHeadingPresent }, this.containerClass];
    },
    isHeadingPresent() {
      return this.heading != undefined && this.heading != "";
    },
    isInfoPresent() {
      return this.info != undefined && this.info != "";
    },
  },
  emits: ["select", "close"],
};
</script>

<style scoped>
li.menu-item:not(:last-child) {
  margin-bottom: 3px;
}
</style>
