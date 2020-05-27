<template>
  <div id="map"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

import "ol/ol.css";

@Component
export default class MapTag extends Vue {
  mounted() {
    let map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: "map",
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
  width: 600px;
  height: 600px;
}
</style>
