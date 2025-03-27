import { EditorView } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {} from "@codemirror/commands";

export function setupEditor() {
  const editorTheme = EditorView.theme({
    "&": {
      height: "100%",
      width: "100%",
    },
  });

  const view = new EditorView({
    doc: `function solve() {\n\tconsole.log("Hello, World!");\n}`,
    parent: document.querySelector(".editor"),
    extensions: [basicSetup, javascript(), autocompletion(), editorTheme, EditorView.lineWrapping],
  });
}
