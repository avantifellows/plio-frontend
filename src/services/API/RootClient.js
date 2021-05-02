import axios from "axios";
import store from "../../store";
import ErrorHandling from "@/services/Functional/ErrorHandling.js";
import UserFunctionalService from "@/services/Functional/User.js";
import {
  refreshTokenEndpoint,
  convertTokenEndpoint,
  otpVerifyEndpoint,
  otpRequestEndpoint,
} from "@/services/API/Endpoints.js";

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  headers,
});

// list of all the authentication related URLs
const authEndpoints = [
  refreshTokenEndpoint,
  otpRequestEndpoint,
  otpVerifyEndpoint,
  convertTokenEndpoint,
];

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
      if (store.state.auth.accessToken && config.url != refreshTokenEndpoint) {
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
    // cancel the axios response if the user is not logged in
    // and do it only for the requests that are not related to authentication
    if (
      store.getters["auth/isAuthenticated"] == false &&
      !authEndpoints.includes(config.config.url)
    )
      throw new axios.Cancel("User is not logged in");

    // auth related requests can pass through
    return config;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    // If refresh token is invalid (400 BAD REQUEST) then log out the user
    if (error.config.url == refreshTokenEndpoint && status === 400) {
      store.dispatch("auth/unsetAccessToken");
      throw new axios.Cancel("User has been logged out");
    }

    // Handle expired/deleted access token here
    if (status === 401) {
      // reauthenticate the user, and until that is happenining, pause all other
      // requests. Once the user is authenticated, release all the paused requests
      // with the new token attached to the header
      return UserFunctionalService.reAuthenticate(store)
        .then(() => {
          error.config.headers["Authorization"] = `
            Bearer ${store.state.auth.accessToken.access_token}`;
          return client.request(error.config);
        })
        .catch((error) => console.log(error));
    }

    ErrorHandling.handleAPIErrors(error);
    return Promise.reject(error);
  }
);

export function apiClient() {
  return client;
}
