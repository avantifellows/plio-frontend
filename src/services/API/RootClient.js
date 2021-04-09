import axios from "axios";
import store from "../../store";

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  headers,
});

client.interceptors.request.use(
  (config) => {
    // set auth header
    if (store.state.auth && store.state.auth.accessToken) {
      config.headers.Authorization = `Bearer ${store.state.auth.accessToken.access_token}`;
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
