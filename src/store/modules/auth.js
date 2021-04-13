import UserService from "@/services/API/User.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const state = {
  accessToken: null,
  configs: localStorage.getItem("configs"),
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
  saveConfigs({ commit, dispatch }, creds) {
    dispatch("sync/startLoading", null, { root: true });
    return new Promise((resolve) => {
      localStorage.setItem("configs", creds.configs);
      dispatch("sync/stopLoading", null, { root: true });
      commit("saveConfigs");
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
  saveConfigs(state) {
    state.configs = localStorage.getItem("configs");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
