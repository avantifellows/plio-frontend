import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Editor from "@/pages/Editor.vue";
import Player from "@/pages/Player.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Login from "@/pages/Login";
import store from "../store";
import i18n from "@/services/Localisation/i18n.js";
import { useToast } from "vue-toastification";

const toast = useToast();

const routes = [
  {
    path: "/",
    redirect: {
      name: "Login",
    },
  },
  {
    path: "/:org?/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/:org?/edit/:plioId",
    name: "Editor",
    component: Editor,
    props: true,
    beforeEnter: restrictUnapprovedUser,
    meta: { requiresAuth: true },
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
    path: "/:org?/play/:plioId",
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
    path: "/:org?/analyse/:plioId",
    name: "Dashboard",
    component: Dashboard,
    props: true,
    beforeEnter: restrictUnapprovedUser,
    meta: { requiresAuth: true },
  },
  {
    path: "/:org?/experiment/:id",
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
  // clear all toasts whenever the route changes
  toast.clear();

  // show auto logout toast
  if (
    to.name == "Login" &&
    from.name != undefined &&
    from.name != "Login" &&
    to.params["userClickedLogout"] == "false"
  ) {
    toast.error(i18n.global.t("error.auto_logout"));
  }

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

// set organization in vuex state if the route org parameter is in vuex user organizations array
router.beforeEach((to, from, next) => {
  if (!store.getters["auth/isAuthenticated"]) {
    next();
    return;
  }
  if (to.params.org != "" && to.params.org != undefined) {
    store.dispatch("auth/setActiveWorkspace", to.params.org);
  } else {
    store.dispatch("auth/unsetActiveWorkspace");
  }
  next();
});

function restrictUnapprovedUser(to, from, next) {
  if (store.getters["auth/isUserApproved"]) {
    next();
    return;
  }
  next({ name: "Home", params: { org: to.params.org }, replace: true });
}

export default router;
