import router from "@/router";
import store from "@/store";

export default {
  handleAPIErrors(error) {
    if (
      error != undefined &&
      "response" in error &&
      error.response != undefined
    ) {
      store.dispatch("sync/stopLoading");
      store.dispatch("generic/hideSpinner");
      if (error.response.status === 404) router.replace({ name: "404" });
      else if (error.response.status === 403) router.replace({ name: "403" });
    }
  },
};
