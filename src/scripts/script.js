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
import { setupControls } from "./components/draggable-widgets/controls";

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
      updateHandleAndGridRows(event.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    const onMouseRemoved = () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
    window.addEventListener("mouseup", onMouseRemoved);
  });
}

function updateHandleAndGridRows(mouseY) {
  let gridPercentage = ((mouseY - HEADER_HEIGHT) / (window.innerHeight - HEADER_HEIGHT)) * 100;
  if (gridPercentage < 20 || gridPercentage > 80) return;
  horizontal_handle.style.top = `calc(${mouseY}px)`;
  content.style.gridTemplateRows = `${gridPercentage}% auto`;
}

const vertical_handle = document.querySelector("div.handle.vertical");
const horizontal_handle = document.querySelector("div.handle.horizontal");
const content = document.querySelector("main");
const HEADER_HEIGHT = 60; // TODO: Get this value from CSS variable
const initialY = 0.8 * (window.innerHeight - HEADER_HEIGHT);

setupPanels();
updateHandleAndGridRows(initialY);
setupEditor();
setupQuestionPanel();
setupControls();
