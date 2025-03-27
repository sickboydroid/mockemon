import interact from "interactjs";
import { dragElement } from "../../utils";

function getRestrictions() {
  const mainRect = document.querySelector("main").getBoundingClientRect();
  const liveControlsRect = document.querySelector(".live-controls").getBoundingClientRect();
  const dragHandleRect = document.querySelector(".drag-handle").getBoundingClientRect();
  return {
    top: mainRect.top + 10,
    left: mainRect.left + 10,
    bottom: mainRect.bottom - 10,
    right: mainRect.right - liveControlsRect.width + dragHandleRect.width,
  };
}

export function setupLiveControls() {
  // Click event listeners
  [pointerControl, audioControl, videoControl].forEach(control =>
    control.addEventListener("click", event => {
      control.classList.toggle("on");
    })
  );

  // drag behavior of live-controls
  interact(".drag-handle").draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: getRestrictions,
      }),
    ],
    listeners: {
      move: event => dragElement(document.querySelector(".live-controls"), event.dx, event.dy),
    },
  });
}

const audioControl = document.querySelector(".live-controls .audio");
const videoControl = document.querySelector(".live-controls .video");
const pointerControl = document.querySelector(".live-controls .pointer");
