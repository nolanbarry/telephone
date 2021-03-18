import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'animate.css';

Vue.config.productionTip = false

let data = {
  history: []
}

new Vue({
  router,
  data,
  render: h => h(App)
}).$mount('#app')
