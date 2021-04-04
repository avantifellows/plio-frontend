import axios from "axios";

const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_NEW,
  withCredentials: false, //default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function apiClient() {
  return client;
}
