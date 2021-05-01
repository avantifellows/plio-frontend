import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import createUsersWebSocket from "./plugins/usersWebSocketPlugin";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";
import sync from "./modules/sync";
import SecureLS from "secure-ls";

// encrypt and decrypt the localStorage
// github.com/robinvdvleuten/vuex-persistedstate#encrypted-local-storage
var ls = new SecureLS({ isCompression: false });

export default createStore({
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
    createUsersWebSocket(),
  ],
  modules: {
    plioItems,
    auth,
    sync,
  },
});
