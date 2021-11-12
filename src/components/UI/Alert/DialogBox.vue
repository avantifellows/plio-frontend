<template>
  <div
    class="border shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-64 m-auto"
    :class="containerClass"
  >
    <div class="flex relative">
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
      <!-- close button -->
      <div class="w-full absolute flex justify-end" v-if="isCloseButtonShown">
        <icon-button
          :iconConfig="closeIconConfig"
          :buttonClass="closeButtonClass"
          @click="close"
          data-test="closeButton"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  components: {
    IconButton,
  },
  data() {
    return {
      // config for the icon of the button to close the dialog box
      closeIconConfig: {
        enabled: true,
        iconName: "times-circle-white",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the button to close the dialog box
      closeButtonClass: "w-10 h-10 -mr-4 -mt-6",
    };
  },
  props: {
    iconConfig: {
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
      default: "",
      type: String,
    },
    description: {
      default: "",
      type: String,
    },
    confirmButtonConfig: {
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
      default: () => {
        return {
          enabled: true,
          text: "No",
          class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
        };
      },
      type: Object,
    },
    isCloseButtonShown: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    /** whether to show the confirm button */
    isConfirmButtonEnabled() {
      return this.confirmButtonConfig.enabled;
    },
    /** whether to show the cancel button */
    isCancelButtonEnabled() {
      return this.cancelButtonConfig.enabled;
    },
    /**
     * whether either of the confirm or cancel buttons visible
     * the only way to hide each of those two buttons is by
     * adding the `hidden` class to each of those button classes
     */
    isButtonVisible() {
      if (this.confirmButtonClass == undefined || this.cancelButtonClass == undefined)
        return false;
      return (
        this.confirmButtonClass.indexOf("hidden") == -1 &&
        this.cancelButtonClass.indexOf("hidden") == -1
      );
    },
    /** classes for the container of the dialog box */
    containerClass() {
      return {
        "pt-6": this.isCloseButtonShown,
      };
    },
    /** whether to show title */
    showTitle() {
      return this.title != null && this.title != "";
    },
    /** whether to show description */
    showDescription() {
      return this.description != null && this.description != "";
    },
    /** text of the confirm button */
    confirmButtonText() {
      return this.confirmButtonConfig["text"];
    },
    /** class for the confirm button */
    confirmButtonClass() {
      return this.confirmButtonConfig["class"];
    },
    /** text of the cancel button */
    cancelButtonText() {
      return this.cancelButtonConfig["text"];
    },
    /** class for the cancel button */
    cancelButtonClass() {
      return this.cancelButtonConfig["class"];
    },
    /** whether icon is to be shown */
    isIconEnabled() {
      return this.iconConfig["enabled"];
    },
    /** name of the icon image file under assets/images */
    iconName() {
      return this.iconConfig.name;
    },
    /** imports and returns the icon */
    icon() {
      return require("@/assets/images/" + this.iconName + ".svg");
    },
    /** class for the icon of the dialog box */
    iconClass() {
      return this.iconConfig["class"];
    },
  },
  methods: {
    /** emits that the confirm button has been clicked */
    confirmClicked() {
      this.$emit("confirm");
    },
    /** emits that the cancel button has been clicked */
    cancelClicked() {
      this.$emit("cancel");
    },
    /** emits that the dialog box should be closed */
    close() {
      this.$emit("close");
    },
  },
  emits: ["confirm", "cancel", "close"],
};
</script>
