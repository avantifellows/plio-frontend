const state = {
  isSharePlioDialogShown: false,
  isEmbedPlioDialogShown: false, // whether to show the dialog with info on embedding plio
  plioLinkToShare: null,
  selectedPlioId: null, // uuid of the plio selected
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
  async showSharePlioDialog({ commit, dispatch }, plioLink) {
    await commit("setPlioLinkToShare", plioLink);
    dispatch("setSharePlioDialog");
  },
  async showEmbedPlioDialog({ dispatch }, plioId) {
    await dispatch("setSelectedPlioId", plioId);
    dispatch("setEmbedPlioDialog");
  },
  async setSelectedPlioId({ commit }, plioId) {
    await commit("setSelectedPlioId", plioId);
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
