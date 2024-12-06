import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
// import createUsersWebSocket from "./plugins/usersWebSocketPlugin";
import auth from "./modules/auth";
import generic from "./modules/generic";
import sync from "./modules/sync";
import dialog from "./modules/dialog";
import selectors from "./modules/selectors";

// encrypt and decrypt the localStorage
// github.com/robinvdvleuten/vuex-persistedstate#encrypted-local-storage
let localStorage = new SecureLS({ isCompression: false });

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
    // createUsersWebSocket(),
  ],
  modules: {
    auth,
    generic,
    sync,
    dialog,
    selectors,
  },
});
