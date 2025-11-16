import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate a debate topic
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(
      "Generate a unique debate topic appropriate for high school students."
    );

    res.json({ prompt: result.response.text() });
  } catch (err) {
    console.error(err);
    res.json({
      error: true,
      fallback:
        "Should social media companies be held accountable for misinformation?"
    });
  }
});

// Judge an argument
app.post("/api/judge-argument", async (req, res) => {
  const { prompt, argument } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(`
You are Judge AI. Score this argument from 0–100.
Prompt: ${prompt}
Argument: ${argument}

Return JSON strictly in this format:
{
  "score": number,
  "verdict": "short verdict",
  "feedback": "one paragraph"
}
`);

    const text = result.response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      // fallback if AI response is invalid
      json = {
        score: 75,
        verdict: "Decent argument.",
        feedback: "Try adding stronger supporting evidence."
      };
    }

    res.json(json);
  } catch (err) {
    console.error(err);
    res.json({
      error: true,
      score: 75,
      verdict: "Decent argument.",
      feedback: "Try adding stronger supporting evidence."
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
