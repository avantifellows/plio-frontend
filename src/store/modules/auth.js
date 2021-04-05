import axios from "axios";

const state = {
  authToken: null,
};

const getters = {
  isAuthenticated: (state) => !!state.authToken,
  stateAuthToken: (state) => state.authToken,
};

const actions = {
  async convertSocialAuthToken({ commit }, socialAuthToken) {
    let response = await axios.post(process.env.VUE_APP_BACKEND_AUTH_URL, {
      grant_type: "convert_token",
      client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
      client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
      backend: "google-oauth2",
      token: socialAuthToken,
    });
    await commit("setAuthToken", response.data);
  },
  async LogOut({ commit }) {
    let authToken = null;
    commit("logOut", authToken);
  },
};

const mutations = {
  setAuthToken(state, authToken) {
    state.authToken = authToken;
  },
  logOut(state) {
    state.authToken = null;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
