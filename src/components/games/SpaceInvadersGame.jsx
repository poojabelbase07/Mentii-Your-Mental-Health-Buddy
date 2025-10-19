import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from './SpaceInvader.module.css';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 15;
const INVADER_WIDTH = 25;
const INVADER_HEIGHT = 15;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 10;
const INVADER_ROWS = 2;
const INVADERS_PER_ROW = 5;
const GAME_SPEED = 40;

const SpaceInvadersGame = ({ onBack, onScore }) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
  const [invaders, setInvaders] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [direction, setDirection] = useState(1);
  const [level, setLevel] = useState(1);
  const [invaderSpeed, setInvaderSpeed] = useState(1);

  // Create initial invaders
  const createInvaders = useCallback(() => {
    const newInvaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADERS_PER_ROW; col++) {
        newInvaders.push({
          x: col * (INVADER_WIDTH + 5) + 20,
          y: row * (INVADER_HEIGHT + 5) + 20,
        });
      }
    }
    return newInvaders;
  }, []);

  const resetGame = useCallback(() => {
    setInvaders(createInvaders());
    setBullets([]);
    setEnemyBullets([]);
    setPlayer({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
    setScore(0);
    setGameOver(false);
    setDirection(1);
    setLevel(1);
    setInvaderSpeed(1);
  }, [createInvaders]);

  // Initialize game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Game loop
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      // Update bullets
      setBullets(prev => 
        prev
          .map(bullet => ({ ...bullet, y: bullet.y - 5 }))
          .filter(bullet => bullet.y > 0)
      );

      // Update enemy bullets
      setEnemyBullets(prev => 
        prev
          .map(bullet => ({ ...bullet, y: bullet.y + 3 }))
          .filter(bullet => bullet.y < CANVAS_HEIGHT)
      );

      // Create enemy bullets randomly
      setInvaders(currentInvaders => {
        setEnemyBullets(currentEnemyBullets => {
          if (Math.random() < 0.02 && currentInvaders.length > 0 && currentEnemyBullets.length < 3) {
            const randomInvader = currentInvaders[Math.floor(Math.random() * currentInvaders.length)];
            return [
              ...currentEnemyBullets,
              {
                x: randomInvader.x + INVADER_WIDTH / 2,
                y: randomInvader.y + INVADER_HEIGHT,
              },
            ];
          }
          return currentEnemyBullets;
        });
        return currentInvaders; // Return unchanged
      });

      // Move invaders
      setDirection(currentDirection => {
        setInvaderSpeed(currentSpeed => {
          setInvaders(currentInvaders => {
            let shouldChangeDirection = false;
            const updatedInvaders = currentInvaders.map(invader => {
              const newX = invader.x + currentDirection * currentSpeed;
              if (newX <= 10 || newX >= CANVAS_WIDTH - INVADER_WIDTH - 10) {
                shouldChangeDirection = true;
              }
              return { ...invader, x: newX };
            });

            if (shouldChangeDirection) {
              // Change direction and move down
              const finalInvaders = updatedInvaders.map(invader => ({
                ...invader,
                y: invader.y + 20,
                x: invader.x - currentDirection * currentSpeed, // Reverse the movement that caused collision
              }));
              
              // Check if invaders reached bottom
              if (finalInvaders.some(invader => invader.y > CANVAS_HEIGHT - 50)) {
                setGameOver(true);
                onScore && onScore(score);
              }
              
              setDirection(-currentDirection);
              return finalInvaders;
            }

            return updatedInvaders;
          });
          return currentSpeed;
        });
        return currentDirection;
      });

      // Check collisions
      setBullets(currentBullets => {
        setInvaders(currentInvaders => {
          let newInvaders = [...currentInvaders];
          let newBullets = [...currentBullets];
          let scoreIncrease = 0;

          currentBullets.forEach((bullet, bulletIndex) => {
            currentInvaders.forEach((invader, invaderIndex) => {
              if (
                bullet.x < invader.x + INVADER_WIDTH &&
                bullet.x + BULLET_WIDTH > invader.x &&
                bullet.y < invader.y + INVADER_HEIGHT &&
                bullet.y + BULLET_HEIGHT > invader.y
              ) {
                newInvaders = newInvaders.filter((_, i) => i !== invaderIndex);
                newBullets = newBullets.filter((_, i) => i !== bulletIndex);
                scoreIncrease += 10;
              }
            });
          });

          if (scoreIncrease > 0) {
            setScore(prev => prev + scoreIncrease);
            setBullets(newBullets);
          }

          // Check if all invaders destroyed
          if (newInvaders.length === 0) {
            setLevel(prev => prev + 1);
            setInvaderSpeed(prev => Math.min(prev + 0.5, 4));
            setBullets([]);
            setEnemyBullets([]);
            setTimeout(() => {
              setInvaders(createInvaders());
            }, 500);
          }

          return newInvaders;
        });
        return currentBullets;
      });

      // Check enemy bullet collisions with player
      setEnemyBullets(currentEnemyBullets => {
        setPlayer(currentPlayer => {
          const hit = currentEnemyBullets.some(bullet =>
            bullet.x < currentPlayer.x + PLAYER_WIDTH &&
            bullet.x + BULLET_WIDTH > currentPlayer.x &&
            bullet.y < currentPlayer.y + PLAYER_HEIGHT &&
            bullet.y + BULLET_HEIGHT > currentPlayer.y
          );

          if (hit) {
            setGameOver(true);
            onScore && onScore(score);
          }

          return currentPlayer;
        });
        return currentEnemyBullets;
      });

    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameOver, createInvaders, onScore, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      switch (e.key) {
        case "ArrowLeft":
          setPlayer(prev => ({ ...prev, x: Math.max(prev.x - 10, 0) }));
          break;
        case "ArrowRight":
          setPlayer(prev => ({ ...prev, x: Math.min(prev.x + 10, CANVAS_WIDTH - PLAYER_WIDTH) }));
          break;
        case " ":
          e.preventDefault();
          setBullets(currentBullets => {
            if (currentBullets.length < 3) {
              setPlayer(currentPlayer => {
                setBullets(prev => [
                  ...prev,
                  {
                    x: currentPlayer.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
                    y: currentPlayer.y - BULLET_HEIGHT,
                  },
                ]);
                return currentPlayer;
              });
            }
            return currentBullets;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  // Button handlers
  const handleDirectionClick = useCallback((direction) => {
    if (gameOver) return;
    if (direction === "left") {
      setPlayer(prev => ({ ...prev, x: Math.max(prev.x - 15, 0) }));
    } else {
      setPlayer(prev => ({ ...prev, x: Math.min(prev.x + 15, CANVAS_WIDTH - PLAYER_WIDTH) }));
    }
  }, [gameOver]);

  const handleFireClick = useCallback(() => {
    if (gameOver) return;
    setBullets(currentBullets => {
      if (currentBullets.length < 3) {
        setPlayer(currentPlayer => {
          setBullets(prev => [
            ...prev,
            {
              x: currentPlayer.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
              y: currentPlayer.y - BULLET_HEIGHT,
            },
          ]);
          return currentPlayer;
        });
      }
      return currentBullets;
    });
  }, [gameOver]);

  // Canvas rendering
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    // Draw invaders
    ctx.fillStyle = "#FF5252";
    invaders.forEach(invader => {
      ctx.fillRect(invader.x, invader.y, INVADER_WIDTH, INVADER_HEIGHT);
    });

    // Draw player bullets
    ctx.fillStyle = "#FFFFFF";
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw enemy bullets
    ctx.fillStyle = "#FFEB3B";
    enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw score and level
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}  Level: ${level}`, 10, 20);
  }, [player, invaders, bullets, enemyBullets, score, level]);

  return (
    <div className={styles.gameContainer}>
      <h1 className={styles.gameTitle}>SPACE INVADERS</h1>
      <p className={styles.gameInstructions}>
        Use arrow keys or buttons to move. Press spacebar or Fire button to shoot. 
        Destroy all invaders to advance to the next level!
      </p>
      
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.gameCanvas}
        />
        {gameOver && (
          <div className={styles.gameOverlay}>
            <h2 className={styles.gameOverTitle}>GAME OVER!</h2>
            <p className={styles.scoreText}>Final Score: {score}</p>
            <p className={styles.levelText}>You reached level {level}</p>
            <div className={styles.buttonGroup}>
              <button 
                onClick={resetGame} 
                className={`${styles.controlButton} ${styles.playAgainButton}`}
              >
                Play Again
              </button>
              <button 
                onClick={onBack} 
                className={`${styles.controlButton} ${styles.backButton}`}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controlsContainer}>
        <button 
          onClick={() => handleDirectionClick("left")}
          className={styles.controlButton}
          disabled={gameOver}
        >
          <ArrowLeft className="h-5 w-5" />
          Left
        </button>
        <button 
          onClick={handleFireClick}
          className={`${styles.controlButton} ${styles.fireButton}`}
          disabled={gameOver || bullets.length >= 3}
        >
          🚀 FIRE
        </button>
        <button 
          onClick={() => handleDirectionClick("right")}
          className={styles.controlButton}
          disabled={gameOver}
        >
          Right
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SpaceInvadersGame;