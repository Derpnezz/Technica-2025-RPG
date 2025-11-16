import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json());

app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { currentRound } = req.body;
    
    if (!currentRound || currentRound < 1 || currentRound > 3) {
      return res.status(400).json({ error: 'Invalid round number' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(
      `Generate a thought-provoking ethical or legal debate prompt for round ${currentRound} of 3. Make round ${currentRound} ${currentRound === 1 ? 'moderately challenging' : currentRound === 2 ? 'more complex' : 'the most difficult'}. Return ONLY the debate prompt as a single question or scenario, nothing else.`
    );
    
    const prompt = result.response.text().trim();
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ 
      error: 'Failed to generate prompt',
      fallback: 'Should social media companies be held legally responsible for misinformation spread on their platforms?'
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

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Gemini API server running on http://localhost:${PORT}`);
});
