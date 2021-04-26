import { usersEndpoint } from "@/services/API/Endpoints.js";

export default function createUsersWebSocket() {
  return function connect(store) {
    var UsersWebsocket = new WebSocket(
      process.env.VUE_APP_BACKEND_WEBSOCKET + usersEndpoint
    );

    UsersWebsocket.onopen = () => {
      console.log("WebSocket is open now.");
    };

    UsersWebsocket.onmessage = (event) => {
      let user = JSON.parse(event.data).user;
      store.dispatch("auth/updateUserStatus", user.status, { root: true });
      store.dispatch("auth/setUser", user, { root: true });
      store.dispatch("sync/stopLoading", null, { root: true });
    };

    UsersWebsocket.onclose = () => {
      console.log("Websocket has been closed. Reconnecting in 2 seconds");
      setTimeout(() => {
        connect(store);
      }, 2000);
    };

    UsersWebsocket.onerror = (error) => {
      console.log("Websocket - an error occurred. Closing socket");
      console.log(error);
      UsersWebsocket.close();
    };
  };
}
