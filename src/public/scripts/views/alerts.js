import Swal from "sweetalert2";
import "animate.css";
import { getInterviewStatus, leaveInterview } from "../api/api";
import { remainingTime } from "../utils";

export async function showJoiningAlert() {
  const { is_ongoing, start_time } = await getInterviewStatus();
  Swal.fire({
    title: "<strong>Hold Tight!</strong>",
    html: `
      <div class="join-meeting-alert">
        <p class="active-users">Active users: <span class="count">10</span></p>
        <p class="connection-status">Connecting with <span class="name">Ayush</span></p>
        <div class="join-countdown">
          <span class="title">Interview will start in:</span> <span class="remaining-time">${remainingTime(start_time)}</span>
        </div>
      </div>
    `,
    heightAuto: false,
    showConfirmButton: false,
    showCancelButton: true,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    cancelButtonText: "Cancel",
    cancelButtonAriaLabel: "Cancel Meeting",
    showClass: {
      popup: "animate__animated animate__fadeIn animate-very-fast",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOut animate-very-fast",
    },
    didClose: () => {
      leaveInterview();
      if (timeUpdaterInterval) clearInterval(timeUpdaterInterval);
    },
  });
  const remTimeSpan = Swal.getHtmlContainer().querySelector(
    "span.remaining-time",
  );
  const timeUpdaterInterval = setInterval(
    () => (remTimeSpan.textContent = remainingTime(start_time)),
    500,
  );
}
