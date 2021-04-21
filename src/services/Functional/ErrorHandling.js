import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  handleAPIErrors(error) {
    if (!error.response) {
      // https://github.com/axios/axios/issues/383
      toast.error("Please check your internet connection.");
    }
  },
};
