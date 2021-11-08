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
    // reset reAuthenticationState to its original value whenever any request returns
    // a non-error response code. Make sure not to do this for refresh token call
    if (config.config.url != refreshTokenEndpoint && store.state.auth.reAuthenticationState != "not-started")
      store.dispatch("auth/setReAuthenticationState", "not-started");
    return config;
  },
  async (error) => {
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
      // auto logout the user
      store.dispatch("auth/autoLogoutUser");
      // We want to cancel all the pending axios requests. The workaround for this is to
      // return a never resolving/rejecting promise so no more API calls can occur
      // https://github.com/axios/axios/issues/583#issuecomment-504317347
      return new Promise(() => {});
    }

    // Handle expired/deleted access token here
    if (status === 401) {
      // re-authenticate the user if this is the first re-authentication call. While re-authentication is going on
      // if some other request ends up here, then wait for the re-authentication process to finish. Once that is done,
      // set the newly retrieved access token as an auth header and retry the request. Any errors in the re-authentication
      // process are caught and the user is logged out.
      let handleReAuthentication = async () => {
        try {
          let reAuthenticationState = store.state.auth.reAuthenticationState;
          switch (reAuthenticationState) {
            case "dropped":
              // re-authentication process was dropped, throw an error.
              throw new Error(
                "Re-authentication failed, no more calls allowed"
              );
            case "in-process":
              // re-authentication process in progress. Wait for the promise to resolve,
              await store.state.auth.reAuthenticationPromise;
              break;
            case "not-started":
              // fresh re-authentication process to begin now. Wait for the process to complete,
              await UserFunctionalService.reAuthenticate(store);
              break;
          }
          // Add the new access token recieved from the re-authentication process
          // to the header of the request and retry the request
          let newAccessToken = store.state.auth.accessToken.access_token;
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          if (error.config.url == userFromTokenEndpoint) {
            // If the call is fetching a user from an access token, we need to update the
            // request params with the new access token
            error.config.params["token"] = newAccessToken;
          }
          return client.request(error.config); // retrying the request
        } catch (err) {
          // an error occured in the re-authentication process
          // reset the reAuthenticationState value, so any future re-authentication processes
          // can function normally
          store.dispatch("auth/setReAuthenticationState", "not-started");
          // if the user is still logged in, log them out
          // if the user is not logged in, then just throw an error
          if (store.getters["auth/isAuthenticated"]) {
            store.dispatch("auth/autoLogoutUser");
            throw new Error("AutoLogout! " + err.message);
          }

          throw new Error(err.message);
        }
      };
      // the reason why we're not using the above try/catch logic as it as and why
      // we're wrapping it into an async function
      // https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
      return handleReAuthentication();
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
