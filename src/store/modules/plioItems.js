import axios from "axios";

const state = {
    plioItems: [],
};
const getters = {
    allPlios: (state) => state.plioItems,
};
const actions = {
    async fetchPlios({ commit }) {
        const response = await axios.get(
            process.env.VUE_APP_BACKEND + process.env.VUE_APP_BACKEND_PLIOS_LIST
        );

        var all_ivideos = response.data["all_plios"]
        commit('setPliosList', all_ivideos);
    },
};
const mutations = {
    setPliosList: (state, plioItems) => (state.plioItems = plioItems)
};

export default {
    state,
    getters,
    actions,
    mutations,
};