import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Test from "@/pages/Test.vue";
import Editor from "@/pages/Editor.vue";
import Player from "@/pages/Player.vue";
import PhoneSignIn from "@/pages/PhoneSignIn";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
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
  },
  {
    // type: the type of component invoking this path (optional)
    // id: the unique ID for the component invoking this path (optional)
    path: "/login/:id?/:type?",
    name: "PhoneSignIn",
    component: PhoneSignIn,
    // passing props to route components
    // https://router.vuejs.org/guide/essentials/passing-props.html#passing-props-to-route-components
    props: true,
  },
  {
    path: "/experiment/:id",
    name: "ABTesting",
    // lazy loading of routes
    // https://router.vuejs.org/guide/advanced/lazy-loading.html#grouping-components-in-the-same-chunk
    component: () => import("@/pages/ABTesting"),
    props: true,
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
  routes,
});

export default router;
