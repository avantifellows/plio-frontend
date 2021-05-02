import UserAPIService from "@/services/API/User.js";

export default {
  reAuthenticate(store) {
    // return the stored promise from the re-authentication call if re-authentication is in process
    if (store.state.auth.isReAuthenticating)
      return store.state.auth.reAuthenticationPromise;

    // set re-authentication as being in process
    store.dispatch("auth/setReAuthenticationState", true);

    // start the refreshAccessToken call and save that promise in the variable
    // "reAuthenticationPromise". Until that promise is resolved, store this promise
    // into vuex and return from the function.
    const reAuthenticationPromise = UserAPIService.refreshAccessToken()
      .then((response) => {
        // once the refreshAccessToken call resolves, set the new access token in store
        // set isReAuthenticating to false
        // and unset the reAuthenticationPromise that was saved in store
        // and resolve the promise so other waiting calls can proceed
        store.dispatch("auth/setAccessToken", response.data);
        store.dispatch("auth/setReAuthenticationState", false);
        store.dispatch("auth/unsetreAuthenticationPromise");
        return Promise.resolve(true);
      })
      .catch((error) => {
        // set reAuthenticationState to false if an error occurrs while refreshing the access token
        store.dispatch("auth/setReAuthenticationState", false);
        return Promise.reject(error);
      });
    store.dispatch("auth/setreAuthenticationPromise", reAuthenticationPromise);
    return reAuthenticationPromise;
  },
};
