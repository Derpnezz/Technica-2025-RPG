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

app.post('/api/judge-argument', async (req, res) => {
  try {
    const { prompt, argument } = req.body;
    
    if (!prompt || !argument) {
      return res.status(400).json({ error: 'Missing prompt or argument' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(
      `You are Judge Gemini, a witty and charismatic AI judge in an exciting debate competition! 🎭

CASE: ${prompt}

DEBATER'S ARGUMENT:
${argument}

Evaluate this argument with personality and flair! Provide:
1. A score out of 100
2. An entertaining verdict with some personality
3. Constructive feedback that motivates improvement

Format your response EXACTLY as:
SCORE: [number]
VERDICT: [Your entertaining ruling in 2-3 sentences with personality!]
FEEDBACK: [Constructive and encouraging feedback in 2-3 sentences]`
    );

    const verdict = result.response.text();
    const scoreMatch = verdict.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    
    res.json({ verdict, score });
  } catch (error) {
    console.error('Error judging argument:', error);
    res.status(500).json({ 
      error: 'Failed to judge argument',
      fallback: {
        verdict: 'SCORE: 75\nVERDICT: A solid argument with good reasoning! Judge Gemini approves! 🎯\nFEEDBACK: Consider providing more specific examples to strengthen your position. Keep up the great work!',
        score: 75
      }
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
