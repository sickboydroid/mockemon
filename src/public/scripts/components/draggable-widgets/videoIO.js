import interact from "interactjs";
import { dragElement } from "../../utils";
export function setupVideoIO() {
  // setup video controls
  // TODO: Make the vide-container resizable
  interact(".video-container").draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: document.querySelector("main"),
      }),
    ],
    listeners: {
      move: event => dragElement(document.querySelector(".video-container"), event.dx, event.dy),
    },
  });
}
