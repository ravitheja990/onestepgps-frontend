import Vue from 'vue';
import App from './App.vue';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false;

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDa2EPxZ1_2Oa4unKY9aP6A2Kp6A5guJUo', // Replace with your actual Google Maps API key
    libraries: 'places', // Other libraries if required
  },
});

new Vue({
  render: h => h(App),
}).$mount('#app');