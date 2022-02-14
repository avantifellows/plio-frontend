const state = {
  isShown: false,
  type: "single",
  options: [],
  heading: "",
  info: "",
  positionClass: "",
  optionsContainerClass: "",
  containerClass: "",
  isCloseButtonShown: true,
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

    for (const [key, value] of Object.entries(params)) state[key] = value;
  },
  hideSelector(state) {
    state.isShown = false;
    state.options = [];
    state.heading = "";
    state.info = "";
    state.isCloseButtonShown = true;
    state.optionsContainerClass = "";
    state.positionClass = "";
    state.containerClass = "";
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
