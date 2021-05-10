import { useToast } from "vue-toastification";
import i18n from "@/services/Localisation/i18n.js";

const toast = useToast();

export default {
  handleAPIErrors(error) {
    if (!error.response) {
      toast.error(i18n.global.t("error.internet"));
    }
  },
};
