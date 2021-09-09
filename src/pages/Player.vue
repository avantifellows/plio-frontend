<template>
  <div>
    <!-- plio -->
    <plio
      :plioId="plioId"
      :org="org"
      :thirdPartyUniqueId="thirdPartyUniqueId"
      :thirdPartyApiKey="thirdPartyApiKey"
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

    // TODO: this is not currently add to the session
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
};
</script>
