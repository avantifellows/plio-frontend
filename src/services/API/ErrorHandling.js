import router from "@/router";

export default {
  handleAPIErrors(error) {
    if (
      error != undefined &&
      "response" in error &&
      error.response != undefined
    ) {
      if (error.response.status === 404) router.replace({ name: "404" });
      else if (error.response.status === 403) router.replace({ name: "403" });
    }
  },
};
