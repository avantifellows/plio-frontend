import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import createUsersWebSocket from "./plugins/usersWebSocketPlugin";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";
import generic from "./modules/generic";
import sync from "./modules/sync";
import SecureLS from "secure-ls";

// encrypt and decrypt the localStorage
// github.com/robinvdvleuten/vuex-persistedstate#encrypted-local-storage
var localStorage = new SecureLS({ isCompression: false });

export default createStore({
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => {
          try {
            return localStorage.get(key);
          } catch (error) {
            console.log(error);
          }
        },
        setItem: (key, value) => localStorage.set(key, value),
        removeItem: (key) => localStorage.remove(key),
      },
    }),
    createUsersWebSocket(),
  ],
  modules: {
    plioItems,
    auth,
    generic,
    sync,
  },
});
