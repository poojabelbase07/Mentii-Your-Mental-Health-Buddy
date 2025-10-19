import React, { useState, useEffect } from "react";
import styles from "./WordScramble.module.css";

const words = [
  { word: "happiness", hint: "A state of joy and contentment" },
  { word: "mindfulness", hint: "Being aware and present in the moment" },
  { word: "gratitude", hint: "Feeling of appreciation for what you have" },
  { word: "relaxation", hint: "State of being free from tension and anxiety" },
  { word: "meditation", hint: "Practice to focus and calm the mind" },
  { word: "resilience", hint: "Ability to recover from difficulties" },
  { word: "optimism", hint: "Hopefulness about the future" },
  { word: "tranquility", hint: "State of calmness and peace" },
  { word: "compassion", hint: "Sympathetic concern for others" },
  { word: "serenity", hint: "State of being calm and peaceful" }
];

const WordScramble = ({ onBack, onScore }) => {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [hint, setHint] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [isHintShown, setIsHintShown] = useState(false);
  const [usedWords, setUsedWords] = useState([]);
  const [message, setMessage] = useState("");

  // Show toast-like messages
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 3000);
  };

  // Scramble a word randomly
  const scrambleWord = (word) => {
    const wordArray = word.split("");
    let scrambled = "";
    
    // Keep scrambling until we get a different arrangement
    do {
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
      }
      scrambled = wordArray.join("");
    } while (scrambled === word);
    
    return scrambled;
  };

  // Get a new word
  const getNewWord = () => {
    const availableWords = words.filter(wordObj => !usedWords.includes(wordObj.word));
    
    // If all words have been used, reset the usedWords
    if (availableWords.length === 0) {
      setUsedWords([]);
      getNewWord();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const { word, hint } = availableWords[randomIndex];
    
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setHint(hint);
    setIsHintShown(false);
    setUsedWords([...usedWords, word]);
  };

  // Initialize the game
  useEffect(() => {
    getNewWord();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          if (onScore) onScore(score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameOver, score, onScore]);

  // Handle user input
  const handleInputChange = (e) => {
    setUserGuess(e.target.value.toLowerCase());
  };

  // Check user's guess
  const checkGuess = () => {
    if (userGuess.toLowerCase() === currentWord.toLowerCase()) {
      showMessage("Correct!", "success");
      setScore(prevScore => prevScore + 10);
      setUserGuess("");
      getNewWord();
    } else {
      showMessage("Try again!", "error");
    }
  };

  // Show hint
  const showHint = () => {
    setIsHintShown(true);
    // Deduct points for using hint
    setScore(prevScore => Math.max(0, prevScore - 2));
    showMessage("Used a hint! -2 points", "info");
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkGuess();
  };

  // Restart the game
  const restartGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setUsedWords([]);
    setMessage("");
    getNewWord();
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBack = (event) => {
    event.preventDefault();
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={styles.card}>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Word Scramble</h2>
        <p className={styles.cardDescription}>
          Unscramble mental health-related words to improve vocabulary and cognitive skills
        </p>
      </div>
      
      <div className={styles.cardContent}>
        {!gameOver ? (
          <div className={styles.gameContainer}>
            <div className={styles.gameStats}>
              <div className={styles.statItem}>
                Score: {score}
              </div>
              <div className={styles.statItem}>
                Time: {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className={styles.gameArea}>
              <h3 className={styles.scrambledWord}>
                {scrambledWord}
              </h3>
              
              {isHintShown && (
                <p className={styles.hint}>
                  Hint: {hint}
                </p>
              )}
              
              <form onSubmit={handleSubmit} className={styles.gameForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={userGuess}
                    onChange={handleInputChange}
                    placeholder="Type your answer here..."
                    className={styles.input}
                    autoComplete="off"
                  />
                  <button type="submit" className={styles.primaryButton}>
                    Check
                  </button>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={showHint}
                    disabled={isHintShown}
                  >
                    {isHintShown ? "Hint Shown" : "Show Hint (-2 pts)"}
                  </button>
                  
                  <button 
                    type="button" 
                    className={styles.secondaryButton} 
                    onClick={getNewWord}
                  >
                    Skip Word
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.gameOver}>
            <h3 className={styles.gameOverTitle}>Game Over!</h3>
            <p className={styles.finalScore}>
              Your final score: <span className={styles.scoreHighlight}>{score}</span>
            </p>
            
            <button onClick={restartGame} className={styles.primaryButton}>
              Play Again
            </button>
          </div>
        )}
        
        <div className={styles.backSection}>
          <button onClick={handleBack} className={styles.backButton}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordScramble;