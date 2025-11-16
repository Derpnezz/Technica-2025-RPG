import "dotenv/config";
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

const apiKey = 'AIzaSyB3QdxUohqDhExOFXfWh5kiD_rSahva8HI';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

async function run() {
  const result = await model.generateContent(
    "Write a poem about AI in Shakespeare style."
  );

  console.log(result.response.text());
}

run();
