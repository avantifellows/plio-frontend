import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  handleAPIErrors(error) {
    // TODO - Add more types of errors here
    if (error.message == "Network Error")
      toast.error("A network error occurred.");
  },
};
