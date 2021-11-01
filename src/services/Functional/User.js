import UserAPIService from "@/services/API/User.js";
import UtilitiesService from "@/services/Functional/Utilities.js";

export default {
  reAuthenticate(store) {
    // return the stored promise from the re-authentication call if re-authentication is in process
    if (store.state.auth.isReAuthenticating) {
      // to handle the case when isReAuthenticating has been set to true
      // but no promise exists in the store. Log out the user in that case
      if (
        store.state.auth.reAuthenticationPromise == null ||
        UtilitiesService.isObjectEmpty(store.state.auth.reAuthenticationPromise)
      ) {
        store.dispatch("auth/autoLogoutUser");
        return Promise.reject("Auto Logout!");
      } else {
        return store.state.auth.reAuthenticationPromise;
      }
    }

    // if the reAuthentication call is made while the user has been logged out
    // then reject the promise
    if (!store.getters["auth/isAuthenticated"])
      return Promise.reject("User is not set!");

    // set re-authentication as being in process
    store.dispatch("auth/setReAuthenticationState", true);

    // start the refreshAccessToken call and save that promise
    // in a variable called "reAuthenticationPromise"
    const reAuthenticationPromise = UserAPIService.refreshAccessToken()
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
        return Promise.reject(error);
      });

    // Until the promise stored in "reAuthenticationPromise" is resolved,
    // store this promise into vuex and return from the function.
    store.dispatch("auth/setReAuthenticationPromise", reAuthenticationPromise);
    return reAuthenticationPromise;
  },
};
