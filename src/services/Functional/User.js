import UserAPIService from "@/services/API/User.js";

export default {
  reAuthenticate(store) {
    // return the stored reAuthCall if re-authentication is in process
    if (store.state.auth.isReAuthenticating)
      return store.state.auth.reAuthenticationCall;

    // re authentication is in process
    store.dispatch("auth/setReAuthenticationState", true);

    // start the refreshAccessToken call and save that promise in the variable
    // "reAuthenticationCall". Until that promise is resolved, store this promise
    // into vuex and return from the function.
    const reAuthenticationCall = UserAPIService.refreshAccessToken()
      .then((response) => {
        // once the refreshAccessToken call resolves, set the new access token in store
        // set isReAuthenticating to false
        // and unset the reAuthenticationCall promise that was saved in store
        // and resolve the promise so other waiting calls can proceed
        store.dispatch("auth/setAccessToken", response.data);
        store.dispatch("auth/setReAuthenticationState", false);
        store.dispatch("auth/unsetReAuthenticationCall");
        return Promise.resolve(true);
      })
      .catch((error) => {
        // set reAuthenticationState to false if an error occurrs while refreshing the access token
        store.dispatch("auth/setReAuthenticationState", false);
        return Promise.reject(error);
      });
    store.dispatch("auth/setReAuthenticationCall", reAuthenticationCall);
    return reAuthenticationCall;
  },
};
