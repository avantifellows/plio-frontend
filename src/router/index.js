import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Editor from "@/pages/Editor.vue";
import Player from "@/pages/Player.vue";
import Plio from "@/pages/Embeds/Plio.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Login from "@/pages/Login";
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
    path: "/:org?/home",
    name: "Home",
    component: Home,
    props: true,
    meta: {
      requiresAuth: true,
      title: "Home - Plio",
    },
  },
  {
    path: "/:org?/edit/:plioId",
    name: "Editor",
    component: Editor,
    props: true,
    beforeEnter: restrictUnapprovedUser,
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
    component: Login,
    props: true,
    meta: {
      guest: true,
      title: "Login - Plio",
    },
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
      plioId: route.params.plioId,
      org: route.params.org,
      thirdPartyUniqueId: route.query.unique_id,
      thirdPartyApiKey: route.query.api_key,
    }),
    meta: {
      requiresAuth: true,
      title: "Player - Plio",
    },
  },
  {
    path: "/:org?/plio/:plioId",
    name: "Plio",
    component: Plio,
    props: (route) => ({
      plioId: route.params.plioId,
      org: route.params.org,
      thirdPartyUniqueId: route.query.unique_id,
      thirdPartyApiKey: route.query.api_key,
    }),
    meta: {
      title: "Plio",
    },
  },
  {
    path: "/:org?/analyse/:plioId",
    name: "Dashboard",
    component: Dashboard,
    props: true,
    beforeEnter: restrictUnapprovedUser,
    meta: {
      requiresAuth: true,
      title: "Dashboard - Plio",
    },
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

router.beforeEach((to, from) => {
  // clear all toasts whenever the route changes
  toast.clear();

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
  // pass those params in the router going forward. Only do this after checking that any org params
  // are not explicitly specified in the requested URL. This will lead them to the org workspace's home
  // where they left off the in the previous session
  const existingActiveWorkspace = store.state["auth"]["activeWorkspace"];
  if (existingActiveWorkspace != "" && to.params.org != "")
    to.params.org = existingActiveWorkspace;

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

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title;
  } else if (previousNearestWithMeta) {
    document.title = previousNearestWithMeta.meta.title;
  }

  return;
});

// set organization in vuex state if the route org parameter is in vuex user organizations array
router.beforeEach((to) => {
  if (store.getters["auth/isAuthenticated"]) {
    if (to.params.org != "" && to.params.org != undefined)
      store.dispatch("auth/setActiveWorkspace", to.params.org);
    else store.dispatch("auth/unsetActiveWorkspace");
  }
  return;
});

function restrictUnapprovedUser(to) {
  if (!store.getters["auth/isUserApproved"])
    return { name: "Home", params: { org: to.params.org }, replace: true };
  else return;
}

export default router;
export { routes };
