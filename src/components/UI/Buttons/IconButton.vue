<template>
  <button
    type="button"
    :class="buttonClass"
    class="flex justify-center items-center transition ease-in duration-200 text-center text-base font-semibold focus:shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="isDisabled"
  >
    <div
      class="flex w-full justify-center"
      :class="{ 'flex-col': isStackedVertically, 'space-x-2': !isStackedVertically }"
    >
      <inline-svg
        v-if="isIconConfigEnabled"
        :src="icon"
        :class="iconClass"
        class="place-self-center"
      ></inline-svg>
      <p v-if="displayTitle" :class="titleClass">
        {{ title }}
      </p>
    </div>
  </button>
</template>

<script>
export default {
  data() {
    return {
      defaultIconConifg: {
        enabled: false,
        iconName: "spinner-solid",
        iconClass: "stroke-0 text-white white",
      },
      defaultTitleConfig: {
        value: "",
        class: "text-white",
      },
    };
  },
  created() {},
  props: {
    iconConfig: {
      type: Object,
      default: function () {
        return {};
      },
    },
    titleConfig: {
      type: Object,
      default: function () {
        return {};
      },
    },
    buttonClass: {
      type: [String, Object],
      default: () => {},
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    orientation: {
      // whether to stack the icon and title vertically or horizontally
      type: String,
      default: "horizontal",
    },
  },
  computed: {
    isStackedVertically() {
      return this.orientation == "vertical";
    },
    iconName() {
      // name of the icon image file under assets/images
      return this.localIconConfig.iconName;
    },
    icon() {
      // imports and returns the icon
      return require("@/assets/images/" + this.iconName + ".svg");
    },
    iconClass() {
      // class specific to the icon
      return this.localIconConfig.iconClass || "";
    },
    isIconConfigEnabled() {
      // whether icon needs to be shown
      return this.localIconConfig.enabled;
    },
    localIconConfig() {
      // merges the default icon config and the icon config coming
      // as a prop -> places that into "localIconConfig"
      var localCopy = this.iconConfig;
      Object.entries(this.defaultIconConifg).forEach(([key, val]) => {
        if (!(key in localCopy)) {
          localCopy[key] = val;
        }
      });
      return localCopy;
    },
    localTitleConfig() {
      // merges the default title config and the title config coming
      // as a prop -> places that into "localTitleConfig"
      var localCopy = this.titleConfig;
      Object.entries(this.defaultTitleConfig).forEach(([key, val]) => {
        if (!(key in localCopy)) {
          localCopy[key] = val;
        }
      });
      return localCopy;
    },
    title() {
      // title text
      return this.localTitleConfig["value"];
    },
    titleClass() {
      // class specific to the title
      return this.localTitleConfig.class || "";
    },
    displayTitle() {
      // whether the title prop is to be displayed
      return (
        this.localTitleConfig["value"] != null && this.localTitleConfig["value"] != ""
      );
    },
  },
};
</script>
