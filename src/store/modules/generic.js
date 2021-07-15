const state = {
  isSharePlioDialogShown: false,
  plioLinkToShare: null,
};
const getters = {};
const actions = {
  async showSharePlioDialog({ commit, dispatch }, plioLink) {
    await commit("setPlioLinkToShare", plioLink);
    dispatch("setSharePlioDialog");
  },
  setSharePlioDialog({ commit }) {
    commit("setSharePlioDialog");
  },
  unsetSharePlioDialog({ commit }) {
    commit("unsetSharePlioDialog");
  },
};

const mutations = {
  setPlioLinkToShare(state, plioLink) {
    state.plioLinkToShare = plioLink;
  },
  setSharePlioDialog(state) {
    state.isSharePlioDialogShown = true;
  },
  unsetSharePlioDialog(state) {
    state.isSharePlioDialogShown = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
