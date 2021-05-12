import UserAPIService from "@/services/API/User.js";
import AnalyticsAPIService from "@/services/API/Analytics.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const state = {
  accessToken: null,
  config: null,
  user: null,
  activeWorkspace: "",
  userId: null,
  isReAuthenticating: false,
  reAuthenticationPromise: null,
  analyticsAccessToken: null,
};

const getters = {
  isAuthenticated: (state) => !!state.accessToken,
  locale: (state) => state.config.locale,
  isUserApproved: (state) =>
    state.user != null && state.user.status == "approved",
  activeWorkspaceSchema: (state) => {
    let activeOrganizationSchema = "public";
    if (state.activeWorkspace != "") {
      let activeOrganization = state.user.organizations.find((organization) => {
        return organization.shortcode == state.activeWorkspace;
      });
      activeOrganizationSchema = activeOrganization.schema_name;
    }
    return activeOrganizationSchema;
  },
};

const actions = {
  async setAccessToken({ commit, dispatch }, accessToken) {
    await commit("setAccessToken", accessToken);
    await dispatch("fetchAndUpdateUser");
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
  async saveConfig({ commit }, config) {
    await commit("saveConfig", config);
  },
  setReAuthenticationState({ commit }, isReAuthenticating) {
    commit("setReAuthenticationState", isReAuthenticating);
  },
  setReAuthenticationPromise({ commit }, reAuthenticationPromise) {
    commit("setReAuthenticationPromise", reAuthenticationPromise);
  },
  unsetReAuthenticationPromise({ commit }) {
    commit("unsetReAuthenticationPromise");
  },
  updateUserStatus({ commit }, status) {
    commit("updateUserStatus", status);
  },
  async fetchAndUpdateUser({ dispatch, state }) {
    await UserAPIService.getUserByAccessToken(
      state.accessToken.access_token
    ).then((response) => dispatch("setUser", response.data));
  },
  async getAnalyticsAccessToken({ commit }) {
    await AnalyticsAPIService.getAnalyticsAccessToken().then((response) =>
      commit("setAnalyticsAccessToken", response.data)
    );
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
  saveConfig(state, config) {
    state.config = config;
  },
  setReAuthenticationState(state, isReAuthenticating) {
    state.isReAuthenticating = isReAuthenticating;
  },
  setReAuthenticationPromise(state, reAuthenticationPromise) {
    state.reAuthenticationPromise = reAuthenticationPromise;
  },
  unsetReAuthenticationPromise(state) {
    state.reAuthenticationPromise = null;
  },
  updateUserStatus(state, status) {
    state.user.status = status;
  },
  setAnalyticsAccessToken(state, accessToken) {
    state.analyticsAccessToken = accessToken.access_token;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
