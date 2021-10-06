<template>
  <div class="border shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-64 m-auto">
    <div class="w-full h-full text-center">
      <div class="flex h-full flex-col justify-between">
        <!-- icon -->
        <inline-svg
          v-if="isIconEnabled"
          :src="icon"
          class="place-self-center"
          :class="iconClass"
          data-test="icon"
        ></inline-svg>
        <!-- title -->
        <p
          class="text-gray-800 dark:text-gray-200 text-xl font-bold mt-4"
          v-if="showTitle"
          data-test="title"
        >
          {{ title }}
        </p>
        <!-- description -->
        <p
          class="text-gray-600 dark:text-gray-400 text-sm py-2 px-6"
          v-if="showDescription"
          data-test="description"
        >
          {{ description }}
        </p>
        <div
          v-if="isButtonVisible"
          class="flex items-center justify-between space-x-4 w-full mt-2"
        >
          <button
            v-if="isConfirmButtonEnabled"
            type="button"
            class="py-2 px-4 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg"
            :class="confirmButtonClass"
            @click="confirmClicked"
            data-test="confirmButton"
          >
            {{ confirmButtonText }}
          </button>
          <button
            v-if="isCancelButtonEnabled"
            type="button"
            class="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg"
            :class="cancelButtonClass"
            @click="cancelClicked"
            data-test="cancelButton"
          >
            {{ cancelButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    iconConfig: {
      // config for the icon in the alert box
      default: () => {
        return {
          enabled: false,
          name: "check",
          class: "w-12 h-12",
        };
      },
      type: Object,
    },
    title: {
      // title of the alert
      default: "",
      type: String,
    },
    description: {
      // description of the alert
      default: "",
      type: String,
    },
    confirmButtonConfig: {
      // config for the confirmation button
      default: () => {
        return {
          enabled: true,
          text: "Yes",
          class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
        };
      },
      type: Object,
    },
    cancelButtonConfig: {
      // config for the cancel button
      default: () => {
        return {
          enabled: true,
          text: "No",
          class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
        };
      },
      type: Object,
    },
  },
  computed: {
    isConfirmButtonEnabled() {
      // to show the confirm button or not
      return this.confirmButtonConfig.enabled;
    },
    isCancelButtonEnabled() {
      // to show the cancel button or not
      return this.cancelButtonConfig.enabled;
    },
    isButtonVisible() {
      // is either of the confirm or cancel buttons visible
      // the only way to hide each of those two buttons is by
      // adding the `hidden` class to each of those button classes
      if (this.confirmButtonClass == undefined || this.cancelButtonClass == undefined)
        return false;
      return (
        this.confirmButtonClass.indexOf("hidden") == -1 &&
        this.cancelButtonClass.indexOf("hidden") == -1
      );
    },
    showTitle() {
      // whether to show title
      return this.title != null && this.title != "";
    },
    showDescription() {
      // whether to show description
      return this.description != null && this.description != "";
    },
    confirmButtonText() {
      // text of the confirm button
      return this.confirmButtonConfig["text"];
    },
    confirmButtonClass() {
      // class for the confirm button
      return this.confirmButtonConfig["class"];
    },
    cancelButtonText() {
      // text of the cancel button
      return this.cancelButtonConfig["text"];
    },
    cancelButtonClass() {
      // class for the cancel button
      return this.cancelButtonConfig["class"];
    },
    isIconEnabled() {
      // whether icon is to be shown
      return this.iconConfig["enabled"];
    },
    iconName() {
      // name of the icon image file under assets/images
      return this.iconConfig.name;
    },
    icon() {
      // imports and returns the icon
      return require("@/assets/images/" + this.iconName + ".svg");
    },
    iconClass() {
      // class for the icon of the dialog box
      return this.iconConfig["class"];
    },
  },
  methods: {
    confirmClicked() {
      // invoked when the confirm button is clicked
      this.$emit("confirm");
    },
    cancelClicked() {
      // invoked when the cancel button is clicked
      this.$emit("cancel");
    },
  },
  emits: ["confirm", "cancel"],
};
</script>
