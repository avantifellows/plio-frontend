<template>
  <button
    type="button"
    class="h-8 w-8 py-2 px-2 flex justify-center items-center bg-primary-button hover:bg-primary-button-hover transition ease-in duration-200 text-center text-base font-semibold shadow-lg focus:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2"
  >
    <inline-svg
      v-if="localIconConfig.enabled"
      :src="icon"
      class="h-5 w-2.5"
      :class="localIconConfig.iconClass"
    ></inline-svg>
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
  },
  computed: {
    iconName() {
      return this.localIconConfig.iconName;
    },
    icon() {
      return require("@/assets/images/" + this.iconName + ".svg");
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
  },
};
</script>
