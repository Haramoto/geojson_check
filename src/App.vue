<template>
  <div id="app" class="vh-100">
    <div class="row h-100 no-gutters">
      <div class="col h-100">
        <Map :geojson="geojson" />
      </div>
      <div class="col h-100">
        <Editor v-model="geojson" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Map from "./components/Map.vue";
import Editor from "./components/Editor.vue";

@Component({
  components: {
    Map,
    Editor,
  },
})
export default class App extends Vue {
  private geojson = "{}";
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
