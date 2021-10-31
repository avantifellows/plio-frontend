import axios from "axios";
import store from "@/store";
import ErrorHandling from "@/services/API/ErrorHandling.js";
import UserFunctionalService from "@/services/Functional/User.js";
import {
  refreshTokenEndpoint,
  userFromTokenEndpoint,
} from "@/services/API/Endpoints.js";
import cubejs from "@cubejs-client/core";

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// backend API client
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
      if (store.state.auth.accessToken && config.url != refreshTokenEndpoint) {
        // set the auth header only when the access token is present
        // and the call being made is NOT the refresh token call
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
    // logging the error
    console.log(error);

    // error status
    const status = error.response ? error.response.status : null;

    // If refresh token is invalid (400 BAD REQUEST)
    if (
      error.config != undefined &&
      error.config.url == refreshTokenEndpoint &&
      status === 400
    ) {
      // unset the access token and log out the user
      store.dispatch("auth/unsetAccessToken");

      // set the reauthentication status as false
      store.dispatch("auth/setReAuthenticationState", false);

      // return a never resolving/rejecting promise so no more API calls can occur
      // https://github.com/axios/axios/issues/583#issuecomment-504317347
      return new Promise(() => {});
    }

    // Handle expired/deleted access token here
    if (status === 401) {
      // reauthenticate the user, and until that is happenining, pause all other
      // requests. Once the user is authenticated, release all the paused requests
      // with the new token attached to the header
      return UserFunctionalService.reAuthenticate(store)
        .then(() => {
          if (store.state.auth.accessToken != null) {
            var newAccessToken = store.state.auth.accessToken.access_token;
            // Add the new access token to the header of the request
            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;

            // If the call is fetching a user from an access token, we need to update the
            // request params with the new access token
            if (error.config.url == userFromTokenEndpoint)
              error.config.params["token"] = newAccessToken;

            // try the request again
            return client.request(error.config);
          }
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

export function analyticsAPIClient() {
  return cubejs(
    async () => {
      if (!store.getters["auth/isAnalyticsAccessTokenValid"]) {
        await store.dispatch("auth/getAnalyticsAccessToken");
      }
      return store.state.auth.analyticsAccessToken;
    },
    {
      apiUrl: process.env.VUE_APP_CUBEJS_API_URL,
      headers: {
        organization: store.getters["auth/activeWorkspaceSchema"],
      },
    }
  );
}
