import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Player from "../views/Player.vue";
import PhoneSignIn from "../views/PhoneSignIn";

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
        },
        props: route => ({ 
            experiment: route.query.experiment,
            id: route.params.id 
        })
    },
    {
        // type: the type of component invoking this path (optional)
        // id: the unique ID for the component invoking this path (optional)
        path: "/login/:id?/:type?",
        name: "Phone Sign In",
        component: PhoneSignIn,
        props: true
    },
    {
        path: "/experiment/:id?",
        name: "ABTesting",
        component: () => 
            import ("@/views/ABTesting"),
        props: true
    },
    {
        path: '/404-not-found',
        name: '404',
        component: () =>
            import ("../views/Error"),
        props: { type: '404' }
    },
    {
        // Refer to: https://stackoverflow.com/a/64186073/7870587
        path: '/:pathMatch(.*)*',
        redirect: {
            'name': '404'
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;