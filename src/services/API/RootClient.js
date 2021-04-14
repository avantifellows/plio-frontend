import axios from "axios";
import store from "../../store";
import Router from "../../router";

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  headers,
});

// the interceptor below is doing the following things:
// 1. Add trailing slash to every API call (if it's not there)
// 2. Set access token to the API calls
// 3. Retrieve organization id from current route and update activeWorkspace in vuex store. Then set Organization HTTP header for workspace.
client.interceptors.request.use(
  (config) => {
    if (config.url[config.url.length - 1] !== "/") {
      config.url += "/";
    }
    config.url = config.url.replace(/([^:])(\/{2,})/g, "$1/");

    // set auth header
    if (store.state.auth != null) {
      if (store.state.auth.accessToken) {
        config.headers.Authorization = `Bearer ${store.state.auth.accessToken.access_token}`;
      }
      config.headers.Organization = store.state.auth.activeWorkspace;
    }
    return config;
  },
  (error) => {
    // handle the error
    return Promise.reject(error);
  }
);

export function apiClient() {
  return client;
}
