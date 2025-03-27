import interact from "interactjs";
import { dragElement } from "../../utils";

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
        restriction: document.querySelector("main"),
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
