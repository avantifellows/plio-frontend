const state = {
  pending: false,
  uploading: false,
};
const getters = {};
const actions = {
  startLoading({ commit }) {
    commit("startLoading");
  },
  stopLoading({ commit }) {
    commit("stopLoading");
  },
  startUploading({ commit }) {
    commit("startUploading");
  },
  stopUploading({ commit }) {
    commit("stopUploading");
  },
};

const mutations = {
  startLoading(state) {
    state.pending = true;
  },
  stopLoading(state) {
    state.pending = false;
  },
  startUploading(state) {
    state.uploading = true;
  },
  stopUploading(state) {
    state.uploading = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
