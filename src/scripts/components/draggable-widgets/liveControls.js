import interact from "interactjs";
import { clampElementInParent, dragElement } from "../../utils";
import {
  pauseOutputAudio,
  pauseOutputVideo,
  resumeOutputAudio,
  resumeOutputVideo,
} from "../../connection/signallingHelper";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

export function setupLiveControls() {
  setupListeners();
  setupTooltips();
  setupDeviceLists();
  makeLiveControlsDraggable();
}

function makeLiveControlsDraggable() {
  // Keep live controls within main
  new ResizeObserver(() =>
    clampElementInParent(liveControls, document.querySelector("main"))
  ).observe(liveControls);

  // drag behavior of live-controls
  interact(".drag-handle").draggable({
    inertia: true,
    listeners: {
      move: event =>
        dragElement(
          document.querySelector(".live-controls"),
          event.dx,
          event.dy,
          document.querySelector("main")
        ),
    },
  });
}

function updateDevicesList(selectElement, devices) {
  selectElement.innerHTML = "";
  for (const device of devices) {
    const deviceOption = document.createElement("option");
    deviceOption.label = device.label;
    deviceOption.value = device.deviceId;
    selectElement.add(deviceOption);
  }
}

async function getConnectedDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type);
}

async function updateCameraList() {
  const cameraList = await getConnectedDevices("videoinput");
  updateDevicesList(document.querySelector("select#camera-list"), cameraList);
}

async function updateMicList() {
  const microphoneList = await getConnectedDevices("audioinput");
  updateDevicesList(document.querySelector("select#mic-list"), microphoneList);
}

function setupTooltips() {
  tippy(swapRoles, {
    content: "Swap Roles",
  });

  tippy(pointerControl, {
    content: "Pointer",
  });
  tippy(audioControl, {
    content: "Audio",
  });
  tippy(videoControl, {
    content: "Video",
  });
}

function setupListeners() {
  expandControls.addEventListener("click", event => {
    lowerControls.classList.toggle("hidden");
    document.querySelector(".row-1").classList.toggle("hidden");
    document.querySelector(".row-2").classList.toggle("hidden");
    expandControls.classList.toggle("expanded");
  });

  audioControl.addEventListener("click", event => {
    if (audioControl.classList.contains("on")) {
      pauseOutputAudio();
    } else {
      resumeOutputAudio();
    }
    audioControl.classList.toggle("on");
  });

  videoControl.addEventListener("click", event => {
    if (videoControl.classList.contains("on")) {
      pauseOutputVideo();
    } else {
      resumeOutputVideo();
    }
    videoControl.classList.toggle("on");
  });

  pointerControl.addEventListener("click", event => {
    pointerControl.classList.toggle("on");
  });
}

function setupDeviceLists() {
  // Listen for changes to media devices and update the list accordingly
  navigator.mediaDevices.addEventListener("devicechange", event => {
    updateCameraList();
    updateMicList();
  });

  updateCameraList();
  updateMicList();
}

const audioControl = document.querySelector(
  ".live-controls .upper-controls .audio"
);
const videoControl = document.querySelector(
  ".live-controls .upper-controls .video"
);
const pointerControl = document.querySelector(
  ".live-controls .upper-controls .pointer"
);
const expandControls = document.querySelector(
  ".live-controls .expand-controls"
);
const swapRoles = document.querySelector(
  ".live-controls .upper-controls .swap-roles"
);
const lowerControls = document.querySelector(".live-controls .lower-controls");
const liveControls = document.querySelector(".live-controls");
