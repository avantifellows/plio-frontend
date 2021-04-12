import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Test from "@/pages/Test.vue";
import Editor from "@/pages/Editor.vue";
import Player from "@/pages/Player.vue";
import Login from "@/pages/Login";
import store from "../store";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
  },
  {
    path: "/edit/:plioId",
    name: "Editor",
    component: Editor,
    props: true,
  },
  {
    // type: the type of component invoking this path (optional)
    // id: the unique ID for the component invoking this path (optional)
    path: "/login/:id?/:type?",
    name: "Login",
    component: Login,
    props: true,
    meta: { guest: true },
  },
  {
    path: "/play/:plioId",
    name: "Player",
    component: Player,
    query: {
      src: "",
    },
    // passing props to route components
    // https://router.vuejs.org/guide/essentials/passing-props.html#passing-props-to-route-components
    props: (route) => ({
      experiment: route.query.experiment,
      plioId: route.params.plioId,
    }),
    meta: { requiresAuth: true },
  },
  {
    path: "/experiment/:id",
    name: "ABTesting",
    component: () => import("@/pages/ABTesting"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/404-not-found",
    name: "404",
    component: () => import("@/pages/Error"),
    props: { type: "404" },
  },
  {
    // Refer to: https://stackoverflow.com/a/64186073/7870587
    path: "/:pathMatch(.*)*",
    redirect: {
      name: "404",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  base: process.env.VUE_APP_FRONTEND,
  routes,
});

/*
Router auth logic start

The code below works on `isAuthenticated` state and before every route:
1. Redirects user to login if user is not authenticated and visits a page that requires authentication (route.meta.requiresAuth)
2. Redirects user to home if user is already logged in and visiting a page that is intended for guest (route.meta.guest)
*/

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters["auth/isAuthenticated"]) {
      next();
      return;
    }
    next({
      name: "Login",
      params: { redirectTo: to.name, params: JSON.stringify(to.params) },
    });
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.guest)) {
    if (store.getters["auth/isAuthenticated"]) {
      next({ name: "Home" });
      return;
    }
    next();
  } else {
    next();
  }
});

/*
Router auth logic end
*/

export default router;
