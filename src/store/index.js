import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";
import sync from "./modules/sync";

export default createStore({
  plugins: [createPersistedState()],
  modules: {
    plioItems,
    auth,
    sync,
  },
});
