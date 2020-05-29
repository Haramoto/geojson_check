<template>
  <div class="h-100 w-100 position-relative">
    <div id="map" class="h-100 w-100"></div>
    <div
      class="position-absolute alert alert-danger"
      v-if="hasError"
      style="top: 0px; right: 0px;"
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
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";

import "ol/ol.css";

const color = "#543f32";

@Component({})
export default class MapTag extends Vue {
  @Prop({ default: "" })
  private geojson!: string;

  private map: Map | null = null;
  private vectorSource = new VectorSource({
    format: new GeoJSON(),
  });

  private vector = new VectorLayer({
    source: this.vectorSource,
    style: this.styleFunction as any,
  });

  private hasError = false;

  private mounted() {
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
  private readJson() {
    if (!this.map) {
      return;
    }
    try {
      const json = JSON.parse(this.geojson);
      // GeoJSONをOpenlayersのfeatureに変換
      const features: any[] = this.vector
        .getSource()
        .getFormat()
        .readFeatures(json, { featureProjection: "EPSG:3857" });

      // featrueの削除
      this.vector.getSource().clear();
      // 新しいfeatureの表示
      this.vector.getSource().addFeatures(features);

      // 描画領域を表示
      const extent = this.vector.getSource().getExtent();
      this.map
        .getView()
        .fit(extent, { maxZoom: 18, padding: [50, 50, 50, 50] });
      this.hasError = false;
    } catch (e) {
      this.hasError = true;
    }
  }

  private styleFunction(feature: Feature): Style {
    if (
      feature.getGeometry().getType() === "Point" ||
      feature.getGeometry().getType() === "MultiPoint"
    ) {
      return new Style({
        text: new Text({
          text: "\uF041",
          font: "normal 35px FontAwesome",
          fill: new Fill({
            color,
          }),
        }),
      });
    }
    return new Style({
      stroke: new Stroke({
        width: 3,
        color,
      }),
      fill: new Fill({
        color: "rgba(1,1,1,0.2)",
      }),
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
}
</style>
