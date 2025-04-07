import "../styles/reset.css";
import "../styles/color.css";
import "../styles/elements.css";
import "../styles/header.css";
import "../styles/main.css";
import "../styles/controls.css";
import "../styles/question.css";
import "../styles/videoio.css";

import { clamp } from "./utils";
import { setupEditor } from "./components/editorPanel";
import { setupQuestionPanel } from "./components/questionPanel";
import { setupControls } from "./components/draggable-widgets/controls";
import { setupVideoIO } from "./components/draggable-widgets/videoIO";
import { connect } from "./connection/connectionManager";

function setupPanels() {
  vertical_handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const onMouseMove = (event) => updateGridCols(event.clientX);
    window.addEventListener("mousemove", onMouseMove);
    const onMouseRemoved = () =>
      window.removeEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseRemoved);
  });

  horizontal_handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const onMouseMove = (event) => updateHandleAndGridRows(event.clientY);
    window.addEventListener("mousemove", onMouseMove);
    const onMouseRemoved = () =>
      window.removeEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseRemoved);
  });
}

function updateHandleAndGridRows(mouseY) {
  // TODO: When rejecting value to mouseY, animate color of handle
  let gridPercentage =
    ((mouseY - HEADER_HEIGHT) / (window.innerHeight - HEADER_HEIGHT)) * 100;
  if (gridPercentage < 20 || gridPercentage > 80) return;
  horizontal_handle.style.top = `calc(${mouseY}px)`;
  content.style.gridTemplateRows = `${gridPercentage}% auto`;
}

function updateGridCols(mouseX) {
  // TODO: When reassigning value to mouseX, animate color of handle
  if (mouseX < QUESTION_PANEL_MIN_WIDTH) mouseX = QUESTION_PANEL_MIN_WIDTH;
  if (mouseX > QUESTION_PANEL_MAX_WIDTH) mouseX = QUESTION_PANEL_MAX_WIDTH;
  let leftPos = (mouseX / window.innerWidth) * 100;
  leftPos = clamp(0, 60, leftPos);
  vertical_handle.style.left = leftPos + "%";
  content.style.gridTemplateColumns = `${leftPos}% auto`;
  horizontal_handle.style.width = 100 - leftPos + "%";
}

function updateGridLayout() {
  const initialY = 0.8 * (window.innerHeight - HEADER_HEIGHT);
  const initialX = 0.4 * window.innerWidth;
  updateHandleAndGridRows(initialY);
  updateGridCols(initialX);
}

const QUESTION_PANEL_MIN_WIDTH = 420; // in px
const QUESTION_PANEL_MAX_WIDTH = 700; // in px
const vertical_handle = document.querySelector("div.handle.vertical");
const horizontal_handle = document.querySelector("div.handle.horizontal");
const content = document.querySelector("main");
const HEADER_HEIGHT = 60; // TODO: Get this value from CSS variable

updateGridLayout();
setupPanels();
setupQuestionPanel();
setupControls();
setupVideoIO();
setupEditor();
window.addEventListener("resize", updateGridLayout);
connect();
