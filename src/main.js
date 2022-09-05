import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import JsonCSV from 'vue-json-csv'
import vSelect from 'vue-select'

Vue.component('v-select', vSelect)
 
Vue.component('downloadCsv', JsonCSV)

import { BootstrapVue } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import 'vue-select/dist/vue-select.css';

// Install BootstrapVue
Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
