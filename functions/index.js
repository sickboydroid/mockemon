/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { info } from "firebase-functions/logger";

export const helloWorld = onRequest((request, response) => {
  info("Hello logs!", { structuredData: true });
  response.send("Hello sucker");
});
