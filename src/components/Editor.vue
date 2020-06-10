<template>
	<div class="d-flex w-100 h-100 flex-column">
		<div class="row no-gutters" style="height: 40px;">
			<button class="btn btn-primary" @click="format">Format</button>
		</div>
		<codemirror v-model="code" :options="cmOptions" ref="cm" class="h-100" />
	</div>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop, Ref } from "vue-property-decorator";
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

	@Ref()
	private cm!: any;

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

	private mounted() {
		this.cm.codemirror.addOverlay(
			(() => {
				// States for the overlay mode, which is supposed to be stateless and so can't use the state functionality provided by CodeMirror
				let _appendSpace = false,
					_isLeading = true,
					_isTrailing = false,
					_trailingOffset: number = 0;

				return {
					token: (stream: any, state: any) => {
						var ch,
							trailing,
							ateCode = false,
							tokenStyle = "",
							exMatchText =
								"Ａ-Ｚａ-ｚ０-９”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞＿－＾￥＠；：　",
							RegExMatchText = new RegExp("[" + exMatchText + "]+$"),
							RegMatchText = new RegExp("[ \t" + exMatchText + "]+$");

						// Start of line: reset state
						if (stream.sol()) {
							_isLeading = true;
							_isTrailing = false;

							_trailingOffset = stream.string.length;
							trailing = stream.string.match(/[ \t]+$/);
							if (trailing) {
								_trailingOffset -= trailing[0].length;
							}
						}

						// Peek ahead one character at a time
						// Wrappinsg the assignment in a Boolean makes JSLint happy
						while (Boolean((ch = stream.peek()))) {
							if (ch.match(RegMatchText)) {
								if (ateCode) {
									// Return now to mark all code seen so far as not necessary to highlight
									return null;
								}
								// Eat the whitespace
								stream.next();

								// Test if this is a trailing whitespace
								if (!_isLeading && !_isTrailing) {
									_isTrailing = stream.pos >= _trailingOffset;
								}

								// CodeMirror merges consecutive tokens with the same style
								// There's a setting called "flattenSpans" to prevent that, but it's for the whole editor*
								// So instead we simply append a space character to the style every other time
								// This disables CodeMirror's string comparison while having no effect on the CSS class
								// *changed in https://github.com/marijnh/CodeMirror/commit/221a1e4070d503f4597f7823e4f2cf68ba884cdf
								_appendSpace = !_appendSpace;

								if (ch.match(RegExMatchText)) {
									tokenStyle += "as-multibyte";
								} else {
									tokenStyle += "dk-whitespace-";
									tokenStyle += _isLeading
										? "leading-"
										: _isTrailing
										? "trailing-"
										: "";
									tokenStyle += ch === " " ? "space" : "tab";
									tokenStyle += _appendSpace ? " " : "";
								}

								return tokenStyle;
							} else {
								stream.next();
								ateCode = true;
								_isLeading = false;
							}
						}
						return null;
					},
				};
			})()
		);
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
