/**
 * Abstraction for fetching and searching problems
 * I might change the way questions are fetched in future
 */

import QuestionsJSON from "/assets/sample-questions.json";

function parseJSON() {
  console.log(QuestionsJSON["1"]);
}

/**
 * Returns 10 matches for the input text
 * @param {string} text
 * @return {string[]}
 */
function query(text) {}

/**
 * Returns the question with specified id (which is essentially the question number)
 * @param {number} id
 * @return {object}
 */
export function getQuestionById(id) {
  return QuestionsJSON[id];
}
