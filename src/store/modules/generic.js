const state = {
  isSharePlioDialogShown: false,
  isEmbedPlioDialogShown: false, // whether to show the dialog with info on embedding plio
  isBackgroundDisabled: false,
  plioLinkToShare: null,
  plioIdToEmbed: null, // uuid of the plio to be embedded
  windowInnerWidth: null, // inner width of the window
  windowInnerHeight: null, // inner height of the window
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
  async showEmbedPlioDialog({ commit, dispatch }, plioId) {
    await commit("setPlioIdToEmbed", plioId);
    dispatch("setEmbedPlioDialog");
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
  disableBackground({ commit }) {
    commit("disableBackground");
  },
  enableBackground({ commit }) {
    commit("enableBackground");
  },
};

const mutations = {
  setPlioLinkToShare(state, plioLink) {
    state.plioLinkToShare = plioLink;
  },
  setPlioIdToEmbed(state, plioId) {
    state.plioIdToEmbed = plioId;
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
  disableBackground(state) {
    state.isBackgroundDisabled = true;
  },
  enableBackground(state) {
    state.isBackgroundDisabled = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
