import UserAPIService from "@/services/API/User.js";

export default {
  reAuthenticate(store) {
    // return the stored promise from the re-authentication call if re-authentication is in process
    if (store.state.auth.isReAuthenticating)
      return store.state.auth.reAuthenticationPromise;

    // set re-authentication as being in process
    store.dispatch("auth/setReAuthenticationState", true);

    // start the refreshAccessToken call
    const reAuthenticationPromise = UserAPIService.refreshAccessToken()
      //  Save that promise in a variable called "reAuthenticationPromise"
      .then((response) => {
        // once the refreshAccessToken call resolves, set the new access token in store
        // set isReAuthenticating to false
        // and unset the reAuthenticationPromise that was saved in store
        // and resolve the promise so other waiting calls can proceed
        store.dispatch("auth/setAccessToken", response.data);
        store.dispatch("auth/setReAuthenticationState", false);
        store.dispatch("auth/unsetReAuthenticationPromise");
        return Promise.resolve(true);
      })
      .catch((error) => {
        // set reAuthenticationState to false if an error occurrs while refreshing the access token
        store.dispatch("auth/setReAuthenticationState", false);
        return Promise.reject(error);
      });

    // Until the promise stored in "reAuthenticationPromise" is resolved,
    // store this promise into vuex and return from the function.
    store.dispatch("auth/setReAuthenticationPromise", reAuthenticationPromise);
    return reAuthenticationPromise;
  },
};