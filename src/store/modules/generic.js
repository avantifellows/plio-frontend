const state = {
  isSharePlioDialogShown: false,
  isEmbedPlioDialogShown: false, // whether to show the dialog with info on embedding plio
  isBackgroundDisabled: false,
  plioLinkToShare: null,
  plioIdToEmbed: null, // uuid of the plio to be embedded
  networkDownToastID: null,
  networkUpToastID: null,
};
const getters = {
  /**
   * Whether any of the network connection toasts is visible on screen
   */
  isNetworkToastVisible: (state) => {
    return state.networkDownToastID != null || state.networkUpToastID != null;
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
  setNetworkDownToastID({ commit }, toastID) {
    commit("setNetworkDownToastID", toastID);
  },
  setNetworkUpToastID({ commit }, toastID) {
    commit("setNetworkUpToastID", toastID);
  },
  unsetNetworkDownToastID({ commit }) {
    commit("unsetNetworkDownToastID");
  },
  unsetNetworkUpToastID({ commit }) {
    commit("unsetNetworkUpToastID");
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
  setNetworkDownToastID(state, toastID) {
    state.networkDownToastID = toastID;
  },
  setNetworkUpToastID(state, toastID) {
    state.networkUpToastID = toastID;
  },
  unsetNetworkDownToastID(state) {
    state.networkDownToastID = null;
  },
  unsetNetworkUpToastID(state) {
    state.networkUpToastID = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
