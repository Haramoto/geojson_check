<template>
  <div class="h-100 w-100 position-relative">
    <div id="map" class="h-100 w-100"></div>
    <div
      class="position-absolute alert alert-danger"
      v-if="hasError"
      style="top:0px;right:0px"
    >
      GeoJSON Error
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import "ol/ol.css";

@Component({})
export default class MapTag extends Vue {
  @Prop({ default: "" })
  private geojson!: string;

  private map: Map | null = null;
  private vector_source: VectorSource = new VectorSource({
    format: new GeoJSON(),
    projection: "EPSG:3857",
  });

  private vector: VectorLayer = new VectorLayer({
    source: this.vector_source,
  });

  private hasError = false;

  mounted() {
    this.map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vector,
      ],
      target: "map",
    });
  }

  /**
   * JSONの読み込み
   */
  @Watch("geojson")
  readJson() {
    if (!this.map) {
      return;
    }
    try {
      let json = JSON.parse(this.geojson);
      // GeoJSONをOpenlayersのfeatureに変換
      let features: any[] = this.vector
        .getSource()
        .getFormat()
        .readFeatures(json, { featureProjection: "EPSG:3857" });

      // featrueの削除
      this.vector.getSource().clear();
      // 新しいfeatureの表示
      this.vector.getSource().addFeatures(features);

      // 描画領域を表示
      let extent = this.vector.getSource().getExtent();
      this.map.getView().fit(extent, { maxZoom: 18 });
      this.hasError = false;
    } catch (e) {
      this.hasError = true;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
}
</style>
