import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Player from "../views/Player.vue";
import PhoneSignIn from "../views/PhoneSignIn";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/play/:id/:source?",
    name: "Player",
    component: Player,
  },
  {
    path: "/login/:id?",
    name: "Phone Sign In",
    component: PhoneSignIn,
  },
  { path: "/login", redirect: { name: "Phone Sign In" } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
