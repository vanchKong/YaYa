import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import TooltipExtends from '@/components/common/Tooltip'

import './assets/main.css'

// window.addEventListener('contextmenu', (e) => e.preventDefault(), false)

Vue.use(PiniaVuePlugin)
Vue.use(TooltipExtends)

new Vue({
	router,
	pinia: createPinia(),
	render: (h) => h(App),
}).$mount('#app')
