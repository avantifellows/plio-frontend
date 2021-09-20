const state = {
  isSharePlioDialogShown: false,
  isEmbedPlioDialogShown: true, // whether to show the dialog with info on embedding plio
  isBackgroundDisabled: false,
  plioLinkToShare: null,
  plioIdToEmbed: null,
};
const getters = {};
const actions = {
  async showSharePlioDialog({ commit, dispatch }, plioLink) {
    await commit("setPlioLinkToShare", plioLink);
    dispatch("setSharePlioDialog");
  },
  async showEmbedPlioDialog({ commit, dispatch }, plioId) {
    await commit("setPlioIdToEmbed", plioId);
    dispatch("setEmbedPlioDialog");
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
