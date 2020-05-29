<template>
  <div class="d-flex w-100 h-100 flex-column">
    <div class="row no-gutters" style="height: 40px;">
      <button class="btn btn-primary" @click="format">Format</button>
    </div>
    <codemirror v-model="code" :options="cmOptions" ref="cm" class="h-100" />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop } from "vue-property-decorator";
import { codemirror } from "vue-codemirror";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/edit/continuelist.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/json-lint";
import { Throttle } from "lodash-decorators";

const prettier = require("prettier/standalone");
const prettierBabylon = require("prettier/parser-babel");

const jsonlint = require("jsonlint-mod");
(window as any).jsonlint = jsonlint;

@Component({
  components: {
    codemirror,
  },
})
export default class EditorTag extends Vue {
  @Prop({ default: "" })
  private value!: string;

  private cmOptions = {
    // codemirror options
    mode: "application/json",
    theme: "default",
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    cursorScrollMargin: 50,
    autoCloseBrackets: true,
    foldGutter: true,
    gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
    lint: true,
  };

  @Throttle(500)
  @Emit()
  private input(value: string) {}

  private get code(): string {
    return this.value;
  }

  private set code(value: string) {
    this.input(value);
  }

  private format() {
    let value = prettier.format(this.code, {
      parser: "json",
      plugins: [prettierBabylon],
    });
    this.code = value;
    this.$forceUpdate();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: Monaco, "Andale Mono", "Lucida Console",
    "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;
  height: 100%;
  text-align: left;

  .cm-dk-whitespace-space,
  .cm-dk-whitespace-tab,
  .cm-dk-whitespace-leading-space,
  .cm-dk-whitespace-leading-tab,
  .cm-dk-whitespace-trailing-space,
  .cm-dk-whitespace-trailing-tab {
    position: relative;
    &:before {
      content: "";
      position: absolute;
      display: block;
      height: 0;
      top: 50%;
      border-radius: 1ex;
      height: 0.2ex;
    }
  }
  .cm-dk-whitespace-space:before,
  .cm-dk-whitespace-leading-space:before,
  .cm-dk-whitespace-trailing-space:before {
    left: 50%;
    width: 0.2ex;
    margin-left: -0.1ex;
    min-width: 2px;
    min-height: 2px;
  }
  .cm-dk-whitespace-tab:before,
  .cm-dk-whitespace-leading-tab:before,
  .cm-dk-whitespace-trailing-tab:before {
    left: 0.2ex;
    right: 0.2ex;
    min-width: 2px;
    min-height: 1px;
  }
  .cm-dk-whitespace-space:before,
  .cm-dk-whitespace-tab:before {
    background-color: #c8c8c8;
  }
  .cm-dk-whitespace-leading-space:before,
  .cm-dk-whitespace-leading-tab:before {
    background-color: #c8c8c8;
  }
  .cm-dk-whitespace-trailing-space:before,
  .cm-dk-whitespace-trailing-tab:before {
    background-color: red;
  }
  .cm-as-multibyte {
    border-bottom: 2px dotted #c8c8c8;
  }
}
</style>
