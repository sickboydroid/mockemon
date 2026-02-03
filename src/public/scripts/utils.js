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

export function remainingTime(targetDate) {
  return formatRemaining(targetDate - new Date());
}

function formatRemaining(ms) {
  if (ms <= 0) return "00 secs";

  let s = Math.floor(ms / 1000);

  const hrs = Math.floor(s / 3600);
  s %= 3600;
  const mins = Math.floor(s / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, "0");
  const out = [];

  if (hrs > 0) {
    out.push(`${pad(hrs)} hr${hrs === 1 ? "" : "s"}`);
    out.push(`${pad(mins)} min${mins === 1 ? "" : "s"}`);
    out.push(`${pad(secs)} secs`);
  } else if (mins > 0) {
    out.push(`${pad(mins)} min${mins === 1 ? "" : "s"}`);
    out.push(`${pad(secs)} secs`);
  } else {
    out.push(`${pad(secs)} secs`);
  }

  return out.join(" ");
}
