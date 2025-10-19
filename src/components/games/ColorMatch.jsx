import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/3D/card";
import { Button } from "../../components/ui/3D/button";
import { Progress } from "../../components/ui/3D/progress";
import { Check, X, Trophy, User, TrendingUp, Heart, Frown, Smile, Meh, Download, BarChart3 } from "lucide-react";
import styles from "./ColorMatch.module.css"

// Enhanced Mock Firebase with sentiment tracking
const mockFirebase = {
  scores: [
    { 
      id: 1, 
      playerName: "Alice", 
      score: 25, 
      timestamp: Date.now() - 3600000,
      sentiment: { positive: 18, negative: 7, neutral: 12, overall: 'positive' },
      gameStats: { totalTime: 180, avgResponseTime: 1.2, streaks: [5, 3, 8] }
    },
    { 
      id: 2, 
      playerName: "Bob", 
      score: 18, 
      timestamp: Date.now() - 1800000,
      sentiment: { positive: 12, negative: 8, neutral: 15, overall: 'neutral' },
      gameStats: { totalTime: 150, avgResponseTime: 1.5, streaks: [3, 2, 4] }
    },
  ],
  
  async getScores() {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.scores.sort((a, b) => b.score - a.score)), 500);
    });
  },
  
  async saveScore(playerData) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.scores.push({
          id: Date.now(),
          ...playerData,
          timestamp: Date.now()
        });
        resolve();
      }, 300);
    });
  }
};

const colorOptions = [
  { colorName: "Red", displayColor: "#FF0000", textColor: "#FFFFFF" },
  { colorName: "Blue", displayColor: "#0000FF", textColor: "#FFFFFF" },
  { colorName: "Green", displayColor: "#008000", textColor: "#FFFFFF" },
  { colorName: "Yellow", displayColor: "#FFFF00", textColor: "#000000" },
  { colorName: "Purple", displayColor: "#800080", textColor: "#FFFFFF" },
  { colorName: "Orange", displayColor: "#FFA500", textColor: "#000000" },
  { colorName: "Pink", displayColor: "#FFC0CB", textColor: "#000000" },
  { colorName: "Brown", displayColor: "#A52A2A", textColor: "#FFFFFF" },
];

const ColorMatch = () => {
  const [currentColorItem, setCurrentColorItem] = useState(null);
  const [displayedColorName, setDisplayedColorName] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Sentiment Analysis States
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    currentMood: 'neutral',
    responses: [],
    streakCount: 0,
    maxStreak: 0
  });
  
  // Performance Tracking
  const [gameStats, setGameStats] = useState({
    startTime: null,
    totalTime: 0,
    avgResponseTime: 0,
    responseTimes: [],
    questionStartTime: null
  });
  
  const questionStartTimeRef = useRef(null);

  const analyzeSentiment = (isCorrect, responseTime) => {
    let mood = 'neutral';
    
    // Determine mood based on performance
    if (isCorrect) {
      if (responseTime < 1000) mood = 'positive'; // Quick correct answer
      else if (responseTime < 2000) mood = 'neutral'; // Normal correct answer
      else mood = 'neutral'; // Slow but correct
    } else {
      mood = 'negative'; // Wrong answer
    }
    
    setSentimentData(prev => {
      const newResponses = [...prev.responses, { mood, timestamp: Date.now() }];
      const recentResponses = newResponses.slice(-5); // Last 5 responses
      
      // Calculate sentiment counts
      const positive = newResponses.filter(r => r.mood === 'positive').length;
      const negative = newResponses.filter(r => r.mood === 'negative').length;
      const neutral = newResponses.filter(r => r.mood === 'neutral').length;
      
      // Determine current mood based on recent responses
      const recentPositive = recentResponses.filter(r => r.mood === 'positive').length;
      const recentNegative = recentResponses.filter(r => r.mood === 'negative').length;
      
      let currentMood = 'neutral';
      if (recentPositive > recentNegative + 1) currentMood = 'positive';
      else if (recentNegative > recentPositive + 1) currentMood = 'negative';
      
      // Update streak
      let newStreakCount = prev.streakCount;
      let newMaxStreak = prev.maxStreak;
      
      if (isCorrect) {
        newStreakCount++;
        newMaxStreak = Math.max(newMaxStreak, newStreakCount);
      } else {
        newStreakCount = 0;
      }
      
      return {
        positive,
        negative,
        neutral,
        currentMood,
        responses: newResponses,
        streakCount: newStreakCount,
        maxStreak: newMaxStreak
      };
    });
  };

  const getSentimentEmoji = () => {
    switch (sentimentData.currentMood) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getSentimentText = () => {
    switch (sentimentData.currentMood) {
      case 'positive': return 'Great job!';
      case 'negative': return 'Keep trying!';
      default: return 'Focused';
    }
  };

  const getSentimentColor = () => {
    switch (sentimentData.currentMood) {
      case 'positive': return styles.textGreen;
      case 'negative': return styles.textRed;
      default: return styles.textYellow;
    }
  };

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const generateQuestion = () => {
    const randomColorIndex = Math.floor(Math.random() * colorOptions.length);
    const selectedColorItem = colorOptions[randomColorIndex];
    
    let colorName;
    if (Math.random() < 0.6) {
      let differentColorIndex;
      do {
        differentColorIndex = Math.floor(Math.random() * colorOptions.length);
      } while (differentColorIndex === randomColorIndex);
      
      colorName = colorOptions[differentColorIndex].colorName;
    } else {
      colorName = selectedColorItem.colorName;
    }
    
    setCurrentColorItem(selectedColorItem);
    setDisplayedColorName(colorName);
    questionStartTimeRef.current = Date.now();
  };

  const startGame = () => {
    if (!playerName.trim()) {
      showToast("Please enter your name first!", "error");
      return;
    }
    
    setScore(0);
    setLives(3);
    setGameOver(false);
    setTimeLeft(100);
    setGameStarted(true);
    setShowScoreboard(false);
    
    // Reset sentiment and stats
    setSentimentData({
      positive: 0,
      negative: 0,
      neutral: 0,
      currentMood: 'neutral',
      responses: [],
      streakCount: 0,
      maxStreak: 0
    });
    
    setGameStats({
      startTime: Date.now(),
      totalTime: 0,
      avgResponseTime: 0,
      responseTimes: [],
      questionStartTime: null
    });
    
    generateQuestion();
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const scores = await mockFirebase.getScores();
      setLeaderboard(scores.slice(0, 10));
    } catch (error) {
      showToast("Error loading leaderboard", "error");
    }
    setLoading(false);
  };

  const saveScoreToFirebase = async (finalScore) => {
    if (!playerName.trim()) return;
    
    setLoading(true);
    try {
      const totalTime = Date.now() - gameStats.startTime;
      const avgResponseTime = gameStats.responseTimes.length > 0 
        ? gameStats.responseTimes.reduce((a, b) => a + b, 0) / gameStats.responseTimes.length 
        : 0;
      
      // Determine overall sentiment
      let overallSentiment = 'neutral';
      if (sentimentData.positive > sentimentData.negative + 2) overallSentiment = 'positive';
      else if (sentimentData.negative > sentimentData.positive + 2) overallSentiment = 'negative';
      
      const playerData = {
        playerName: playerName.trim(),
        score: finalScore,
        sentiment: {
          positive: sentimentData.positive,
          negative: sentimentData.negative,
          neutral: sentimentData.neutral,
          overall: overallSentiment
        },
        gameStats: {
          totalTime: Math.round(totalTime / 1000),
          avgResponseTime: Math.round(avgResponseTime / 1000 * 100) / 100,
          maxStreak: sentimentData.maxStreak,
          responseTimes: gameStats.responseTimes
        }
      };
      
      await mockFirebase.saveScore(playerData);
      showToast("Score and performance saved!", "success");
      await loadLeaderboard();
    } catch (error) {
      showToast("Error saving score", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 50);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver, currentColorItem, displayedColorName]);

  const handleAnswer = (isMatch) => {
    const responseTime = Date.now() - questionStartTimeRef.current;
    const correctAnswer = currentColorItem?.colorName === displayedColorName;
    const isCorrect = isMatch === correctAnswer;
    
    // Update response times
    setGameStats(prev => ({
      ...prev,
      responseTimes: [...prev.responseTimes, responseTime]
    }));
    
    // Analyze sentiment
    analyzeSentiment(isCorrect, responseTime);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      showToast("Correct! 🎉", "success");
    } else {
      setLives((prev) => prev - 1);
      showToast("Wrong! 😔", "error");
      
      if (lives <= 1) {
        setGameOver(true);
        saveScoreToFirebase(score);
        return;
      }
    }
    
    generateQuestion();
    setTimeLeft(100);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setTimeLeft(100);
    setShowScoreboard(false);
  };

  const exportGameData = () => {
    const gameData = {
      player: playerName,
      score,
      sentiment: sentimentData,
      gameStats,
      timestamp: new Date().toISOString(),
      leaderboard: leaderboard.slice(0, 5) // Top 5 for context
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-match-${playerName}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast("Game data exported!", "success");
  };

  return (
    <div className={styles.gameContainer}>
      {/* Sentiment Indicator */}
      {gameStarted && !gameOver && (
        <div className={styles.sentimentIndicator}>
          <div className={styles.textCenter}>
            <div className={styles.sentimentEmoji}>{getSentimentEmoji()}</div>
            <div className={`${styles.sentimentText} ${getSentimentColor()}`}>{getSentimentText()}</div>
            <div className={styles.streakText}>
              Streak: {sentimentData.streakCount}
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {message && (
        <div className={`${styles.toastMessage} ${
          message.includes("Error") || message.includes("Wrong") ? styles.toastError : 
          message.includes("Correct") || message.includes("success") ? styles.toastSuccess : styles.toastInfo
        }`}>
          {message}
        </div>
      )}

      <div className={styles.gridContainer}>
        {/* Game Stats Card */}
        <div className={styles.statsCard}>
          <Card className={styles.cardBackground}>
            <CardHeader className={styles.cardHeader}>
              <CardTitle className={styles.cardTitle}>
                <TrendingUp className={styles.iconSmall} />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Score</span>
                  <span className={styles.statValue}>{score}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Lives</span>
                  <div className={styles.livesContainer}>
                    {[...Array(lives)].map((_, i) => (
                      <Heart key={i} className={styles.heartIcon} />
                    ))}
                  </div>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Max Streak</span>
                  <span className={styles.statValue}>{sentimentData.maxStreak}</span>
                </div>
              </div>
              
              {/* Sentiment Analysis Display */}
              <div className={styles.sentimentSection}>
                <h4 className={styles.sectionTitle}>Sentiment Analysis</h4>
                <div className={styles.sentimentStats}>
                  <div className={styles.sentimentItem}>
                    <div className={styles.sentimentItemHeader}>
                      <Smile className={styles.iconSmallGreen} />
                      <span className={styles.sentimentLabel}>Positive</span>
                    </div>
                    <span className={styles.sentimentValueGreen}>{sentimentData.positive}</span>
                  </div>
                  <div className={styles.sentimentItem}>
                    <div className={styles.sentimentItemHeader}>
                      <Meh className={styles.iconSmallYellow} />
                      <span className={styles.sentimentLabel}>Neutral</span>
                    </div>
                    <span className={styles.sentimentValueYellow}>{sentimentData.neutral}</span>
                  </div>
                  <div className={styles.sentimentItem}>
                    <div className={styles.sentimentItemHeader}>
                      <Frown className={styles.iconSmallRed} />
                      <span className={styles.sentimentLabel}>Negative</span>
                    </div>
                    <span className={styles.sentimentValueRed}>{sentimentData.negative}</span>
                  </div>
                </div>
                <div className={styles.currentMoodContainer}>
                  <div className={styles.textCenter}>
                    <div className={styles.moodEmoji}>{getSentimentEmoji()}</div>
                    <div className={`${styles.currentMoodText} ${getSentimentColor()}`}>
                      Current Mood: {sentimentData.currentMood.charAt(0).toUpperCase() + sentimentData.currentMood.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
              
              {gameOver && (
                <Button 
                  onClick={exportGameData}
                  className={styles.exportButton}
                >
                  <Download className={styles.iconSmall} />
                  Export Data
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Game Area */}
        <div className={styles.gameArea}>
          <Card className={styles.gameCard}>
            <CardHeader>
              <CardTitle className={styles.gameTitle}>
                Color Match Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.gameContent}>
              {!gameStarted && !gameOver ? (
                <div className={styles.welcomeScreen}>
                  <div className={styles.welcomeContent}>
                    <h2 className={styles.welcomeTitle}>Welcome to Color Match!</h2>
                    <p className={styles.welcomeDescription}>
                      Match the color name with the displayed color. Be quick and accurate!
                    </p>
                    <div className={styles.nameInputContainer}>
                      <label className={styles.nameInputLabel}>Enter your name:</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className={styles.nameInput}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={startGame}
                    className={styles.startButton}
                  >
                    Start Game
                  </Button>
                </div>
              ) : gameOver ? (
                <div className={styles.gameOverScreen}>
                  <div className={styles.gameOverContent}>
                    <h2 className={styles.gameOverTitle}>Game Over!</h2>
                    <div className={styles.finalScore}>
                      Final Score: <span className={styles.scoreHighlight}>{score}</span>
                    </div>
                    
                    {/* Final Sentiment Summary */}
                    <div className={styles.finalSentimentSummary}>
                      <h3 className={styles.summaryTitle}>Game Summary</h3>
                      <div className={styles.summaryGrid}>
                        <div>
                          <Smile className={styles.summaryIcon} />
                          <div className={styles.summaryValueGreen}>{sentimentData.positive}</div>
                          <div className={styles.summaryLabel}>Positive</div>
                        </div>
                        <div>
                          <Meh className={styles.summaryIcon} />
                          <div className={styles.summaryValueYellow}>{sentimentData.neutral}</div>
                          <div className={styles.summaryLabel}>Neutral</div>
                        </div>
                        <div>
                          <Frown className={styles.summaryIcon} />
                          <div className={styles.summaryValueRed}>{sentimentData.negative}</div>
                          <div className={styles.summaryLabel}>Negative</div>
                        </div>
                      </div>
                      <div className={styles.overallMoodContainer}>
                        <div className={styles.overallMoodEmoji}>{getSentimentEmoji()}</div>
                        <div className={`${styles.overallMoodText} ${getSentimentColor()}`}>
                          Overall Mood: {sentimentData.currentMood.charAt(0).toUpperCase() + sentimentData.currentMood.slice(1)}
                        </div>
                        <div className={styles.bestStreakText}>
                          Best Streak: {sentimentData.maxStreak}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.gameOverButtons}>
                    <Button 
                      onClick={resetGame}
                      className={styles.playAgainButton}
                    >
                      Play Again
                    </Button>
                    <Button 
                      onClick={() => setShowScoreboard(!showScoreboard)}
                      className={styles.leaderboardButton}
                    >
                      <Trophy className={styles.iconSmall} />
                      Leaderboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.gamePlayScreen}>
                  {/* Progress Bar */}
                  <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                      <span>Time Left</span>
                      <span>{Math.ceil(timeLeft)}%</span>
                    </div>
                    <Progress value={timeLeft} className={styles.progressBar} />
                  </div>

                  {/* Game Question */}
                  <div className={styles.questionContainer}>
                    <div className={styles.questionContent}>
                      <h3 className={styles.questionTitle}>Does the color match the text?</h3>
                      
                      {currentColorItem && (
                        <div className={styles.colorDisplayContainer}>
                          <div 
                            className={styles.colorDisplay}
                            style={{ 
                              backgroundColor: currentColorItem.displayColor,
                              color: currentColorItem.textColor 
                            }}
                          >
                            {displayedColorName}
                          </div>
                          
                          <div className={styles.colorInfo}>
                            Color shown: <span className={styles.colorInfoHighlight}>{currentColorItem.colorName}</span>
                          </div>
                          <div className={styles.colorInfo}>
                            Text says: <span className={styles.colorInfoHighlight}>{displayedColorName}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Answer Buttons */}
                    <div className={styles.answerButtons}>
                      <Button
                        onClick={() => handleAnswer(true)}
                        className={styles.matchButton}
                      >
                        <Check className={styles.buttonIcon} />
                        Match
                      </Button>
                      <Button
                        onClick={() => handleAnswer(false)}
                        className={styles.noMatchButton}
                      >
                        <X className={styles.buttonIcon} />
                        No Match
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className={styles.leaderboardCard}>
          <Card className={styles.cardBackground}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Trophy className={styles.iconSmallYellow} />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className={styles.loadingText}>Loading...</div>
              ) : (
                <div className={styles.leaderboardList}>
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`${styles.leaderboardEntry} ${
                        index === 0 ? styles.firstPlace : 
                        index === 1 ? styles.secondPlace : 
                        index === 2 ? styles.thirdPlace : styles.otherPlace
                      }`}
                    >
                      <div className={styles.entryContent}>
                        <span className={`${styles.entryRank} ${
                          index === 0 ? styles.firstRank : 
                          index === 1 ? styles.secondRank : 
                          index === 2 ? styles.thirdRank : styles.otherRank
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className={styles.entryName}>
                            {entry.playerName}
                          </div>
                          <div className={styles.entryInfo}>
                            <span className={styles.entryScore}>Score: {entry.score}</span>
                            <div className={styles.entrySentiment}>
                              {entry.sentiment?.overall === 'positive' ? '😊' : 
                               entry.sentiment?.overall === 'negative' ? '😔' : '😐'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorMatch;