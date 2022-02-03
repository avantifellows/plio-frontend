import UserAPIService from "@/services/API/User.js";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";
import Utilities from "@/services/Functional/Utilities.js";

let clonedeep = require("lodash.clonedeep");

// reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const state = {
  accessToken: null,
  config: null,
  user: null,
  activeWorkspace: "",
  userId: null,
  reAuthenticationState: "not-started",
  reAuthenticationPromise: null,
  reAuthenticationPromiseResolver: null,
  userSettings: null,
  workspaceSettings: null,
};

const getters = {
  isAuthenticated: (state) => !!state.userId,
  isRefreshTokenPresent: (state) => {
    return state.accessToken != null && state.accessToken.refresh_token != null;
  },
  locale: (state) => {
    let configValue = JSON.parse(state.config);
    if (configValue != null) return configValue.locale;
    return null;
  },
  /** whether the current workspace is the personal workspace */
  isPersonalWorkspace: (state) => {
    return state.activeWorkspace == "";
  },
  /** list of all workspaces that the user is a part of */
  workspaces: (state) => {
    if (state.user != undefined) return state.user.organizations;
    return [];
  },
  /** whether the current user has workspaces beyond the personal workspace */
  hasWorkspaces: (_, getters) => {
    return getters.workspaces.length > 0;
  },
  /** the current active workspace */
  activeWorkspaceDetails: (state, getters) => {
    if (!getters.isPersonalWorkspace) {
      return getters.workspaces.find((workspace) => {
        return workspace.shortcode == state.activeWorkspace;
      });
    }
    // returns some default values for personal workspace
    return {
      schema_name: "public",
      api_key: "",
    };
  },
  /** schema of the current workspace */
  activeWorkspaceSchema: (_, getters) => {
    return getters.activeWorkspaceDetails.schema_name;
  },
  /** api key of the current workspace */
  activeWorkspaceApiKey: (_, getters) => {
    return getters.activeWorkspaceDetails.api_key;
  },
  /** settings for the active workspace */
  activeWorkspaceSettings: (state, getters) => {
    if (getters.isPersonalWorkspace) return null;
    return state.workspaceSettings[state.activeWorkspace];
  },
  /** user's role in the current active workspace */
  userRoleInActiveWorkspace: (_, getters) => {
    if (getters.isPersonalWorkspace) return null;
    return getters.activeWorkspaceDetails.role;
  },
  /** id of the active workspace */
  activeWorkspaceId: (_, getters) => {
    if (getters.isPersonalWorkspace) return null;
    return getters.activeWorkspaceDetails.id;
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
    // if (getters.isAuthenticated) dispatch("unsetUser");
    let response = await UserAPIService.getUserByAccessToken(
      state.accessToken.access_token
    );
    if (response != undefined) {
      // use the config data of a user if it exists otherwise use the global defaults
      if ("settings" in response.data.config)
        dispatch(
          "setUserSettings",
          Utilities.decodeMapFromPayload(response.data.config.settings)
        );
      else dispatch("setUserSettings", clonedeep(globalDefaultSettings));

      // use the config data of organization(s) if it exists otherwise use the global defaults
      if (response.data.organizations.length > 0)
        dispatch("setWorkspaceSettings", response.data.organizations);
      else dispatch("unsetWorkspaceSettings");

      dispatch("setUser", response.data);
    }
  },
  autoLogoutUser({ dispatch }) {
    dispatch("unsetAccessToken");
  },
  setUserSettings({ commit }, value) {
    commit("setUserSettings", value);
  },
  unsetUserSettings({ commit }) {
    commit("unsetUserSettings");
  },
  setWorkspaceSettings({ commit }, workspaces) {
    let workspaceSettings = {};
    workspaces.forEach((workspaceDetails) => {
      workspaceSettings[workspaceDetails.shortcode] = getWorkspaceSettings(
        workspaceDetails
      );
    });
    commit("setWorkspaceSettings", workspaceSettings);
  },
  unsetWorkspaceSettings({ commit }) {
    commit("unsetWorkspaceSettings");
  },
  updateWorkspaceSettings({ commit }, settingObject) {
    commit("updateWorkspaceSettings", settingObject);
  },
};

const mutations = {
  setUserSettings(state, value) {
    state.userSettings = value;
  },
  unsetUserSettings(state) {
    state.userSettings = null;
  },
  setWorkspaceSettings(state, value) {
    state.workspaceSettings = value;
  },
  unsetWorkspaceSettings(state) {
    state.workspaceSettings = null;
  },
  updateWorkspaceSettings(state, settingObject) {
    state.workspaceSettings[state.activeWorkspace] = settingObject;
  },
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
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

/**
 * This method iterates through the global default settings object
 * and filters out all the keys/settings that will not be applied to a workspace
 * @param {Object} workspaceDetails - Details of a workspace
 * @returns A filtered version of the settings for a workspace
 */
function getWorkspaceSettings(workspaceDetails) {
  if (
    !("config" in workspaceDetails) ||
    !Utilities.doesObjectContainValidSettings(workspaceDetails.config)
  ) {
    let workspaceSettings = clonedeep(globalDefaultSettings);
    for (let [headerName, headerDetails] of workspaceSettings) {
      if (headerDetails.scope.length == 0) {
        workspaceSettings.delete(headerName);
        continue;
      }
      for (let [tabName, tabDetails] of headerDetails.children) {
        if (tabDetails.scope.length == 0) {
          headerDetails.children.delete(tabName);
          continue;
        }
        for (let [leafName, leafDetails] of tabDetails.children) {
          if (leafDetails.scope.length == 0) {
            tabDetails.children.delete(leafName);
            continue;
          }
        }
      }
    }
    return workspaceSettings;
  }
  return Utilities.decodeMapFromPayload(workspaceDetails.config.settings);
}
