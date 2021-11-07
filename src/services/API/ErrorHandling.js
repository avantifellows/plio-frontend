import { useToast } from "vue-toastification";
import i18n from "@/services/Localisation/i18n.js";
import router from "@/router";

const toast = useToast();

export default {
  handleAPIErrors(error) {
    if (!error.response && (!this.$route || this.$route.name != "Plio")) {
      // do not show toast for embedded plio
      toast.error(i18n.global.t("error.internet"));
    } else if (error.response.status === 404) router.replace({ name: "404" });
    else if (error.response.status === 403) router.replace({ name: "403" });
  },
};
