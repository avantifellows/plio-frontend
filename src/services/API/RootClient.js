import axios from "axios";
import store from "../../store";

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
if (store.state.auth && store.state.auth.accessToken) {
  headers[
    "Authorization"
  ] = `Bearer ${store.state.auth.accessToken.access_token}`;
}

const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  headers,
});

export function apiClient() {
  return client;
}
