import React, { useState, useEffect } from "react";
import { db } from '../../config/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { getDocs } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";




const saveScoreToFirebase = async (scoreData) => {
  try {
    // Add server timestamp when saving
    const docRef = await addDoc(collection(db, "scores"), {
      ...scoreData,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving score to Firebase:", error);
    return { success: false, error };
  }
};



const getScoresFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const scores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching scores:", error);
    return { success: false, error, data: [] };
  }
};

// CSS Styles
const styles = {
  // Game styles
  gameContainer: {
    height: '100vh',
    width: '100%',
    background: 'linear-gradient(to bottom, #bfdbfe, #ddd6fe)',
    position: 'relative',
    overflow: 'hidden'
  },
  gameHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  },
  scoreText: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  instructionsContent: {
    textAlign: 'center',
    color: '#374151'
  },
  instructionsTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  instructionsText: {
    fontSize: '18px'
  },
  bubble: {
    position: 'absolute',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'float 2s ease-in-out infinite'
  },
  bubblePopped: {
    transform: 'scale(0)',
    opacity: 0
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 20
  },
  gameOverTitle: {
    fontSize: '60px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  gameOverScore: {
    fontSize: '36px',
    marginBottom: '16px'
  },
  savingStatus: {
    fontSize: '18px',
    marginBottom: '24px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px'
  },
  button: {
    padding: '16px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  playAgainButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  backButton: {
    backgroundColor: '#4b5563',
    color: 'white'
  },
  
  // Main menu styles
  mainContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)',
    padding: '16px'
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  mainTitle: {
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  nameInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1f2937',
    marginBottom: '16px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  startButton: {
    width: '100%',
    background: 'linear-gradient(to right, #22c55e, #3b82f6)',
    color: 'white',
    fontWeight: 'bold',
    padding: '16px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
  },
  nameButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    marginTop: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  statsGrid: {
    display: 'grid',
    gap: '12px'
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold'
  },
  highScore: { color: '#fde047' },
  gamesPlayed: { color: '#93c5fd' },
  averageScore: { color: '#86efac' },
  refreshButton: {
    width: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    color: 'white',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    marginTop: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  leaderboardCard: {
    gridColumn: '1 / -1'
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '4px'
  },
  tab: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '600'
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white'
  },
  table: {
    width: '100%',
    color: 'white',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px 8px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  tableCell: {
    padding: '10px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  rankCell: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  scoreCell: {
    fontWeight: 'bold',
    color: '#fde047',
    fontSize: '16px'
  },
  playerCell: {
    fontWeight: '600'
  },
  dateCell: {
    opacity: 0.7,
    fontSize: '14px'
  },
  loadingText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '20px',
    fontSize: '16px'
  },
  errorText: {
    textAlign: 'center',
    color: '#fca5a5',
    padding: '20px',
    fontSize: '16px'
  },
  instructionsCard: {
    gridColumn: '1 / -1'
  },
  instructionsList: {
    color: 'white',
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  instructionItem: {
    marginBottom: '8px',
    paddingLeft: '16px',
    position: 'relative',
    fontSize: '16px'
  }
};

// Bubble Pop Game Component
const BubblePopGame = ({ onBack, onScore }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [savingScore, setSavingScore] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameActive && timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else if (timeLeft === 0) {
        setGameActive(false);
        clearInterval(interval);
        onScore(score);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft, gameActive, score, onScore]);
  
  useEffect(() => {
    const createBubble = () => {
      if (!gameActive) return;
      
      const newBubble = {
        id: Date.now() + Math.random(),
        x: Math.random() * 70 + 10,
        y: Math.random() * 60 + 20,
        size: Math.random() * 50 + 30,
        popped: false,
        color: ['#ff85a2', '#ffc285', '#99ff85', '#85b8ff', '#c285ff'][Math.floor(Math.random() * 5)]
      };
      
      setBubbles(prev => [...prev, newBubble]);
    };
    
    createBubble();
    const interval = setInterval(createBubble, 800);
    return () => clearInterval(interval);
  }, [gameActive]);
  
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBubbles(prev => prev.filter(bubble => Date.now() - bubble.id < 5000));
    }, 1000);
    
    return () => clearInterval(cleanup);
  }, []);
  
  const popBubble = (id) => {
    if (!gameActive) return;
    
    setBubbles(prev => 
      prev.map(bubble => 
        bubble.id === id ? { ...bubble, popped: true } : bubble
      )
    );
    
    setScore(prev => prev + 1);
    
    setTimeout(() => {
      setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    }, 300);
  };
  
  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    setGameActive(true);
    setSavingScore(false);
    setSaveStatus('');
  };
  
  return (
    <div style={styles.gameContainer}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
      
      <div style={styles.gameHeader}>
        <div style={styles.scoreText}>Score: {score}</div>
        <div style={styles.scoreText}>Time: {timeLeft}s</div>
      </div>
      
      {gameActive && bubbles.length === 0 && (
        <div style={styles.instructionsOverlay}>
          <div style={styles.instructionsContent}>
            <h2 style={styles.instructionsTitle}>Bubble Pop Game!</h2>
            <p style={styles.instructionsText}>Click the bubbles to pop them!</p>
          </div>
        </div>
      )}
      
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          style={{
            ...styles.bubble,
            ...(bubble.popped ? styles.bubblePopped : {}),
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), ${bubble.color})`,
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.6) inset, 0 4px 15px rgba(0, 0, 0, 0.2)',
          }}
          onClick={() => popBubble(bubble.id)}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
      ))}
      
      {!gameActive && (
        <div style={styles.gameOver}>
          <h2 style={styles.gameOverTitle}>Game Over!</h2>
          <p style={styles.gameOverScore}>Your score: {score}</p>
          
          {saveStatus && (
            <div style={styles.savingStatus}>
              {saveStatus}
            </div>
          )}
          
          <div style={styles.buttonContainer}>
            <button 
              onClick={resetGame}
              style={{...styles.button, ...styles.playAgainButton}}
            >
              Play Again
            </button>
            <button 
              onClick={onBack}
              style={{...styles.button, ...styles.backButton}}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Game App Component
const GameApp = () => {
  const [currentView, setCurrentView] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [globalScores, setGlobalScores] = useState([]);
  const [personalScores, setPersonalScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    loadGlobalScores();
  }, []);

 const loadGlobalScores = async () => {
  setLoading(true);
  setError('');
  try {
    const result = await getScoresFromFirebase();
    if (result.success) {
      // Sort descending by score
      const sortedScores = result.data.sort((a, b) => b.score - a.score);
      setGlobalScores(sortedScores);
    } else {
      setError('Failed to load scores');
    }
  } catch (err) {
    console.error('Error loading scores:', err);
    setError('Error loading scores');
  } finally {
    setLoading(false);
  }
};

  const handleGameScore = async (score) => {
    const playerNameToUse = playerName.trim() || 'Anonymous';
    
    const gameData = {
      player: playerNameToUse,
      score: score,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };
    
    // Save to Firebase
   try {
  const result = await saveScoreToFirebase(gameData);
  if (result.success) {
    setPersonalScores(prev => [gameData, ...prev].slice(0, 10));
    loadGlobalScores();
  }
} catch (error) {
  console.error('Error saving score:', error);
}


    try {
      const result = await saveScoreToFirebase(gameData);
      if (result.success) {
        // Add to personal scores
        setPersonalScores(prev => [gameData, ...prev].slice(0, 10));
        // Reload global scores to show updated leaderboard
        loadGlobalScores();
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };
const saveAndUpdateScores = async (gameData) => {
  try {
    const result = await saveScoreToFirebase(gameData);
    if (result.success) {
      // Add the Firestore doc ID to gameData before saving locally
      const gameDataWithId = { ...gameData, id: result.id };
      
      // Update personal scores with the new entry, keep only last 10
      setPersonalScores(prev => [gameDataWithId, ...prev].slice(0, 10));
      
      // Reload global scores leaderboard
      loadGlobalScores();
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

  const startGame = () => {
    if (playerName.trim() || !showNameInput) {
      setCurrentView('game');
    } else {
      setShowNameInput(true);
    }
  };

  const goToMenu = () => {
    setCurrentView('menu');
  };

  const getPersonalStats = () => {
    if (personalScores.length === 0) return { high: 0, games: 0, average: 0 };
    
    const high = Math.max(...personalScores.map(game => game.score));
    const games = personalScores.length;
    const average = Math.round(personalScores.reduce((sum, game) => sum + game.score, 0) / games);
    
    return { high, games, average };
  };

  if (currentView === 'game') {
    return <BubblePopGame onBack={goToMenu} onScore={handleGameScore} />;
  }

  const personalStats = getPersonalStats();
  const currentScores = activeTab === 'global' ? globalScores : personalScores;

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>🫧 Bubble Pop Game</h1>
          <p style={styles.subtitle}>Compete with players worldwide!</p>
        </div>

        <div style={styles.gridContainer}>
          {/* Game Controls */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🎮 Play Game</h2>
            
            {showNameInput && (
              <div>
                <label style={{display: 'block', color: 'white', marginBottom: '8px', fontWeight: '600'}}>
                  Enter your name:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name (required for leaderboard)"
                  style={styles.nameInput}
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                />
              </div>
            )}

            <button
              onClick={startGame}
              style={styles.startButton}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🚀 Start Game
            </button>

            {!showNameInput && (
              <button
                onClick={() => setShowNameInput(true)}
                style={styles.nameButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                ✏️ Set Player Name
              </button>
            )}
          </div>

          {/* Personal Stats */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Your Stats</h2>
            
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Personal Best</div>
                <div style={{...styles.statValue, ...styles.highScore}}>{personalStats.high}</div>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Games Played</div>
                <div style={{...styles.statValue, ...styles.gamesPlayed}}>{personalStats.games}</div>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Average Score</div>
                <div style={{...styles.statValue, ...styles.averageScore}}>{personalStats.average}</div>
              </div>
            </div>

            <button
              onClick={loadGlobalScores}
              style={styles.refreshButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.8)'}
            >
              🔄 Refresh Leaderboard
            </button>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div style={{...styles.card, ...styles.leaderboardCard}}>
          <h2 style={styles.cardTitle}>🏆 Leaderboard</h2>
          
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('global')}
              style={{
                ...styles.tab,
                ...(activeTab === 'global' ? styles.activeTab : {})
              }}
            >
              🌍 Global ({globalScores.length})
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              style={{
                ...styles.tab,
                ...(activeTab === 'personal' ? styles.activeTab : {})
              }}
            >
              👤 Personal ({personalScores.length})
            </button>
          </div>
          
          {loading && <div style={styles.loadingText}>Loading scores...</div>}
          {error && <div style={styles.errorText}>Error: {error}</div>}
          
          {!loading && !error && currentScores.length > 0 && (
            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Rank</th>
                    <th style={styles.tableHeader}>Player</th>
                    <th style={styles.tableHeader}>Score</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {currentScores.slice(0, 20).map((game, index) => (
                    <tr key={game.id || index}>
                      <td style={{...styles.tableCell, ...styles.rankCell}}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td style={{...styles.tableCell, ...styles.playerCell}}>{game.player}</td>
                      <td style={{...styles.tableCell, ...styles.scoreCell}}>{game.score}</td>
                      <td style={{...styles.tableCell, ...styles.dateCell}}>{game.date}</td>
                      <td style={{...styles.tableCell, ...styles.dateCell}}>{game.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && !error && currentScores.length === 0 && (
            <div style={styles.loadingText}>
              {activeTab === 'global' ? 'No global scores yet. Be the first!' : 'No personal scores yet. Play a game!'}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{...styles.card, ...styles.instructionsCard}}>
          <h2 style={styles.cardTitle}>📖 How to Play</h2>
          <ul style={styles.instructionsList}>
            <li style={styles.instructionItem}>• Enter your name to appear on the global leaderboard</li>
            <li style={styles.instructionItem}>• Click on bubbles to pop them and earn points</li>
            <li style={styles.instructionItem}>• You have 30 seconds to pop as many bubbles as possible</li>
            <li style={styles.instructionItem}>• Compete with players from around the world!</li>
            <li style={styles.instructionItem}>• Your scores are automatically saved to Firebase</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameApp;