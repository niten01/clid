import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import Toast, {POSITION} from "vue-toastification";
import "vue-toastification/dist/index.css";

createApp(App)
  .use(Toast, {
    position: POSITION.TOP_CENTER,

    newestOnTop: true,
    maxToasts: 5,
    timeout: 2800,

    transition: "Vue-Toastification__slideBlurred",

    showCloseButtonOnHover: true
  })

  .mount('#app')
