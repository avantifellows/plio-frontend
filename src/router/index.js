import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import i18n from "@/services/Localisation/i18n.js";
import { useToast } from "vue-toastification";
import {
  animationFrameRequest,
  resetConfetti,
} from "@/services/Functional/Utilities.js";

const toast = useToast();
// these keys should be present as query params when a third party
// auth is used to access a route
const requiredAuthKeys = ["unique_id", "api_key"];

const routes = [
  {
    path: "/",
    redirect: {
      name: "Login",
    },
  },
  {
    path: "/:workspace?/home",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ "@/pages/Home.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      title: "Home - Plio",
    },
  },
  {
    path: "/:workspace?/edit/:plioId",
    name: "Editor",
    component: () =>
      import(/* webpackChunkName: "editor" */ "@/pages/Editor.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      title: "Editor - Plio",
    },
  },
  {
    // type: the type of component invoking this path (optional)
    // id: the unique ID for the component invoking this path (optional)
    path: "/login/:id?/:type?",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "@/pages/Login.vue"),
    props: true,
    meta: {
      guest: true,
      title: "Login - Plio",
    },
  },
  {
    path: "/:workspace?/play/:plioId",
    name: "Player",
    component: () =>
      import(/* webpackChunkName: "player" */ "@/pages/Player.vue"),
    query: {
      src: "",
    },
    // passing props to route components
    // https://router.vuejs.org/guide/essentials/passing-props.html#passing-props-to-route-components
    props: (route) => ({
      plioId: route.params.plioId,
      workspace: route.params.workspace,
      thirdPartyUniqueId: route.query.unique_id,
      thirdPartyApiKey: route.query.api_key,
    }),
    meta: {
      requiresAuth: true,
      title: "Player - Plio",
    },
  },
  {
    path: "/:workspace?/plio/:plioId",
    name: "Plio",
    component: () =>
      import(/* webpackChunkName: "plio" */ "@/pages/Embeds/Plio.vue"),
    props: (route) => ({
      plioId: route.params.plioId,
      workspace: route.params.workspace,
      thirdPartyUniqueId: route.query.unique_id,
      thirdPartyApiKey: route.query.api_key,
    }),
    meta: {
      title: "Plio",
    },
  },
  {
    path: "/:workspace?/analyse/:plioId",
    name: "Dashboard",
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "@/pages/Dashboard.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      title: "Dashboard - Plio",
    },
  },
  {
    path: "/404-not-found",
    name: "404",
    component: () => import(/* webpackChunkName: "error" */ "@/pages/Error"),
    props: { type: "404" },
  },
  {
    path: "/403-access-denied",
    name: "403",
    component: () => import(/* webpackChunkName: "error" */ "@/pages/Error"),
    props: { type: "403" },
  },
  {
    // refer to: https://stackoverflow.com/a/64186073/7870587
    path: "/:pathMatch(.*)*",
    redirect: {
      name: "404",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  base: process.env.VUE_APP_FRONTEND,
  routes,
});

/*
Router auth logic start

The code below works on `isAuthenticated` state and before every route:
1. Redirects user to login if user is not authenticated and visits a page that requires authentication (route.meta.requiresAuth)
2. Redirects user to home if user is already logged in and visiting a page that is intended for guest (route.meta.guest)
*/

router.beforeEach((to, from) => {
  // clear all toasts whenever the route changes
  toast.clear();

  // if internet is down, show the internet lost toast
  if (window.Offline.state == "down")
    toast.error(i18n.global.t("error.internet_lost"), {
      id: "internetLostToast",
      position: "bottom-center",
      timeout: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });

  // clear all confetti whenever the route changes
  if (animationFrameRequest != null) resetConfetti();

  // show auto logout toast
  if (
    to.name == "Login" &&
    from.name != undefined &&
    from.name != "Login" &&
    to.params["userClickedLogout"] == "false"
  ) {
    toast.error(i18n.global.t("error.auto_logout"));
  }

  // if in the previous session, the user was in a workspace other than the personal workspace,
  // pass those params in the router going forward. Only do this after checking that any workspace params
  // are not explicitly specified in the requested URL. This will lead them to the workspace's home
  // where they left off the in the previous session
  const existingActiveWorkspace = store.state["auth"]["activeWorkspace"];
  if (existingActiveWorkspace != "" && to.params.workspace != "")
    to.params.workspace = existingActiveWorkspace;

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // app has to be authenticated using third party auth if all the query params
    // match the keys in `requiredAuthKeys` and they're not empty or undefined
    let queryParams = Object.keys(to.query);
    let isThirdPartyAuth =
      requiredAuthKeys.every((key) => queryParams.includes(key)) &&
      queryParams.every(
        (key) => to.query[key] != "" && to.query[key] != undefined
      );

    if (isThirdPartyAuth) {
      // skip the login if authenticating via third party
      return;
    } else {
      // proceed to login if not authenticating via third party
      if (store.getters["auth/isAuthenticated"]) return;
      else
        return {
          name: "Login",
          params: { redirectTo: to.name, params: JSON.stringify(to.params) },
        };
    }
  }

  return;
});

router.beforeEach((to) => {
  if (to.matched.some((record) => record.meta.guest)) {
    if (store.getters["auth/isAuthenticated"])
      return { name: "Home", params: to.params };
  } else return;
});

/*
Router auth logic end
*/

// set title and meta tags
router.beforeEach((to, from) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);
  const previousNearestWithMeta = from.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  // if a route with a title was found, set the document (page) title to that value.
  if (document != null) {
    if (nearestWithTitle) {
      document.title = nearestWithTitle.meta.title;
    } else if (previousNearestWithMeta) {
      document.title = previousNearestWithMeta.meta.title;
    }
  }

  return;
});

// set workspace in vuex state if the route workspace parameter is in vuex user organizations array
router.beforeEach((to) => {
  if (store.getters["auth/isAuthenticated"]) {
    if (to.params.workspace != "" && to.params.workspace != undefined)
      store.dispatch("auth/setActiveWorkspace", to.params.workspace);
    else store.dispatch("auth/unsetActiveWorkspace");
  }
  return;
});

export default router;
export { routes };
