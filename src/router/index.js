import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Player from "../views/Player.vue";
import PhoneSignIn from "../views/PhoneSignIn";
import PageNotFound from "../views/PageNotFound"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/play/:id",
    name: "Player",
    component: Player,
    query: {
      src: ''
    }
  },
  {
    path: "/login/:id?",
    name: "Phone Sign In",
    component: PhoneSignIn,
  },
  { 
    path: "/login", 
    redirect: {
      name: "Phone Sign In" 
    } 
  },
  {
    path: '/404-not-found',
    name: '404',
    component: PageNotFound,
    props: { type: '404' }
  },
  {
    // Refer to: https://stackoverflow.com/a/64186073/7870587
    path: '/:pathMatch(.*)*',
    redirect: '/404-not-found'
  }

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
