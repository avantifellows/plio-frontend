import UserAPIService from "@/services/API/User.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const state = {
  accessToken: null,
  config: localStorage.getItem("config"),
  user: null,
  activeWorkspace: "",
  userId: null,
};

const getters = {
  isAuthenticated: (state) => !!state.accessToken,
  locale: (state) => state.config.locale,
};

const actions = {
  async setAccessToken({ commit, dispatch }, accessToken) {
    await commit("setAccessToken", accessToken);
    await UserAPIService.getUserByAccessToken(accessToken.access_token).then(
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
  async setActiveWorkspace({ commit }, activeWorkspace) {
    await commit("setActiveWorkspace", activeWorkspace);
  },
  async unsetActiveWorkspace({ commit }) {
    await commit("unsetActiveWorkspace");
  },

  saveConfig({ commit, dispatch }, config) {
    dispatch("sync/startLoading", null, { root: true });
    return new Promise((resolve) => {
      localStorage.setItem("config", config);
      dispatch("sync/stopLoading", null, { root: true });
      commit("saveConfig");
      resolve();
    });
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
  setActiveWorkspace(state, activeWorkspace) {
    state.activeWorkspace = activeWorkspace;
  },
  unsetActiveWorkspace(state) {
    state.activeWorkspace = "";
  },
  saveConfig(state) {
    state.config = localStorage.getItem("config");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
