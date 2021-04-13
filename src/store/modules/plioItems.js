import PlioAPIService from "@/services/API/Plio.js";

const namespaced = true;
// namespacing modules
// https://vuex.vuejs.org/guide/modules.html#namespacing

const state = {
  allPlios: [],
};
const getters = {};
const actions = {
  async fetchPlios({ commit, dispatch }) {
    // dispatch root actions in namespaced modules
    // https://vuex.vuejs.org/api/#dispatch
    dispatch("sync/startLoading", null, { root: true });

    const response = await PlioAPIService.getAllPlios();
    var allPlios = response.data;
    commit("setPliosList", allPlios);

    dispatch("sync/stopLoading", null, { root: true });
  },
};
const mutations = {
  setPliosList: (state, plioItems) => (state.allPlios = plioItems),
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
