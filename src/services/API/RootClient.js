import axios from "axios";
import store from "../../store";
import ErrorHandling from "@/services/Functional/ErrorHandling.js";
import UserFunctionalService from "@/services/Functional/User.js";
import { refreshTokenEndpoint } from "@/services/API/Endpoints.js";

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

    const refreshTokenURL =
      process.env.VUE_APP_BACKEND_AUTH_URL + refreshTokenEndpoint;

    // set auth header
    if (store.state.auth != null) {
      if (store.state.auth.accessToken && config.url != refreshTokenURL) {
        // set the auth header only when the access token is present
        // and the call is not being made is NOT the refresh token call
        config.headers.Authorization = `
          Bearer ${store.state.auth.accessToken.access_token}`;
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

// handle errors in responses for API requests
client.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    // handle not authorized errors here
    if (status === 401) {
      // re authenticate the user, and until that is happenining, pause all other
      // requests. Once the user is authenticated, release all the paused requests
      // with the new token attached to the header
      return UserFunctionalService.reAuthenticate(store).then(() => {
        error.config.headers["Authorization"] = `
            Bearer ${store.state.auth.accessToken.access_token}`;
        return client.request(error.config);
      });
    }

    ErrorHandling.handleAPIErrors(error);
    return Promise.reject(error);
  }
);

export function apiClient() {
  return client;
}
