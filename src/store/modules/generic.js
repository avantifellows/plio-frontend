const state = {
  isSharePlioDialogShown: false,
  plioLinkToShare: null,
  userSwitchedWorkspace: false,
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
  setUserSwitchedWorkspace({ commit }) {
    commit("setUserSwitchedWorkspace");
  },
  unsetUserSwitchedWorkspace({ commit }) {
    commit("unsetUserSwitchedWorkspace");
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
  //shows that the user manually changed the workspace using the Workspace Switcher
  setUserSwitchedWorkspace(state) {
    state.userSwitchedWorkspace = true;
  },
  unsetUserSwitchedWorkspace(state) {
    state.userSwitchedWorkspace = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
