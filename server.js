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
    
    // Ask Gemini to return a strict JSON object so the frontend can render structured feedback
    const promptText = `You are Judge Gemini, a witty and charismatic AI judge in an exciting debate competition. Respond in JSON only.

CASE: ${prompt}

DEBATER_ARGUMENT:
${argument}

Evaluate the argument and return a JSON object with the following keys:
- score: integer between 0 and 100
- verdict: short string (2-3 sentences) with personality
- feedback: short, actionable tips (2-3 sentences)
- highlights: array of 1-3 short strings pointing out strengths or weaknesses
- references: optional array of objects with {title, url} if appropriate (can be empty)

Return ONLY valid JSON (no extra text).`; 

    const result = await model.generateContent(promptText);
    const raw = result.response.text();

    // Try to parse as JSON. If parsing fails, try to extract a JSON block.
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // attempt to extract JSON substring
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch (e2) { parsed = null; }
      }
    }

    if (!parsed) {
      console.warn('Failed to parse Gemini JSON response, falling back to text parsing');
      // fallback: try to extract a numeric score and return minimal structure
      const scoreMatch = raw.match(/(SCORE:\s*)(\d{1,3})/i) || raw.match(/(\b)(\d{1,3})(\/100)/);
      const score = scoreMatch ? Number(scoreMatch[2]) : 70;
      return res.json({
        verdict: raw,
        score
      });
    }

    // Ensure types and bounds
    const score = Number(parsed.score || 0);
    parsed.score = Math.max(0, Math.min(100, isNaN(score) ? 0 : score));

    res.json(parsed);
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
