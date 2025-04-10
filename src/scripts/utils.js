export function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}

export function dragElement(element, dx, dy, parent = null) {
  var x = (parseFloat(element.getAttribute("data-x")) || 0) + dx;
  var y = (parseFloat(element.getAttribute("data-y")) || 0) + dy;
  element.style.transform = "translate(" + x + "px, " + y + "px)";
  element.setAttribute("data-x", x);
  element.setAttribute("data-y", y);
  if (parent) clampElementInParent(element, parent);
}

export function clampElementInParent(element, parent) {
  const elRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  let dx = 0;
  let dy = 0;

  if (elRect.left < parentRect.left) dx = parentRect.left - elRect.left;
  if (elRect.top < parentRect.top) dy = parentRect.top - elRect.top;
  if (elRect.right > parentRect.right) dx = parentRect.right - elRect.right;
  if (elRect.bottom > parentRect.bottom) dy = parentRect.bottom - elRect.bottom;

  if (dx !== 0 || dy !== 0) {
    const x = (parseFloat(element.getAttribute("data-x")) || 0) + dx;
    const y = (parseFloat(element.getAttribute("data-y")) || 0) + dy;

    element.style.transform = `translate(${x}px, ${y}px)`;
    element.setAttribute("data-x", x);
    element.setAttribute("data-y", y);
  }
}
