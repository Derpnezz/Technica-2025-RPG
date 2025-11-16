import React, { useState, useEffect } from 'react';
import { Scale, Clock, Gavel, Sparkles, Wand2, Trophy, Zap, Star } from 'lucide-react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const CASE_THEMES = [
  "digital privacy rights for underrepresented communities",
  "algorithmic bias in hiring and lending systems",
  "fair access to tech education for low-income students",
  "online harassment targeting marginalized groups",
  "data exploitation of vulnerable populations",
  "accessibility barriers in digital platforms"
];

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ open: false, content: null });
  const [showTutorial, setShowTutorial] = useState(false);

  const openTutorialModal = () => {
    setShowTutorial(true);
  };

  const closeTutorialModal = () => {
    setShowTutorial(false);
  };

  useEffect(() => {
    setFadeClass("fade-in");
  }, []);

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
    setCustomPrompt('');
    try {
      const theme = CASE_THEMES[Math.floor(Math.random() * CASE_THEMES.length)];
      const difficulty = currentRound === 1 ? 'moderately challenging' : currentRound === 2 ? 'complex' : 'highly difficult';
      
      const result = await model.generateContent(
        `You are creating a legal case for a rookie lawyer defending clients from marginalized backgrounds.
        
Generate a ${difficulty} case about: ${theme}

The case should:
- Feature a specific client from an underrepresented community
- Present a real-world adjacent scenario with clear stakes
- Require the lawyer to defend against discrimination, bias, or unfair treatment
- Be appropriate for round ${currentRound} of 3 (increasing complexity)

Format: Return ONLY the case description as a compelling scenario (2-4 sentences). Start with "Your client..." and describe the situation they face.

Example: "Your client, Maria, a single mother from a low-income neighborhood, was denied a job interview by an AI hiring system despite having the required qualifications. The algorithm flagged her zip code as 'high risk' based on discriminatory data patterns. She needs you to argue that this automated decision violates her rights to fair employment opportunities."`
      );
      
      const generatedPrompt = result.response.text().trim();
      setPrompt(generatedPrompt);
      setGameState('playing');
      setTimeLeft(120);
      setArgument('');
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate case. Please try again or enter your own case.');
      setIsGenerating(false);
      return;
    }
    setIsGenerating(false);
  };

  const useCustomPrompt = () => {
    if (!customPrompt.trim()) {
      alert('Please enter a case scenario first!');
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
      const result = await model.generateContent(
        `You are Judge Gemini presiding over a case involving social justice and marginalized communities.

CASE: ${prompt}

ROOKIE LAWYER'S DEFENSE ARGUMENT:
${argument}

As a judge committed to equity and justice, evaluate this defense argument carefully.

Consider:
1. Does the argument show empathy and understanding of marginalized perspectives?
2. Are there concrete examples or evidence cited?
3. Is the legal reasoning sound and persuasive?
4. Does it address systemic issues or just surface-level concerns?
5. If the prompt and arguenment is not about underrepresented communities or Tech-related just grade how you want to grade it grade it like a debate club agruement. 
Provide your evaluation in this EXACT format:

SCORE: [number from 0-100]
VERDICT: [In 2-3 sentences, explain your ruling on whether this defense would succeed]
FEEDBACK: [In 2-3 sentences, give constructive advice on how to strengthen this argument for defending marginalized clients]

Be encouraging but honest. This is a learning experience for a rookie lawyer.`
      );

      const judgeResponse = result.response.text();
      
      const scoreMatch = judgeResponse.match(/SCORE:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      if (!scoreMatch) {
        throw new Error('Could not parse score from response');
      }

      if (score >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setVerdict(judgeResponse);
      setScores([...scores, score]);
      setTotalScore(totalScore + score);
      setGameState('results');

      const feedbackType = score >= 85 ? 'success' : score >= 70 ? 'info' : 'warning';
      const feedbackTitle = score >= 85 ? '⭐ Excellent Defense!' : score >= 70 ? '💪 Solid Argument' : '📚 Keep Learning';
      const feedbackMsg = score >= 85 ? 'Your defense strongly advocates for justice!' : 
                          score >= 70 ? 'Good reasoning, but consider adding more specific examples.' :
                          'Focus on concrete evidence and empathy for your client.';

      setToast({ 
        open: true, 
        content: { 
          type: feedbackType, 
          title: feedbackTitle, 
          message: feedbackMsg
        } 
      });
    } catch (error) {
      console.error('Error getting verdict:', error);
      alert('Failed to get verdict from Judge AI. Please try submitting again.');
      setGameState('playing');
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
        {!started && (
          <main id="main-wrapper" className={fadeClass}>
            <div id="top">
              <Scale size={80} />
              <h1>Objection!</h1>
              <Gavel size={80} />
            </div>

            <p id="description">
              You're a rookie lawyer/ debater defending clients or your position on arguement from marginalized backgrounds.
              Face 3 cases involving digital privacy, algorithmic bias, and social justice or any other debate Problem.
            </p>

            <button id="start-btn" onClick={startLesson}>
              Start Your Trial
            </button>
          </main>
        )}

        {started && (
          <main id="main2-wrapper">
            {gameState === 'input' && (
              <div>
                <h2 style={{fontSize: '36px', textAlign: 'center', marginBottom: '30px'}}>
                  Case {currentRound} of 3
                </h2>
                
                <div className="input-section">
                  <input
                    type="text"
                    placeholder="Enter your own case scenario or generate one with AI..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  
                  <div className="button-group">
                    <button className="btn btn-primary" onClick={useCustomPrompt}>
                      Use My Case
                    </button>
                    <button className="btn btn-primary" onClick={generateAIPrompt} disabled={isGenerating}>
                      <Wand2 size={20} />
                      {isGenerating ? 'Generating Case...' : 'Generate AI Case'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="playingdiv">
                <div style={{width: '100%'}}>
                  <div className="round-header">
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>Case {currentRound} of 3</div>
                    <div className={`timer ${timeLeft < 30 ? 'warning' : ''}`}>
                      <Clock size={32} style={{display: 'inline', marginRight: '10px'}} />
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div className="prompt-box">
                    <strong>⚖️ THE CASE:</strong><br/><br/>
                    {prompt}
                  </div>

                  <div className="playing-extra" style={{textAlign: 'center'}}>
                    <div className="progress-wrap">
                      <div className="progress-bar" aria-hidden="true">
                        <div className="progress-fill" style={{width: `${progressPercent}%`}} />
                      </div>
                    </div>
                    <div style={{marginTop: 8, color: 'rgba(255,255,255,0.8)'}}>Time remaining: {formatTime(timeLeft)}</div>
                  </div>

                  <div className="input-section2">
                    <h3 style={{fontSize: '24px', marginBottom: '15px', textAlign: 'center'}}>Your Defense Argument:</h3>
                    <textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      placeholder="Write your argument defending your client or position here to sway the judges. . .  "
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', width: '85%', margin: '15px auto 0'}}>
                      <span style={{fontSize: '16px', color: '#a0aec0'}}>{argument.length} characters</span>
                      <button 
                        className="btn btn-success" 
                        onClick={handleSubmitArgument}
                        disabled={!argument.trim()}
                      >
                        Submit Defense
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'judging' && (
              <div style={{textAlign: 'center', paddingTop: '100px'}}>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <Gavel size={80} style={{margin: '0 auto 30px', animation: 'bounce 1s infinite', color: '#ffd43b'}} />
                  <Sparkles size={40} style={{position: 'absolute', top: 0, right: -20, color: '#667eea', animation: 'pulse 2s infinite'}} />
                </div>
                <h2 style={{fontSize: '36px', marginBottom: '30px'}}>⚖️ Judge Gemini is Deliberating...</h2>
                <div className="loading">
                  <div className="spinner"></div>
                  <span>✨ Analyzing your defense with AI wisdom...</span>
                </div>
              </div>
            )}

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
                  ⚖️ Case {currentRound} Verdict
                </h2>
                
                <div className="verdict-box">
                  <div style={{fontWeight: 800, marginBottom: 10}}>Judge Gemini's Decision</div>
                  {verdict}
                </div>

                <div className="button-group">
                  {currentRound < 3 ? (
                    <button className="btn btn-primary" onClick={nextRound}>
                      <Zap size={20} />
                      Next Case →
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
                  {Math.round(totalScore / 3) >= 90 ? '🏆 JUSTICE CHAMPION!' : 
                   Math.round(totalScore / 3) >= 75 ? '⭐ RISING ADVOCATE!' :
                   Math.round(totalScore / 3) >= 60 ? '💪 DEDICATED DEFENDER!' :
                   '📚 LEARNING LAWYER!'}
                </p>

                <div className="score-grid">
                  {scores.map((score, i) => (
                    <div key={i} className="score-card">
                      <div className="label">Case {i + 1}</div>
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

        <button className="info-button" onClick={openTutorialModal}>
          i
        </button>

        {showTutorial && (
          <div className="tutorial-modal">
            <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
              <h3>⚖️ How to Defend Justice</h3>
              <p>Welcome, Rookie Lawyer/Debater! You’ll handle three cases involving tech injustice or any debate topic, such as national identity or social issues.</p>
              <ul>
                <li><strong>Generate a case</strong> about digital privacy, algorithmic bias, online harassment, or tech access, or any other debate topic</li>
                <li><strong>Build your defense</strong> with empathy, evidence, and legal reasoning (2 min per case)</li>
                <li><strong>Get feedback</strong> from Judge Gemini on how to strengthen your advocacy</li>
              </ul>
              <p><strong>Tips:</strong> Cite specific examples, address systemic issues, and always center your client's perspective!</p>
              <div className="tutorial-actions">
                <button className="btn btn-primary" onClick={closeTutorialModal}>Ready to Defend!</button>
              </div>
            </div>
          </div>
        )}

        {toast.open && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: toast.content?.type === 'success' ? '#51cf66' : toast.content?.type === 'warning' ? '#ffd43b' : '#5b82f7',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxWidth: '300px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{toast.content?.title}</div>
            <div>{toast.content?.message}</div>
            <button onClick={() => setToast({ open: false, content: null })} style={{
              marginTop: '10px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}