import UserAPIService from "@/services/API/User.js";

export default {
  async reAuthenticate(store) {
    // set reAuthentication state as in progress
    store.dispatch("auth/setReAuthenticationState", "in-process");

    // create a promise and store its resolver in a separate variable
    let reAuthenticationPromiseResolver;
    let reAuthenticationPromise = new Promise((resolve) => {
      reAuthenticationPromiseResolver = resolve;
    });

    // save the above created promise and it's resolver into the store
    store.dispatch("auth/setReAuthenticationPromise", reAuthenticationPromise);
    store.dispatch(
      "auth/setReAuthenticationPromiseResolver",
      reAuthenticationPromiseResolver
    );

    try {
      // try refreshing the access token
      let response = await UserAPIService.refreshAccessToken();
      if (response != undefined && response.data != undefined) {
        // set the recieved access token into the store
        // and mark the re authentication process as completed.
        // We will also resolve the pending reAuthenticationPromise so the code
        // that is waiting for the promises to resolve can proceed
        store.dispatch("auth/setAccessToken", response.data);
        store.dispatch("auth/setReAuthenticationState", "completed");
        store.state.auth.reAuthenticationPromiseResolver();
        return response.data;
      }
    } catch (e) {
      // an error occured in the process of refreshing the access token.
      // We'll mark the re authentication process as dropped and throw an error
      store.dispatch("auth/setReAuthenticationState", "dropped");
      throw new Error(e);
    }
  },
};
