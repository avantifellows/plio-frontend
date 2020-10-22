import axios from "axios";

const state = {
  ivideoitems: [],
};
const getters = {
  allIvideos: (state) => state.ivideoitems,
};
const actions = {
  async fetchIvideos({ commit }) {
    const response = await axios.get(
      process.env.VUE_APP_BACKEND + process.env.VUE_APP_BACKEND_IVIDEOS_LIST
    );
    
    var all_ivideos = response.data["all_ivideos"]
    commit('setIvideosList', all_ivideos);
  },
};
const mutations = {
    setIvideosList: (state, ivideoitems) => (state.ivideoitems = ivideoitems)
};

export default {
  state,
  getters,
  actions,
  mutations,
};
