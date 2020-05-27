import "codemirror/lib/codemirror.css";
import "bootstrap/dist/css/bootstrap.css";

import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
