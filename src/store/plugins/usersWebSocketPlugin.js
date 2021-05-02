import { usersEndpoint } from "@/services/API/Endpoints.js";
const RECONNECT_TIME = 2000;

export default function createUsersWebSocket() {
  return function connect(store, unsubscribeCallback) {
    if (unsubscribeCallback != null) unsubscribeCallback();

    if (store.getters["auth/isAuthenticated"]) {
      var UsersWebsocket = new WebSocket(
        process.env.VUE_APP_BACKEND_WEBSOCKET +
          usersEndpoint +
          store.state.auth.userId
      );

      UsersWebsocket.onopen = () => {
        console.log("WebSocket is open now.");
      };

      UsersWebsocket.onmessage = (event) => {
        let user = JSON.parse(event.data).user;
        store.dispatch("auth/updateUserStatus", user.status, { root: true });
        store.dispatch("auth/setUser", user, { root: true });
      };

      UsersWebsocket.onclose = () => {
        console.log("Websocket has been closed. Reconnecting again!");
        setTimeout(() => {
          if (store.getters["auth/isAuthenticated"]) connect(store);
        }, RECONNECT_TIME);
      };

      UsersWebsocket.onerror = (error) => {
        console.log("Websocket - an error occurred. Closing socket");
        console.log(error);
        UsersWebsocket.close();
      };
    }

    const unsubscribe = store.subscribe((mutation) => {
      if (mutation.type === "auth/setUser") connect(store, unsubscribe);
      else if (mutation.type === "auth/unsetUser") UsersWebsocket.close();
    });
  };
}
