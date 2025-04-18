import { getQuestionById } from "../problemsHelper";

const question = document.querySelector("div.question-content");

export function setupQuestionPanel() {
  let id = Math.floor(Math.random() * 10) + 1;
  while (getQuestionById(id) === undefined) id = Math.floor(Math.random() * 10) + 1;
  let { title, difficulty, content } = getQuestionById(id);
  question.innerHTML = `<h2>${title}</h2>
  <div class="question-body">${content}</div>`;
}
