export function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}

export function dragElement(element, dx, dy) {
  var x = (parseFloat(element.getAttribute("data-x")) || 0) + dx;
  var y = (parseFloat(element.getAttribute("data-y")) || 0) + dy;
  element.style.transform = "translate(" + x + "px, " + y + "px)";
  element.setAttribute("data-x", x);
  element.setAttribute("data-y", y);
}
