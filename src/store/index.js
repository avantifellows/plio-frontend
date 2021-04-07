import { Store } from "vuex";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";

export default new Store({
  modules: {
    plioItems,
    auth,
  },
});
