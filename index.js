require('dotenv').config()
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

let speechToText = new SpeechToTextV1({
  username: process.env.SPEECH_TO_TEXT_USERNAME,
  password: process.env.SPEECH_TO_TEXT_PASSWORD,
  url: process.env.SPEECH_TO_TEXT_URL
});

console.log("success", process.env);
