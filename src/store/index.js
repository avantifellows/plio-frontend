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
        getUserId: state => {
            return state.userId
        },
        getConfigs: state => {
            return state.configs
        }
    },
    state: {
        isLoggedIn: !!localStorage.getItem("phone"),
        userId: localStorage.getItem("phone"),
        configs: localStorage.getItem("configs")
    },
    mutations: {
        [LOGIN](state) {
            state.pending = true;
        },
        [LOGIN_SUCCESS](state) {
            state.pending = false;
            state.isLoggedIn = true;
            state.userId = localStorage.getItem('phone');
        },
        [LOGOUT](state) {
            state.isLoggedIn = false;
            state.userId = null;
        },
        [CONFIG](state) {
            state.configFetchedPending = true;
        },
        [CONFIG_SUCCESS](state) {
            state.configFetchedPending = false;
            state.configs = localStorage.getItem('configs');
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
        saveConfigs({ commit }, creds) {
            commit(CONFIG); // show spinner
            return new Promise(resolve => {
                localStorage.setItem("configs", creds.configs);
                commit(CONFIG_SUCCESS);
                resolve();
            });
        },
    },
    modules: {
        plioItems
    }
})