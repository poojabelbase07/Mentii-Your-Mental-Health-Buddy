import * as tf from '@tensorflow/tfjs';  
import React, { useState, useEffect } from "react";
import styles from "./MazeGame.module.css";

const moodLabels = ['Calm', 'Happy', 'Sad', 'Energetic', 'Relaxed', 'Anxious'];

const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }));
model.add(tf.layers.dense({ units: 6, activation: 'softmax' }));
model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

async function predictMood(rgbColor) {
  const inputTensor = tf.tensor2d([rgbColor]);
  const prediction = model.predict(inputTensor);
  const predictionArray = await prediction.data();
  const moodIndex = predictionArray.indexOf(Math.max(...predictionArray));
  const predictedMood = moodLabels[moodIndex];

  // Define relaxation colors for each mood
  const relaxationColors = {
      'Calm': '#7fffd4',  // Aquamarine
      'Happy': '#ffcc00',  // Yellow
      'Sad': '#1e90ff',    // Dodger Blue
      'Energetic': '#ff4500',  // Orange Red
      'Relaxed': '#32cd32',  // Lime Green
      'Anxious': '#8b0000',  // Dark Red
  };

  const relaxationColor = relaxationColors[predictedMood] || 'white';  // Default to white

  console.log("Predicted Mood:", predictedMood);
  console.log("Relaxation Color:", relaxationColor);

  return { predictedMood, relaxationColor };
}


const MazeGame = ({ onGameEnd, onRestart }) => {
    const gridSize = 10;
    const exitColors = {
        red: { row: 6, col: 1, rgb: [255, 0, 0] },
        blue: { row: 6, col: 5, rgb: [0, 0, 255] },
        green: { row: 0, col: 6, rgb: [0, 255, 0] },
        yellow: { row: 3, col: 6, rgb: [255, 255, 0] },
        purple: { row: 6, col: 3, rgb: [128, 0, 128] },
        orange: { row: 0, col: 1, rgb: [255, 165, 0] },
        pink: { row: 9, col: 0, rgb: [255, 192, 203] },
        cyan: { row: 9, col: 6, rgb: [0, 255, 255] },
        white: { row: 2, col: 9, rgb: [255, 255, 255] },
        brown: { row: 5, col: 7, rgb: [165, 42, 42] },
    };

    const walls = new Set([
      // Top-left barriers (Adjusted to allow movement)
      "1-2", "1-3",
      "2-2", "3-2", 
  
      // Top-right barriers (Adjusted)
      "1-7", "2-7", "3-7",
  
      // Left-side vertical walls (Adjusted to not block exits)
      "4-3", "5-3",
  
      // Right-side vertical walls
      "6-7", "7-7", 
  
      // Center obstacles (Paths Open!)
      "4-5", "5-5",
      "2-5", "3-5",
  
      // Bottom section walls (Ensured exits are accessible)
      "7-2", "8-2",
      "8-4"
  ]);
  

    const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });

    const movePlayer = (rowOffset, colOffset) => {
      const newRow = playerPos.row + rowOffset;
      const newCol = playerPos.col + colOffset;
      const key = `${newRow}-${newCol}`;
  
      if (
          newRow >= 0 &&
          newRow < gridSize &&
          newCol >= 0 &&
          newCol < gridSize &&
          !walls.has(key)
      ) {
          setPlayerPos({ row: newRow, col: newCol });
  
          for (const [color, pos] of Object.entries(exitColors)) {
              if (pos.row === newRow && pos.col === newCol) {
                  setTimeout(async () => {
                      const { predictedMood, relaxationColor } = await predictMood(pos.rgb);
                      onGameEnd(predictedMood, relaxationColor);
                  }, 500);
              }
          }
      }
  };
  
  

    const restartGame = () => {
        setPlayerPos({ row: 0, col: 0 });
        onRestart();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "w":
                    movePlayer(0, -1);
                    break;
                case "ArrowDown":
                case "s":
                    movePlayer(0, 1);
                    break;
                case "ArrowLeft":
                case "a":
                    movePlayer(-1, 0);
                    break;
                case "ArrowRight":
                case "d":
                    movePlayer(1, 0);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playerPos]);

    return (
        <div className={styles.mazeContainer}>
            <h2 className={styles.gameTitle}>Neon Maze Game</h2>
            <div className={styles.maze}>
                {Array(gridSize).fill().map((_, rowIndex) => (
                    <div key={rowIndex} className={styles.mazeRow}>
                        {Array(gridSize).fill().map((_, colIndex) => {
                            let cellClass = styles.mazeCell;
                            const key = `${rowIndex}-${colIndex}`;

                            if (walls.has(key)) cellClass += ` ${styles.wall}`;
                            if (playerPos.row === rowIndex && playerPos.col === colIndex)
                                cellClass += ` ${styles.player}`;

                            Object.entries(exitColors).forEach(([color, pos]) => {
                                if (pos.row === rowIndex && pos.col === colIndex) {
                                    cellClass += ` ${styles[`exit${color.charAt(0).toUpperCase() + color.slice(1)}`]}`;
                                }
                            });

                            return <div key={colIndex} className={cellClass}></div>;
                        })}
                    </div>
                ))}
            </div>
            <button className={styles.restartButton} onClick={restartGame}>Restart Game</button>
        </div>
    );
};

export default MazeGame;
