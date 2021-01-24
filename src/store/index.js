import { createStore } from 'vuex'
import plioItems from './modules/plioItems'

// Reference: https://medium.com/front-end-weekly/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGOUT = "LOGOUT";
const LOGIN = "LOGIN";
const CONFIG = "CONFIG";
const CONFIG_SUCCESS = "CONFIG_SUCCESS";

export default createStore({
    getters: {
        isLoggedIn: state => {
            return state.isLoggedIn
        },
        getConfig: state => {
            return state.config
        }
    },
    state: {
        isLoggedIn: !!localStorage.getItem("phone"),
        config: localStorage.getItem("config")
    },
    mutations: {
        [LOGIN](state) {
            state.pending = true;
        },
        [LOGIN_SUCCESS](state) {
            state.pending = false;
            state.isLoggedIn = true;
        },
        [LOGOUT](state) {
            state.isLoggedIn = false;
        },
        [CONFIG](state) {
            state.configFetchedPending = true;
        },
        [CONFIG_SUCCESS](state) {
            state.configFetchedPending = false;
        }
    },
    actions: {
        login({ commit }, creds) {
            commit(LOGIN); // show spinner
            return new Promise(resolve => {
                localStorage.setItem("phone", creds.phone);
                commit(LOGIN_SUCCESS);
                resolve();
            });
        },
        logout({ commit }) {
            localStorage.removeItem("phone");
            commit(LOGOUT);
        },
        saveConfig({ commit }, creds) {
            commit(CONFIG); // show spinner
            return new Promise(resolve => {
                localStorage.setItem("config", creds.config);
                commit(CONFIG_SUCCESS);
                resolve();
            });
        },
    },
    modules: {
        plioItems
    }
})