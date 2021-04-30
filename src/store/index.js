import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import createUsersWebSocket from "./plugins/usersWebSocketPlugin";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";
import sync from "./modules/sync";

export default createStore({
  plugins: [createPersistedState(), createUsersWebSocket()],
  modules: {
    plioItems,
    auth,
    sync,
  },
});
