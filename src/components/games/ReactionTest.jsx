import React, { useState, useEffect, useRef } from "react";
import styles from './ReactionTest.module.css';

const ReactionTest = ({ onBack, onScore }) => {
  const [gameState, setGameState] = useState("start");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [averageTime, setAverageTime] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Show toast-like messages
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 3000);
  };

  const startTest = () => {
    // Clear any existing timers
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setGameState("countdown");
    setReactionTime(null);
    setStartTime(null);
    setEndTime(null);
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setTimeout(() => {
            prepareTest();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const prepareTest = () => {
    setGameState("waiting");
    // Random delay between 2 and 5 seconds
    const delay = Math.floor(Math.random() * 3000) + 2000;
    
    timerRef.current = setTimeout(() => {
      setGameState("ready");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "start") {
      startTest();
      return;
    }

    if (gameState === "countdown") {
      // Do nothing during countdown
      return;
    }
    
    if (gameState === "waiting") {
      // User clicked too early
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      showMessage("Too early! Wait for the green color.", "error");
      startTest();
      return;
    }
    
    if (gameState === "ready" && startTime) {
      const clickTime = Date.now();
      const reaction = Math.max(0, clickTime - startTime);
      
      setEndTime(clickTime);
      setReactionTime(reaction);
      
      // Update best time
      if (reaction && (bestTime === null || reaction < bestTime)) {
        setBestTime(reaction);
        if (reaction < 200) {
          showMessage("New record! Lightning fast reflexes!", "success");
        } else {
          showMessage("New best time!", "success");
        }
      }
      
      // Update average time
      const newAttemptCount = attemptCount + 1;
      const newTotalTime = totalTime + (reaction || 0);
      const newAverage = Math.round(newTotalTime / newAttemptCount);
      
      setAttemptCount(newAttemptCount);
      setTotalTime(newTotalTime);
      setAverageTime(newAverage);
      
      // Report score to parent if callback exists
      if (onScore) {
        const score = Math.max(0, 1000 - reaction); // Higher score for faster reaction
        onScore(score);
      }
      
      setGameState("results");
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const getReactionMessage = (time) => {
    if (time < 200) return "Lightning fast! 🚀";
    if (time < 300) return "Excellent reflexes! 🔥";
    if (time < 400) return "Great job! 👍";
    if (time < 500) return "Good reaction time! 👌";
    if (time < 600) return "Decent reaction! 👏";
    return "Keep practicing! 💪";
  };

  const handleBack = (event) => {
    event.preventDefault();
    if (onBack) {
      onBack();
    }
  };

  const resetGame = () => {
    // Clear any existing timers
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setGameState("start");
    setBestTime(null);
    setAverageTime(null);
    setAttemptCount(0);
    setTotalTime(0);
    setReactionTime(null);
    setStartTime(null);
    setEndTime(null);
    setCountdown(3);
    showMessage("Game reset! Start fresh.", "info");
  };

  const getGameAreaClasses = () => {
    switch (gameState) {
      case "start":
        return `${styles.gameArea} ${styles.gameAreaStart}`;
      case "countdown":
        return `${styles.gameArea} ${styles.gameAreaCountdown}`;
      case "waiting":
        return `${styles.gameArea} ${styles.gameAreaWaiting}`;
      case "ready":
        return `${styles.gameArea} ${styles.gameAreaReady}`;
      case "results":
        return `${styles.gameArea} ${styles.gameAreaResults}`;
      default:
        return styles.gameArea;
    }
  };

  const getToastClass = () => {
    const baseClass = styles.toast;
    switch (message.type) {
      case 'error':
        return `${baseClass} ${styles.toastError}`;
      case 'success':
        return `${baseClass} ${styles.toastSuccess}`;
      default:
        return `${baseClass} ${styles.toastInfo}`;
    }
  };

  return (
    <div className={styles.container}>
      {message && (
        <div className={getToastClass()}>
          {message.text}
        </div>
      )}
      
      <div className={styles.gameWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Reaction Test</h2>
          <p className={styles.subtitle}>
            Test your reflexes and improve your reaction time
          </p>
        </div>
        
        <div className={styles.content}>
          <div className={getGameAreaClasses()} onClick={handleClick}>
            <div className={styles.gameText}>
              {gameState === "start" && (
                <>
                  <p className={styles.mainText}>Ready?</p>
                  <p className={styles.subText}>Click to start the reaction test</p>
                </>
              )}
              
              {gameState === "countdown" && (
                <>
                  <div className={styles.countdownNumber}>{countdown}</div>
                  <p className={styles.countdownText}>Get ready...</p>
                </>
              )}
              
              {gameState === "waiting" && (
                <>
                  <p className={styles.mainText}>Wait...</p>
                  <p className={`${styles.subText} ${styles.waitingText}`}>Click when the color changes to green</p>
                </>
              )}
              
              {gameState === "ready" && (
                <>
                  <p className={styles.mainText}>Click Now!</p>
                  <p className={`${styles.subText} ${styles.readyText}`}>Click as fast as you can!</p>
                </>
              )}
              
              {gameState === "results" && (
                <>
                  <h3 className={styles.resultTime}>
                    {reactionTime ? `${reactionTime} ms` : "No time recorded"}
                  </h3>
                  {reactionTime && (
                    <p className={styles.resultMessage}>{getReactionMessage(reactionTime)}</p>
                  )}
                  <div className={styles.buttonGroup}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startTest();
                      }}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetGame();
                      }}
                      className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                      Reset Stats
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className={styles.statsSection}>
            <h4 className={styles.statsTitle}>Your Stats</h4>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Best Time</p>
                <p className={styles.statValue}>{bestTime ? `${bestTime} ms` : "N/A"}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Average Time</p>
                <p className={styles.statValue}>{averageTime ? `${averageTime} ms` : "N/A"}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Attempts</p>
                <p className={styles.statValue}>{attemptCount}</p>
              </div>
            </div>
          </div>
          
          <div className={styles.infoText}>
            <p className={styles.infoTextContent}>
              The average human reaction time is 250ms to visual stimuli. How do you compare?
            </p>
          </div>
          
          <div className={styles.footerButtons}>
            {onBack && (
              <button 
                onClick={handleBack} 
                className={`${styles.buttonSmall} ${styles.buttonGray}`}
              >
                Back
              </button>
            )}
            <button 
              onClick={resetGame} 
              className={`${styles.buttonSmall} ${styles.buttonRed}`}
            >
              Reset All Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionTest;