import "../styles/reset.css";
import "../styles/color.css";
import "../styles/elements.css";
import "../styles/header.css";
import "../styles/main.css";
import "../styles/controls.css";
import "../styles/question.css";

import { setupEditor } from "./components/editorPanel";
import { clamp } from "./utils";
import { setupQuestionPanel } from "./components/questionPanel";
import { setupControls } from "./components/draggable-widgets/constrols";

function setupPanels() {
  vertical_handle.addEventListener("mousedown", e => {
    e.preventDefault();
    const onMouseMove = event => {
      let leftPos = (event.clientX / window.innerWidth) * 100;
      leftPos = clamp(20, 50, leftPos);
      vertical_handle.style.left = leftPos + "%";
      content.style.gridTemplateColumns = `${leftPos}% auto`;
      horizontal_handle.style.width = 100 - leftPos + "%";
    };

    window.addEventListener("mousemove", onMouseMove);
    const onMouseRemoved = () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
    window.addEventListener("mouseup", onMouseRemoved);
  });

  horizontal_handle.addEventListener("mousedown", e => {
    e.preventDefault();
    const onMouseMove = event => {
      let gridPercentage = ((event.clientY - 60 - 12) / (window.innerHeight - 60)) * 100;
      if (gridPercentage < 20 || gridPercentage > 80) return;
      horizontal_handle.style.top = `calc(${event.clientY - 12}px)`;
      content.style.gridTemplateRows = `${gridPercentage}% auto`;
    };
    window.addEventListener("mousemove", onMouseMove);
    const onMouseRemoved = () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
    window.addEventListener("mouseup", onMouseRemoved);
  });
}

const vertical_handle = document.querySelector(".vertical-handle");
const horizontal_handle = document.querySelector(".horizontal-handle");
const content = document.querySelector("main");
setupPanels();
setupEditor();
setupQuestionPanel();
setupControls();
