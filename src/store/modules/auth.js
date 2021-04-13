import UserService from "@/services/API/User.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
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
    commit("startLoading");
    return new Promise((resolve) => {
      localStorage.setItem("configs", creds.configs);
      commit("stopLoading");
      commit("saveConfigs");
      resolve();
    });
  },
  startLoading({ commit }) {
    commit("startLoading");
  },
  stopLoading({ commit }) {
    commit("stopLoading");
  },
  startUploading({ commit }) {
    commit("startUploading");
  },
  stopUploading({ commit }) {
    commit("stopUploading");
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
  saveConfigs(state) {
    state.configs = localStorage.getItem("configs");
  },
  startLoading(state) {
    state.pending = true;
  },
  stopLoading(state) {
    state.pending = false;
  },
  startUploading(state) {
    state.uploading = true;
  },
  stopUploading(state) {
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
