import "dotenv/config";
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

async function run() {
  try {
    const result = await model.generateContent(
      "Write a poem about AI in Shakespeare style."
    );
    console.log(result.response.text());
  } catch (error) {
    console.error('Error calling Gemini API:', error);
  }
}

run();