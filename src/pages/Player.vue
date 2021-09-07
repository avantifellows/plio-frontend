<template>
  <div class="bg-gray-200 p-2 lg:p-5">
    <plio :plioId="plioId" :org="org"></plio>
  </div>
</template>

<script>
import Plio from "@/pages/Embeds/Plio";
import UserAPIService from "@/services/API/User.js";
import { mapActions } from "vuex";

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
    // Creating a promise for the third party auth functionality.
    // If the app needs to authenticate via third party, resolve this promise only when all tasks are done
    // and the authenticated user is set.
    // If the app does not need third party auth, resolve the promise instantly.
    // All the remaining code will run only when this promise is resolved.
    // let thirdPartyAuthPromiseResolve;
    // let thirdPartyAuthPromise = new Promise((resolve) => {
    //   thirdPartyAuthPromiseResolve = resolve;
    // });

    // if (this.isThirdPartyAuth) {
    //   // convert the third party token into Plio's internal token
    //   // and set the user accordingly
    //   UserAPIService.generateExternalAuthToken({
    //     unique_id: this.thirdPartyUniqueId,
    //     api_key: this.thirdPartyApiKey,
    //   })
    //     .then(async (response) => {
    //       await this.setAccessToken(response.data);
    //       await this.setActiveWorkspace(this.org);
    //       thirdPartyAuthPromiseResolve();
    //     })
    //     .catch((error) => {
    //       // if there's some error in the query params,
    //       // reload the page and remove the auth query params
    //       // if the user is authenticated -- they will be able to see the plio
    //       // if the user is not -- they will be asked to log in and then see the plio
    //       if (error.response.status === 400) {
    //         this.$router.replace({
    //           name: "Player",
    //           params: {
    //             org: this.org,
    //             plioId: this.plioId,
    //           },
    //         });
    //         thirdPartyAuthPromiseResolve();
    //       }
    //     });
    // } else thirdPartyAuthPromiseResolve();

    // // wait for the third party auth process to complete and then proceed
    // await thirdPartyAuthPromise;

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

    // load plio details
    await this.fetchPlioCreateSession();
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
    isThirdPartyAuth() {
      // if the app needs to authenticate using a third party auth or not
      return this.thirdPartyUniqueId != null && this.thirdPartyApiKey != null;
    },
  },
  methods: {
    ...mapActions("auth", ["setAccessToken", "setActiveWorkspace"]),
  },
};
</script>
