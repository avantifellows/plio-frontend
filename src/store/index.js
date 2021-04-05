import { createStore } from "vuex";
import plioItems from "./modules/plioItems";
import auth from "./modules/auth";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGOUT = "LOGOUT";
const CONFIG_SUCCESS = "CONFIG_SUCCESS";
const START_LOADING = "START_LOADING";
const STOP_LOADING = "STOP_LOADING";
const START_UPLOADING = "START_UPLOADING";
const STOP_UPLOADING = "STOP_UPLOADING";

export default createStore({
  state: {
    isLoggedIn: !!localStorage.getItem("phone"),
    userId: localStorage.getItem("phone"),
    configs: localStorage.getItem("configs"),
    pending: false,
    uploading: false,
  },
  mutations: {
    [LOGIN_SUCCESS](state) {
      state.isLoggedIn = true;
      state.userId = localStorage.getItem("phone");
    },
    [LOGOUT](state) {
      state.isLoggedIn = false;
      state.userId = null;
    },
    [CONFIG_SUCCESS](state) {
      state.configs = localStorage.getItem("configs");
    },
    [START_LOADING](state) {
      state.pending = true;
    },
    [STOP_LOADING](state) {
      state.pending = false;
    },
    [START_UPLOADING](state) {
      state.uploading = true;
    },
    [STOP_UPLOADING](state) {
      state.uploading = false;
    },
  },
  actions: {
    login({ commit }, creds) {
      commit(START_LOADING); // show spinner
      return new Promise((resolve) => {
        localStorage.setItem("phone", creds.phone);
        commit(STOP_LOADING);
        commit(LOGIN_SUCCESS);
        resolve();
      });
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        localStorage.removeItem("phone");
        commit(LOGOUT);
        resolve();
      });
    },
    saveConfigs({ commit }, creds) {
      commit(START_LOADING); // show spinner
      return new Promise((resolve) => {
        localStorage.setItem("configs", creds.configs);
        commit(STOP_LOADING);
        commit(CONFIG_SUCCESS);
        resolve();
      });
    },
    startLoading({ commit }) {
      commit(START_LOADING);
    },
    stopLoading({ commit }) {
      commit(STOP_LOADING);
    },
    startUploading({ commit }) {
      commit(START_UPLOADING);
    },
    stopUploading({ commit }) {
      commit(STOP_UPLOADING);
    },
  },
  getters: {},
  modules: {
    plioItems,
    auth,
  },
});
