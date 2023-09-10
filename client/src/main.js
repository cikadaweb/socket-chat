import { createApp } from 'vue'
import App from './App.vue'

// import VueChatScroll from 'vue3-chat-scroll';
import router from './router'

const app = createApp(App)
// app.use(VueChatScroll);
app.use(router);
app.mount('#app')