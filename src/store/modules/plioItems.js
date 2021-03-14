import PlioService from '@/services/PlioService.js'

const state = {
    plioItems: [],
};
const getters = {
    allPlios: (state) => state.plioItems,
};
const actions = {
    async fetchPlios({ commit }) {
        const response = await PlioService.getAllPlios()
        var all_plios = response.data["all_plios"]
        commit('setPliosList', all_plios);
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