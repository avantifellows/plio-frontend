import UserAPIService from "@/services/API/User.js";
import AnalyticsAPIService from "@/services/API/Analytics.js";

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const state = {
  accessToken: null,
  config: null,
  user: null,
  activeWorkspace: "",
  userId: null,
  reAuthenticationState: "not-started",
  reAuthenticationPromise: null,
  reAuthenticationPromiseResolver: null,
  analyticsAccessToken: null,
  analyticsAccessTokenFetchTime: null,
  analyticsAccessTokenExpiryTime: null,
};

const getters = {
  isAuthenticated: (state) => !!state.accessToken,
  isRefreshTokenPresent: (state) => {
    return state.accessToken != null && state.accessToken.refresh_token != null;
  },
  locale: (state) => {
    let configValue = JSON.parse(state.config);
    if (configValue != null) return configValue.locale;
    return null;
  },

  isPersonalWorkspace: (state) => {
    // whether the current workspace is the personal workspace
    return state.activeWorkspace == "";
  },
  activeOrganization: (state) => {
    // gets the current active organization
    if (state.activeWorkspace != "") {
      let userOrganizations = state.user ? state.user.organizations : [];
      return userOrganizations.find((organization) => {
        return organization.shortcode == state.activeWorkspace;
      });
    }
    // returns some default values for personal workspace
    return {
      schema_name: "public",
      api_key: "",
    };
  },
  activeWorkspaceSchema: (_, getters) => {
    // schema of the current workspace
    return getters.activeOrganization.schema_name;
  },
  activeWorkspaceApiKey: (_, getters) => {
    // api key of the current workspace
    return getters.activeOrganization.api_key;
  },
  isAnalyticsAccessTokenValid: (state) => {
    if (state.analyticsAccessToken === null) return false;
    let currentTimeString = new Date().toString();
    const timeDifference =
      (Date.parse(currentTimeString) -
        Date.parse(state.analyticsAccessTokenFetchTime)) /
      1000;
    // return false if the token has expired
    if (timeDifference > state.analyticsAccessTokenExpiryTime) return false;
    return true;
  },
};

const actions = {
  async setAccessToken({ commit, dispatch }, accessToken) {
    commit("setAccessToken", accessToken);
    await dispatch("fetchAndUpdateUser");
  },
  unsetAccessToken({ commit, dispatch }) {
    commit("unsetAccessToken");
    dispatch("unsetUser");
    dispatch("unsetAnalyticsAccessToken");
  },
  setUser({ commit }, user) {
    commit("setUser", user);
  },
  unsetUser({ commit }) {
    commit("unsetUser");
  },
  setActiveWorkspace({ commit }, activeWorkspace) {
    commit("setActiveWorkspace", activeWorkspace);
  },
  unsetActiveWorkspace({ commit }) {
    commit("unsetActiveWorkspace");
  },
  saveConfig({ commit }, config) {
    commit("saveConfig", config);
  },
  setReAuthenticationState({ commit }, state) {
    commit("setReAuthenticationState", state);
  },
  setReAuthenticationPromise({ commit }, promise) {
    commit("setReAuthenticationPromise", promise);
  },
  setReAuthenticationPromiseResolver({ commit }, resolver) {
    commit("setReAuthenticationPromiseResolver", resolver);
  },
  updateUserStatus({ commit }, status) {
    commit("updateUserStatus", status);
  },
  async fetchAndUpdateUser({ dispatch, state }) {
    let response = await UserAPIService.getUserByAccessToken(
      state.accessToken.access_token
    );
    if (response != undefined) dispatch("setUser", response.data);
  },
  async getAnalyticsAccessToken({ commit }) {
    let response = await AnalyticsAPIService.getAnalyticsAccessToken();
    if (response != undefined) commit("setAnalyticsAccessToken", response.data);
  },
  unsetAnalyticsAccessToken({ commit }) {
    commit("unsetAnalyticsAccessToken");
  },
  autoLogoutUser({ dispatch }) {
    dispatch("unsetAccessToken");
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
  setReAuthenticationState(state, reAuthenticationState) {
    state.reAuthenticationState = reAuthenticationState;
  },
  setReAuthenticationPromise(state, promise) {
    state.reAuthenticationPromise = promise;
  },
  setReAuthenticationPromiseResolver(state, resolver) {
    state.reAuthenticationPromiseResolver = resolver;
  },
  updateUserStatus(state, status) {
    state.user.status = status;
  },
  setAnalyticsAccessToken(state, accessToken) {
    state.analyticsAccessToken = accessToken.access_token;
    state.analyticsAccessTokenFetchTime = new Date();
    state.analyticsAccessTokenExpiryTime = accessToken.expires_in;
  },
  unsetAnalyticsAccessToken(state) {
    state.analyticsAccessToken = null;
    state.analyticsAccessTokenFetchTime = null;
    state.analyticsAccessTokenExpiryTime = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
