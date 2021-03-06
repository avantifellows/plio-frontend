import { useToast } from "vue-toastification";
import i18n from "@/services/Localisation/i18n.js";
import router from "@/router";

const toast = useToast();

export default {
  handleAPIErrors(error) {
    if (!error.response) {
      toast.error(i18n.global.t("error.internet"));
    } else if (error.response.status === 404) router.replace({ name: "404" });
  },
};
