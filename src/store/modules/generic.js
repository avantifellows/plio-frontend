const state = {
  isSharePlioDialogShown: false,
  isEmbedPlioDialogShown: false, // whether to show the dialog with info on embedding plio
  plioLinkToShare: null,
  selectedPlioId: null, // uuid of the plio selected
  newVideoDetails: null,
  windowInnerWidth: null,
  windowInnerHeight: null,
  isSpinnerShown: false,
};
const getters = {
  /**
   * whether the current screen size can be
   * classified as a mobile screen
   */
  isMobileScreen: (state) => {
    return state.windowInnerWidth <= 500;
  },
  /**
   * whether the current screen size can be
   * classified as a tab screen
   */
  isTabScreen: (state) => {
    return state.windowInnerWidth < 640;
  },
};
const actions = {
  showSharePlioDialog({ commit, dispatch }, plioLink) {
    commit("setPlioLinkToShare", plioLink);
    dispatch("setSharePlioDialog");
  },
  showEmbedPlioDialog({ dispatch }, plioId) {
    dispatch("setSelectedPlioId", plioId);
    dispatch("setEmbedPlioDialog");
  },
  setSelectedPlioId({ commit }, plioId) {
    commit("setSelectedPlioId", plioId);
  },
  setNewVideoDetails({ commit }, plioId) {
    commit("setNewVideoDetails", plioId);
  },
  unsetNewVideoDetails({ commit }) {
    commit("unsetNewVideoDetails");
  },
  setWindowInnerWidth({ commit }, windowInnerWidth) {
    commit("setWindowInnerWidth", windowInnerWidth);
  },
  setWindowInnerHeight({ commit }, windowInnerHeight) {
    commit("setWindowInnerHeight", windowInnerHeight);
  },
  setSharePlioDialog({ commit }) {
    commit("setSharePlioDialog");
  },
  unsetSharePlioDialog({ commit }) {
    commit("unsetSharePlioDialog");
  },
  setEmbedPlioDialog({ commit }) {
    commit("setEmbedPlioDialog");
  },
  unsetEmbedPlioDialog({ commit }) {
    commit("unsetEmbedPlioDialog");
  },
  showSpinner({ commit }) {
    commit("showSpinner");
  },
  hideSpinner({ commit }) {
    commit("hideSpinner");
  },
};

const mutations = {
  setPlioLinkToShare(state, plioLink) {
    state.plioLinkToShare = plioLink;
  },
  setSelectedPlioId(state, plioId) {
    state.selectedPlioId = plioId;
  },
  setNewVideoDetails(state, details) {
    state.newVideoDetails = details;
  },
  unsetNewVideoDetails(state) {
    state.newVideoDetails = null;
  },
  setWindowInnerWidth(state, windowInnerWidth) {
    state.windowInnerWidth = windowInnerWidth;
  },
  setWindowInnerHeight(state, windowInnerHeight) {
    state.windowInnerHeight = windowInnerHeight;
  },
  setSharePlioDialog(state) {
    state.isSharePlioDialogShown = true;
  },
  unsetSharePlioDialog(state) {
    state.isSharePlioDialogShown = false;
  },
  setEmbedPlioDialog(state) {
    state.isEmbedPlioDialogShown = true;
  },
  unsetEmbedPlioDialog(state) {
    state.isEmbedPlioDialogShown = false;
  },
  showSpinner(state) {
    state.isSpinnerShown = true;
  },
  hideSpinner(state) {
    state.isSpinnerShown = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
