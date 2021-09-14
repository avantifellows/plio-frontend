<template>
  <div class="flex relative">
    <!-- plio -->
    <plio
      :plioId="plioId"
      :org="org"
      :thirdPartyUniqueId="thirdPartyUniqueId"
      :thirdPartyApiKey="thirdPartyApiKey"
      class="w-full"
      @loaded="plioLoaded"
      @item-toggle="itemVisibilityToggled"
    ></plio>

    <!-- back button -->
    <icon-button
      v-if="isPlioLoaded"
      class="absolute"
      :iconConfig="backButtonIconConfig"
      @click="goBack"
    >
    </icon-button>
  </div>
</template>

<script>
import Plio from "@/pages/Embeds/Plio";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  components: {
    Plio,
    IconButton,
  },
  data() {
    return {
      source: "unknown", // source from where the plio was accessed - can be passed as param in the plio url
      isPlioLoaded: false, // whether plio has been loaded
      isItemShown: false, // whether an item is being shown
      previousPage: null, // the last page in the history
    };
  },
  /**
   * set the previous page in history
   */
  beforeRouteEnter(_, from, next) {
    next((vm) => {
      vm.previousPage = from.path;
    });
  },
  async created() {
    // mixpanel user interaction logging
    this.$mixpanel.people.set_once({
      "First Plio Viewed": new Date().toISOString(),
    });
    this.$mixpanel.people.set({
      "Last Plio Viewed": new Date().toISOString(),
    });

    // TODO: this is currently not add to the session
    // update source for the plio
    if (this.$route.query.src) {
      this.source = this.$route.query.src;
    }
  },
  props: {
    plioId: {
      default: "",
      type: String,
    },
    org: {
      default: "",
      type: String,
    },
    thirdPartyUniqueId: {
      default: null,
      type: String,
    },
    thirdPartyApiKey: {
      default: null,
      type: String,
    },
  },
  computed: {
    backButtonIconConfig() {
      // config for the icon of the back button
      return {
        enabled: true,
        iconName: "left",
        iconClass: this.backButtonIconClass,
      };
    },
    backButtonIconClass() {
      return [
        {
          "text-black": this.isItemShown,
          "text-gray-200": !this.isItemShown,
        },
        `fill-current h-8 w-8 m-4 rounded-md`,
      ];
    },
  },
  methods: {
    /**
     * returns the user back to where they came from if the page they came from
     * was one of the pages of Plio; else, redirects them to home
     */
    goBack() {
      // check if the previous page was one of plio
      if (this.previousPage != "/") history.back();
      else this.$router.push({ name: "Home", params: { org: this.org } });
    },
    plioLoaded() {
      // invoked when plio has been loaded
      this.isPlioLoaded = true;
    },
    itemVisibilityToggled(value) {
      // invoked when the visibility of a plio is toggled
      this.isItemShown = value;
    },
  },
};
</script>
