const DEFAULT_CONFIRM_BUTTON_CONFIG = {
  enabled: false,
  text: "",
  class: "",
};
const DEFAULT_CANCEL_BUTTON_CONFIG = {
  enabled: false,
  text: "",
  class: "",
};

const state = {
  isShown: false,
  isCloseButtonShown: false,
  title: "",
  description: "",
  confirmButtonConfig: DEFAULT_CONFIRM_BUTTON_CONFIG,
  cancelButtonConfig: DEFAULT_CANCEL_BUTTON_CONFIG,
  boxClass: "",
  action: "",
  isConfirmClicked: false,
  isCancelClicked: false,
};

const getters = {};

const actions = {
  showDialogBox({ commit }) {
    commit("showDialogBox");
  },
  hideDialogBox({ commit }) {
    commit("hideDialogBox");
  },
  setDialogCloseButton({ commit }) {
    commit("setDialogCloseButton");
  },
  unsetDialogCloseButton({ commit }) {
    commit("unsetDialogCloseButton");
  },
  setDialogTitle({ commit }, title) {
    commit("setDialogTitle", title);
  },
  unsetDialogTitle({ commit }) {
    commit("unsetDialogTitle");
  },
  setDialogDescription({ commit }, description) {
    commit("setDialogDescription", description);
  },
  unsetDialogDescription({ commit }) {
    commit("unsetDialogDescription");
  },
  setConfirmButtonConfig({ commit }, config) {
    commit("setConfirmButtonConfig", config);
  },
  unsetConfirmButtonConfig({ commit }) {
    commit("unsetConfirmButtonConfig");
  },
  setCancelButtonConfig({ commit }, config) {
    commit("setCancelButtonConfig", config);
  },
  unsetCancelButtonConfig({ commit }) {
    commit("unsetCancelButtonConfig");
  },
  setDialogBoxClass({ commit }, boxClass) {
    commit("setDialogBoxClass", boxClass);
  },
  unsetDialogBoxClass({ commit }) {
    commit("unsetDialogBoxClass");
  },
  setDialogAction({ commit }, action) {
    commit("setDialogAction", action);
  },
  unsetDialogAction({ commit }) {
    commit("unsetDialogAction");
  },
  setConfirmClicked({ commit }) {
    commit("setConfirmClicked");
  },
  unsetConfirmClicked({ commit }) {
    commit("unsetConfirmClicked");
  },
  setCancelClicked({ commit }) {
    commit("setCancelClicked");
  },
  unsetCancelClicked({ commit }) {
    commit("unsetCancelClicked");
  },
};

const mutations = {
  showDialogBox(state) {
    state.isShown = true;
  },
  hideDialogBox(state) {
    state.isShown = false;
  },
  setDialogCloseButton(state) {
    state.isCloseButtonShown = true;
  },
  unsetDialogCloseButton(state) {
    state.isCloseButtonShown = false;
  },
  setDialogTitle(state, title) {
    state.title = title;
  },
  unsetDialogTitle(state) {
    state.title = "";
  },
  setDialogDescription(state, description) {
    state.description = description;
  },
  unsetDialogDescription(state) {
    state.description = "";
  },
  setConfirmButtonConfig(state, config) {
    state.confirmButtonConfig = config;
  },
  unsetConfirmButtonConfig(state) {
    state.confirmButtonConfig = DEFAULT_CONFIRM_BUTTON_CONFIG;
  },
  setCancelButtonConfig(state, config) {
    state.cancelButtonConfig = config;
  },
  unsetCancelButtonConfig(state) {
    state.cancelButtonConfig = DEFAULT_CANCEL_BUTTON_CONFIG;
  },
  setDialogBoxClass(state, boxClass) {
    state.boxClass = boxClass;
  },
  unsetDialogBoxClass(state) {
    state.boxClass = "";
  },
  setDialogAction(state, action) {
    state.action = action;
  },
  unsetDialogAction(state) {
    state.action = "";
  },
  setConfirmClicked(state) {
    state.isConfirmClicked = true;
  },
  unsetConfirmClicked(state) {
    state.isConfirmClicked = false;
  },
  setCancelClicked(state) {
    state.isCancelClicked = true;
  },
  unsetCancelClicked(state) {
    state.isCancelClicked = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
