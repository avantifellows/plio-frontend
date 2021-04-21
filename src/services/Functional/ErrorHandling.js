import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  handleAPIErrors(error) {
    if (!error.response) {
      toast.error("Please check your internet connection.");
    }
  },
};
