import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [fadeClass, setFadeClass] = useState("fade-in"); 
  const [started, setStarted] = useState(false);


  useEffect(() => {
    setFadeClass("fade-in");
  }, []);

  const startLesson = () => {
    setFadeClass("fade-out");
    setTimeout(() => {
      setStarted(true);
    }, 800); 
  };

  return (
    <div id = 'full-screen'> 
    <>
      {!started && (
        <main id="main-wrapper" className={fadeClass}>
          <div id="top">
            <img src="/favicon.svg" alt="Logo" width="40" />
            <h1>Name of our app</h1>
          </div>

          <p id="description">Brief description of what this tool does</p>

          <button id="start-btn" onClick={startLesson}>
            Start your lesson
          </button>
        </main>
      )} {/*  This is the main menu*/}



      {started && ( 
        <main id="main2-wrapper" className="after-start">

          <h2>Your lesson has begun!</h2>
          <div id = 'display'> 
              
          </div>
        </main>
      )} {/* after pressing start */}
    </>

    </div>
  );
}
