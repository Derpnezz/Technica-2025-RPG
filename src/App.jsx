import React, { useState, useEffect } from 'react';
import { Scale, Clock, Gavel, Sparkles, Wand2, Trophy, Zap, Star } from 'lucide-react';
import './App.css';
import Header from './components/Header';
import FeedbackToast from './components/FeedbackToast';
import { parseVerdict } from './utils/feedback';
import Storyboard from './components/Storyboard';
import { SAMPLE_CASES } from './data/storyboards/sampleCase';


const API_URL = 'http://localhost:3000/api';


export default function App() {
  const [fadeClass, setFadeClass] = useState("fade-in");
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState('input'); // input, playing, judging, results, end
  const [currentRound, setCurrentRound] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [argument, setArgument] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [scores, setScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ open: false, content: null });
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);

  // Initial fade in
  useEffect(() => {
    setFadeClass("fade-in");
  }, []);

  // Timer countdown
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
      setShowTutorial(true);
    }, 800);
  };
  const generateAIPrompt = async () => {
    setIsGenerating(true);
    setCustomPrompt(''); // Clear the custom prompt input
    try {

      const response = await fetch(`${API_URL}/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRound })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setPrompt(data.fallback || 'Should social media companies be held legally responsible for misinformation spread on their platforms?');
      } else {
        setPrompt(data.prompt);
      }
      
      setGameState('playing');
      setTimeLeft(120);
      setArgument('');
    } catch (error) {
      console.error('Error generating prompt:', error);
      setPrompt('Should social media companies be held legally responsible for misinformation spread on their platforms?');
      setGameState('playing');
      setTimeLeft(120);
    }
    setIsGenerating(false);
  };

  const useCustomPrompt = () => {
    if (!customPrompt.trim()) {
      setToast({ open: true, content: { type: 'error', title: 'Missing topic', message: 'Please enter a debate topic before using it.' } });
      return;
    }
    setPrompt(customPrompt);
    setGameState('playing');
    setTimeLeft(120);
    setArgument('');
  };

  const handleSubmitArgument = async () => {
    if (!argument.trim()) { // warns the user to enter something 
      setToast({ open: true, content: { type: 'error', title: 'Empty argument', message: 'Write your argument before submitting so Judge AI can evaluate it.' } });
      return;
    }


    setGameState('judging');
    
    try {
      const response = await fetch(`${API_URL}/judge-argument`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, argument })
      });
      
      const data = await response.json();

      
      // normalize response: server returns structured JSON when available
      const parsedData = data.error ? data.fallback : data;
      const feedback = parseVerdict(parsedData);
      if (feedback.score >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Present verdict text in the results box (prefer human-friendly fields)
      const verdictText = parsedData.verdict || (typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData, null, 2));
      const feedbackText = parsedData.feedback || feedback.message || '';

      setVerdict(`${verdictText}\n\nFEEDBACK: ${feedbackText}`);
      setScores([...scores, feedback.score]);
      setTotalScore(totalScore + feedback.score);
      setGameState('results');

      setToast({ open: true, content: { type: feedback.score >= 75 ? 'success' : 'info', title: feedback.title, message: feedback.message } });
    } catch (error) {
      console.error('Error getting verdict:', error);
      // Fallback friendly feedback
      const fallback = { score: 75, title: 'Score: 75/100', message: 'A solid argument. Tip: add a concrete example to strengthen your claims.' };
      setVerdict('SCORE: 75\nVERDICT: A solid argument with good reasoning!\nFEEDBACK: Consider providing more specific examples to strengthen your position.');
      setScores([...scores, fallback.score]);
      setTotalScore(totalScore + fallback.score);
      setGameState('results');
      setToast({ open: true, content: { type: 'info', title: fallback.title, message: fallback.message } });
    }
  };

  const nextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setGameState('input');
      setCustomPrompt('');
      setPrompt('');
      setArgument('');
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

  const progressPercent = Math.max(0, Math.min(100, Math.round((timeLeft / 120) * 100)));

  return (
    <>
      <div id="full-screen">
  <Header onOpenTutorial={() => setShowTutorial(true)} onOpenStory={() => setShowStoryboard(true)} />
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
              <div className="playingdiv">
                <div style={{width: '100%'}}>
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

                  <div className="playing-extra" style={{textAlign: 'center'}}>
                    <div className="progress-wrap">
                      <div className="progress-bar" aria-hidden>
                        <div className="progress-fill" style={{width: `${progressPercent}%`}} />
                      </div>
                    </div>
                    <div style={{marginTop: 8, color: 'rgba(255,255,255,0.8)'}}>Time remaining: {formatTime(timeLeft)}</div>
                  </div>

                  <div className="input-section2">
                    <h3 style={{fontSize: '24px', marginBottom: '15px', textAlign: 'center'}}>Your Argument:</h3>
                    <textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      placeholder="State your position and build your case. Use logic, evidence, and persuasive rhetoric to convince Judge AI..."
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', width: '85%', margin: '15px auto 0'}}>
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
              </div>
            )}

            {/* Judging Screen */}
            {gameState === 'judging' && (
              <div style={{textAlign: 'center', paddingTop: '100px'}}>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <Gavel size={80} style={{margin: '0 auto 30px', animation: 'bounce 1s infinite', color: '#ffd43b'}} />
                  <Sparkles size={40} style={{position: 'absolute', top: 0, right: -20, color: '#667eea', animation: 'pulse 2s infinite'}} />
                </div>
                <h2 style={{fontSize: '36px', marginBottom: '30px'}}>⚖️ Judge Gemini is Deliberating...</h2>
                <div className="loading">
                  <div className="spinner"></div>
                  <span>✨ Analyzing your argument with AI magic...</span>
                </div>
              </div>
            )}

            {/* Results Screen */}
            {gameState === 'results' && (
              <div>
                {showConfetti && (
                  <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                      <div key={i} className="confetti" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#ffd43b', '#51cf66'][Math.floor(Math.random() * 5)]
                      }}></div>
                    ))}
                  </div>
                )}
                
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                  <Trophy size={60} color="#ffd43b" style={{animation: 'bounce 2s infinite'}} />
                </div>
                
                <h2 style={{fontSize: '36px', textAlign: 'center', marginBottom: '30px'}}>
                  ⚖️ Round {currentRound} Verdict
                </h2>
                
                <div className="verdict-box">
                  <div style={{fontWeight: 800, marginBottom: 10}}>Judge Summary</div>
                  {verdict}
                </div>

                <div className="button-group">
                  {currentRound < 3 ? (
                    <button className="btn btn-primary" onClick={nextRound}>
                      <Zap size={20} />
                      Next Round →
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={nextRound}>
                      <Star size={20} />
                      See Final Results
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Final Results */}
            {gameState === 'end' && (
              <div>
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                  <Trophy size={100} color="#ffd43b" style={{animation: 'bounce 2s infinite'}} />
                  <Star size={50} style={{position: 'absolute', top: '100px', left: 'calc(50% - 80px)', color: '#667eea', animation: 'pulse 2s infinite'}} />
                  <Star size={50} style={{position: 'absolute', top: '100px', right: 'calc(50% - 80px)', color: '#f093fb', animation: 'pulse 2s infinite 0.5s'}} />
                </div>
                
                <h2 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>
                  🎉 Trial Complete! 🎉
                </h2>
                
                <div className="final-score">
                  {Math.round(totalScore / 3)}/100
                </div>
                <p style={{textAlign: 'center', fontSize: '24px', marginBottom: '40px', color: 'rgba(255,255,255,0.9)'}}>
                  {Math.round(totalScore / 3) >= 90 ? '🏆 LEGENDARY DEBATER!' : 
                   Math.round(totalScore / 3) >= 75 ? '⭐ SKILLED ADVOCATE!' :
                   Math.round(totalScore / 3) >= 60 ? '💪 SOLID PERFORMER!' :
                   '📚 RISING STAR!'}
                </p>

                <div className="score-grid">
                  {scores.map((score, i) => (
                    <div key={i} className="score-card">
                      <div className="label">Round {i + 1}</div>
                      <div className="value">{score}</div>
                      <div style={{fontSize: '14px', marginTop: '10px'}}>
                        {score >= 90 ? '🌟' : score >= 75 ? '✨' : score >= 60 ? '💫' : '⭐'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="button-group">
                  <button className="btn btn-primary" onClick={restartGame}>
                    <Sparkles size={20} />
                    New Trial
                  </button>
                </div>
              </div>
            )}
          </main>
        )}
  {/* Tutorial overlay */}
        {showTutorial && (
          <div className="tutorial-modal" onClick={() => setShowTutorial(false)}>
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
              <h3>How to play</h3>
              <p>Welcome to Objection! — AI Debate Arena. You will play 3 rounds. For each round:</p>
              <ul>
                <li>Generate an AI topic or enter your own.</li>
                <li>Compose a focused argument (use examples & evidence).</li>
                <li>Submit to Judge AI and get a clear score and tips.</li>
              </ul>
              <p>Try to reach a high average score. Use the feedback toast to get quick, actionable tips after each round.</p>
              <div className="tutorial-actions">
                <button className="btn btn-primary" onClick={() => setShowTutorial(false)}>Got it</button>
                <button className="btn btn-primary" onClick={() => { setShowTutorial(false); }}>Start</button>
              </div>
            </div>
          </div>
        )}

        {/* Storyboard overlay */}
        <Storyboard open={showStoryboard} onClose={() => setShowStoryboard(false)} onStartCase={(c) => {
          setCurrentCase(c);
          // preset the debate prompt to the case's entry prompt and close storyboard
          if (c.entryPrompt) {
            setPrompt(c.entryPrompt);
            setGameState('playing');
            setTimeLeft(120);
          }
          setShowStoryboard(false);
        }} cases={SAMPLE_CASES} />

        {/* Non-blocking feedback */}
        <FeedbackToast open={toast.open} content={toast.content} onClose={() => setToast({ open: false, content: null })} />
      </div>
    </>
  );
}