import UserService from "@/services/API/User.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const CONFIG_SUCCESS = "CONFIG_SUCCESS";
const START_LOADING = "START_LOADING";
const STOP_LOADING = "STOP_LOADING";
const START_UPLOADING = "START_UPLOADING";
const STOP_UPLOADING = "STOP_UPLOADING";

const state = {
  accessToken: null,
  configs: localStorage.getItem("configs"),
  pending: false,
  uploading: false,
  user: null,
  userId: null,
};

const getters = {
  isAuthenticated: (state) => !!state.accessToken,
};

const actions = {
  async setAccessToken({ commit, dispatch }, accessToken) {
    await commit("setAccessToken", accessToken);
    await UserService.getUserByAccessToken(accessToken.access_token).then(
      (response) => {
        dispatch("setUser", response.data);
      }
    );
  },
  async unsetAccessToken({ commit, dispatch }) {
    await commit("unsetAccessToken");
    dispatch("unsetUser");
  },
  async setUser({ commit }, user) {
    await commit("setUser", user);
  },
  async unsetUser({ commit }) {
    await commit("unsetUser");
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
};

const mutations = {
  setAccessToken(state, accessToken) {
    state.accessToken = accessToken;
  },
  unsetAccessToken(state) {
    state.accessToken = null;
  },
  setUser(state, user) {
    state.user = user;
    state.userId = user.id;
  },
  unsetUser(state) {
    state.user = null;
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
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
