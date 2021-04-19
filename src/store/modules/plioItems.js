import PlioAPIService from "@/services/API/Plio.js";

const namespaced = true;
// namespacing modules
// https://vuex.vuejs.org/guide/modules.html#namespacing

const state = {
  allPlioDetails: {},
};
const getters = {};
const actions = {
  async fetchPlio({ commit }, plioId) {
    const response = await PlioAPIService.getPlio(plioId);
    commit("setPlioDetails", { plioId: plioId, plioDetails: response });
  },

  purgeAllPlios({ commit }) {
    commit("purgeAllPlios");
  },
};
const mutations = {
  setPlioDetails: (state, data) => {
    state.allPlioDetails[data.plioId] = data.plioDetails;
  },
  purgeAllPlios: (state) => (state.allPlioDetails = {}),
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
