const state = {
  isShown: false,
  type: "single",
  options: [],
  title: "",
};

const getters = {
  isSingleSelectorShown: (state) => {
    return state.isShown && state.type == "single";
  },
};

const actions = {
  showSelector({ commit }, params) {
    commit("showSelector", params);
  },
  hideSelector({ commit }) {
    commit("hideSelector");
  },
};

const mutations = {
  showSelector(state, params) {
    state.isShown = true;
    state.type = params.type;
    state.options = params.options;

    if (params.title != undefined) state.title = params.title;
  },
  hideSelector(state) {
    state.isShown = false;
    state.options = [];
    state.title = "";
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
