import interact from "interactjs";
import { dragElement } from "../../utils";
import {
  pauseOutputAudio,
  pauseOutputVideo,
  resumeOutputAudio,
  resumeOutputVideo,
} from "../../connection/signallingHelper";

function getRestrictions() {
  const mainRect = document.querySelector("main").getBoundingClientRect();
  const liveControlsRect = document
    .querySelector(".live-controls")
    .getBoundingClientRect();
  const dragHandleRect = document
    .querySelector(".drag-handle")
    .getBoundingClientRect();
  return {
    top: mainRect.top + 10,
    left: mainRect.left + 10,
    bottom: mainRect.bottom - 10,
    right: mainRect.right - liveControlsRect.width + dragHandleRect.width,
  };
}

export function setupLiveControls() {
  // drag behavior of live-controls
  interact(".drag-handle").draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: getRestrictions,
      }),
    ],
    listeners: {
      move: (event) =>
        dragElement(
          document.querySelector(".live-controls"),
          event.dx,
          event.dy
        ),
    },
  });
}

const audioControl = document.querySelector(".live-controls .audio");
const videoControl = document.querySelector(".live-controls .video");
const pointerControl = document.querySelector(".live-controls .pointer");

audioControl.addEventListener("click", (event) => {
  if (audioControl.classList.contains("on")) {
    pauseOutputAudio();
  } else {
    resumeOutputAudio();
  }
  audioControl.classList.toggle("on");
});

videoControl.addEventListener("click", (event) => {
  if (videoControl.classList.contains("on")) {
    pauseOutputVideo();
  } else {
    resumeOutputVideo();
  }
  videoControl.classList.toggle("on");
});

pointerControl.addEventListener("click", (event) => {
  pointerControl.classList.toggle("on");
});
