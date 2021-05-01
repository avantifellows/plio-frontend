import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";
import sync from "./modules/sync";
import SecureLS from "secure-ls";

// encrypt and decrypt the localStorage
// github.com/robinvdvleuten/vuex-persistedstate#encrypted-local-storage
var localStorage = new SecureLS({ isCompression: false });

export default createStore({
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
  modules: {
    plioItems,
    auth,
    sync,
  },
});
