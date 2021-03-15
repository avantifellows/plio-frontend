import PlioService from '@/services/PlioService.js'

const namespaced = true

const state = {
    allPlios: [],
};
const getters = {};
const actions = {
    async fetchPlios({ commit, dispatch }) {
        dispatch('startLoading', null, { root: true })

        const response = await PlioService.getAllPlios()
        var all_plios = response.data["all_plios"]
        commit('setPliosList', all_plios);
        
        dispatch('stopLoading', null, { root: true })
    },
};
const mutations = {
    setPliosList: (state, plioItems) => (state.allPlios = plioItems)
};

export default {
    namespaced,
    state,
    getters,
    actions,
    mutations,
};