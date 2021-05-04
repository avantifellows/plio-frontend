import { usersEndpoint } from "@/services/API/Endpoints.js";
const RECONNECT_TIME = 2000;

export default function createUsersWebSocket() {
  return function connect(store, unsubscribeCallback) {
    // more details on "store.subscribe" and "unsubscribe" at this link
    // https://vuex.vuejs.org/api/#subscribe
    if (unsubscribeCallback != null) unsubscribeCallback();

    var UsersWebsocket;
    if (store.getters["auth/isAuthenticated"]) {
      // create a websocket connection if user is authenticated
      UsersWebsocket = new WebSocket(
        process.env.VUE_APP_BACKEND_WEBSOCKET +
          usersEndpoint +
          store.state.auth.userId
      );

      UsersWebsocket.onopen = () => {
        // websocket is open
        console.log("WebSocket is open now.");
      };

      UsersWebsocket.onmessage = (event) => {
        // message recieved by the client
        let user = JSON.parse(event.data).user;
        store.dispatch("auth/updateUserStatus", user.status, { root: true });
        store.dispatch("auth/setUser", user, { root: true });
      };

      UsersWebsocket.onclose = () => {
        // websocket has been closed
        console.log("Websocket has been closed. Reconnecting again!");

        setTimeout(() => {
          // reconnect after RECONNECT_TIME if the user is still authenticated
          if (store.getters["auth/isAuthenticated"]) connect(store);
        }, RECONNECT_TIME);
      };

      UsersWebsocket.onerror = (error) => {
        // an error occurred in the connection. Close the socket
        console.log("Websocket - an error occurred. Closing socket");
        console.log(error);
        UsersWebsocket.close();
      };
    }

    const unsubscribe = store.subscribe((mutation) => {
      // subscribe to store mutations

      // if the user has been newly set, make a new websocket connection and
      // unsubscribe to the mutations of the previous websocket connection
      if (mutation.type === "auth/setUser") connect(store, unsubscribe);
      // if the user has been unset, close the websocket
      else if (mutation.type === "auth/unsetUser") UsersWebsocket.close();
    });
  };
}
