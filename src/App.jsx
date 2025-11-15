import React, { useState, useEffect } from 'react';
import { Scale, Clock, Gavel, Sparkles, Wand2 } from 'lucide-react';
import './App.css';
export default function App() {
  const [fadeClass, setFadeClass] = useState("fade-in"); 
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState('input'); 
  const [currentRound, setCurrentRound] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [argument, setArgument] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [scores, setScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

// The start of the fade in 
  useEffect(() => {
    setFadeClass("fade-in");
  }, []);

// Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleSubmitArgument();
    }
  }, [timeLeft, gameState]);

  const startLesson = () => {
    setFadeClass("fade-out");
    setTimeout(() => {
      setStarted(true);
    }, 800);
  };
// get ai
  const generateAIPrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Generate a thought-provoking ethical or legal debate prompt for round ${currentRound} of 3. Make round ${currentRound} ${currentRound === 1 ? 'moderately challenging' : currentRound === 2 ? 'more complex' : 'the most difficult'}. Return ONLY the debate prompt as a single question or scenario, nothing else.`
            }
          ],
        })
      });

      const data = await response.json();
      const generatedPrompt = data.content[0].text.trim();
      setPrompt(generatedPrompt);
      setGameState('playing');
      setTimeLeft(120);
      setArgument('');
    } catch (error) {
      console.error('Error generating prompt:', error);
      setPrompt();
      setGameState('playing');
      setTimeLeft(120);
    }
    setIsGenerating(false);
  };

  const useCustomPrompt = () => {
    if (!customPrompt.trim()) {
      alert('Please enter a debate topic first!');
      return;
    }
    setPrompt(customPrompt);
    setGameState('playing');
    setTimeLeft(120);
    setArgument('');
  };

  const handleSubmitArgument = async () => {
    if (!argument.trim()) {
      alert('Please write your argument before submitting!');
      return;
    }

    setGameState('judging');
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are Judge AI in a debate competition.

CASE: ${prompt}

LAWYER'S ARGUMENT:
${argument}

Evaluate this argument and provide:
1. A score out of 100
2. Brief feedback on strengths and weaknesses
3. Your verdict

Format your response EXACTLY as:
SCORE: [number]
VERDICT: [Your ruling in 2-3 sentences]
FEEDBACK: [Constructive feedback in 2-3 sentences]`
            }
          ],
        })
      });

      const data = await response.json();
      const judgeResponse = data.content[0].text;

      const scoreMatch = judgeResponse.match(/SCORE:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

      setVerdict(judgeResponse);
      setScores([...scores, score]);
      setTotalScore(totalScore + score);
      setGameState('results');
    } catch (error) {
      console.error('Error getting verdict:', error);
      setVerdict('SCORE: 75\nVERDICT: A solid argument with good reasoning.\nFEEDBACK: Consider providing more specific examples to strengthen your position.');
      setScores([...scores, 75]);
      setTotalScore(totalScore + 75);
      setGameState('results');
    }
  };

  const nextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setGameState('input');
      setCustomPrompt('');
    } else {
      setGameState('end');
    }
  };

  const restartGame = () => {
    setStarted(false);
    setGameState('input');
    setCurrentRound(1);
    setPrompt('');
    setCustomPrompt('');
    setArgument('');
    setTimeLeft(120);
    setVerdict('');
    setScores([]);
    setTotalScore(0);
    setFadeClass('fade-in');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>

      <div id="full-screen">
        {!started && (
          <main id="main-wrapper" className={fadeClass}>
            <div id="top">
              <Scale size={80} />
              <h1>Objection!</h1>
              <Gavel size={80} />
            </div>

            <p id="description">
              AI Debate Arena - Practice your argumentation skills in a safe space.
              Face Judge AI in 3 challenging rounds.
            </p>

            <button id="start-btn" onClick={startLesson}>
              Start Your Trial
            </button>
          </main>
        )}

        {started && (
          <main id="main2-wrapper">
            {/* Input Screen */}
            {gameState === 'input' && (
              <div>
                <h2 style={{fontSize: '36px', textAlign: 'center', marginBottom: '30px'}}>
                  Round {currentRound} of 3
                </h2>
                
                <div className="input-section">
                  <input
                    type="text"
                    placeholder="Enter your own debate topic here..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  
                  <div className="button-group">
                    <button className="btn btn-primary" onClick={useCustomPrompt}>
                      Use My Topic
                    </button>
                    <button className="btn btn-primary" onClick={generateAIPrompt} disabled={isGenerating}>
                      <Wand2 size={20} />
                      {isGenerating ? 'Generating...' : 'Generate AI Topic'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Playing Screen */}
            {gameState === 'playing' && (
              <div>
                <div className="round-header">
                  <div style={{fontSize: '24px', fontWeight: 'bold'}}>Round {currentRound} of 3</div>
                  <div className={`timer ${timeLeft < 30 ? 'warning' : ''}`}>
                    <Clock size={32} style={{display: 'inline', marginRight: '10px'}} />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="prompt-box">
                  <strong>THE CASE:</strong><br/><br/>
                  {prompt}
                </div>

                <div className="input-section">
                  <h3 style={{fontSize: '24px', marginBottom: '15px'}}>Your Argument:</h3>
                  <textarea
                    value={argument}
                    onChange={(e) => setArgument(e.target.value)}
                    placeholder="State your position and build your case. Use logic, evidence, and persuasive rhetoric to convince Judge AI..."
                  />
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
                    <span style={{fontSize: '16px', color: '#a0aec0'}}>{argument.length} characters</span>
                    <button 
                      className="btn btn-success" 
                      onClick={handleSubmitArgument}
                      disabled={!argument.trim()}
                    >
                      Submit to Judge
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Judging Screen */}
            {gameState === 'judging' && (
              <div style={{textAlign: 'center', paddingTop: '100px'}}>
                <Gavel size={80} style={{margin: '0 auto 30px', animation: 'bounce 1s infinite'}} />
                <h2 style={{fontSize: '36px', marginBottom: '30px'}}>Judge AI is Deliberating...</h2>
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Analyzing your argument</span>
                </div>
              </div>
            )}

            {/* Results Screen */}
            {gameState === 'results' && (
              <div>
                <h2 style={{fontSize: '36px', textAlign: 'center', marginBottom: '30px'}}>
                  Round {currentRound} Verdict
                </h2>
                
                <div className="verdict-box">
                  {verdict}
                </div>

                <div className="button-group">
                  {currentRound < 3 ? (
                    <button className="btn btn-primary" onClick={nextRound}>
                      Next Round →
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={nextRound}>
                      See Final Results
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* End Screen */}
            {gameState === 'end' && (
              <div>
                <h2 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>
                  Trial Complete!
                </h2>
                
                <div className="final-score">
                  {Math.round(totalScore / 3)}/100
                </div>
                <p style={{textAlign: 'center', fontSize: '24px', marginBottom: '40px'}}>
                  Average Score Across 3 Rounds
                </p>

                <div className="score-grid">
                  {scores.map((score, i) => (
                    <div key={i} className="score-card">
                      <div className="label">Round {i + 1}</div>
                      <div className="value">{score}</div>
                    </div>
                  ))}
                </div>

                <div className="button-group">
                  <button className="btn btn-primary" onClick={restartGame}>
                    New Trial
                  </button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </>
  );
}