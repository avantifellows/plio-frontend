import PlioService from '@/services/PlioAPIService.js'

const namespaced = true
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
        // we want to call the action 'startLoading' but this action doesn't
        // exist here, it exists in the root store file "index.js"
        dispatch('startLoading', null, { root: true })

        const response = await PlioService.getAllPlios()
        var allPlios = response.data["all_plios"]
        commit('setPliosList', allPlios);
        
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