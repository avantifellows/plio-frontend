<template>
  <div class="flex flex-col space-y-8 items-center">
    <!-- 404 -->
    <div v-if="isError404" class="w-full mt-16 flex flex-col space-y-4 items-center">
      <inline-svg
        :src="getImageSource('exclamation-circle-solid.svg')"
        class="w-12 h-12 text-yellow-600 fill-current"
      ></inline-svg>
      <p class="text-2xl align-middle">
        {{ $t("error.404.title") }}
      </p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        {{ $t("error.404.description") }}
      </p>
    </div>
    <!-- 403 -->
    <div v-if="isError403" class="w-full mt-16 flex flex-col space-y-4 items-center">
      <inline-svg
        :src="getImageSource('lock.svg')"
        class="w-12 h-12 text-yellow-600 fill-current"
      ></inline-svg>
      <p class="text-2xl text-center">{{ $t("error.403.title") }}</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        {{ $t("error.403.description") }}
      </p>
    </div>
    <!-- go to home -->
    <icon-button
      :titleConfig="homeButtonTitleConfig"
      :iconConfig="homeIconConfig"
      :buttonClass="homeButtonClass"
      @click="returnToHome"
      data-test="homeButton"
    ></icon-button>
  </div>
</template>

<script>
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  props: {
    type: {
      type: String,
      default: "404",
    },
  },
  components: {
    IconButton,
  },
  data() {
    return {
      homeIconConfig: {
        // config for the icon of the home button
        enabled: true,
        iconName: "home",
        iconClass: "text-yellow-800 fill-current h-4 w-4",
      },
      // classes for the back button
      homeButtonClass:
        "p-4 w-1/2 sm:w-1/4 bg-peach hover:bg-peach-hover rounded-md shadow-lg ring-primary",
    };
  },
  computed: {
    /** whether the error type is 404 */
    isError404() {
      return this.type === "404";
    },
    /** whether the error type is 403 */
    isError403() {
      return this.type === "403";
    },
    /**
     * config for text of home button
     */
    homeButtonTitleConfig() {
      return {
        value: this.$t("error.buttons.home"),
        class: "text-yellow-800 font-bold text-sm bp-420:text-base",
      };
    },
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,
    /**
     * returns the user back to Home
     */
    returnToHome() {
      this.$router.push({ name: "Home" });
    },
  },
};
</script>
