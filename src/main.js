import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import i18n from './i18n'

const app = createApp(App).use(store).use(router)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(i18n)
app.mount('#app')