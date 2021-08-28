const state = {
  isSharePlioDialogShown: false,
  isDialogBoxShown: false,
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
  setDialogBoxShown({ commit }) {
    commit("setDialogBoxShown");
  },
  unsetDialogBoxShown({ commit }) {
    commit("unsetDialogBoxShown");
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
  setDialogBoxShown(state) {
    state.isDialogBoxShown = true;
  },
  unsetDialogBoxShown(state) {
    state.isDialogBoxShown = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
