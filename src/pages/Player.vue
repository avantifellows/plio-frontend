<template>
  <div class="flex relative">
    <!-- plio -->
    <plio
      :plioId="plioId"
      :workspace="workspace"
      :thirdPartyUniqueId="thirdPartyUniqueId"
      :thirdPartyApiKey="thirdPartyApiKey"
      class="w-full"
      @loaded="plioLoaded"
      @item-toggle="itemVisibilityToggled"
      ref="plio"
    ></plio>
  </div>
</template>

<script>
import Plio from "@/pages/Embeds/Plio";

export default {
  components: {
    Plio,
  },
  data() {
    return {
      source: "unknown", // source from where the plio was accessed - can be passed as param in the plio url
      isPlioLoaded: false, // whether plio has been loaded
      isItemShown: false, // whether an item is being shown
    };
  },
  async created() {
    // mixpanel user interaction logging
    this.$mixpanel.people.set_once({
      "First Plio Viewed": new Date().toISOString(),
    });
    this.$mixpanel.people.set({
      "Last Plio Viewed": new Date().toISOString(),
    });

    // TODO: this is currently not added to the session
    // update source for the plio
    if (this.$route != undefined && this.$route.query.src) {
      this.source = this.$route.query.src;
    }
  },
  props: {
    plioId: {
      default: "",
      type: String,
    },
    workspace: {
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
  methods: {
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
