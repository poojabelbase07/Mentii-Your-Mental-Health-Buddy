import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/3D/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const CELL_SIZE = 20;
const GRID_SIZE = 20;
const GAME_SPEED = 200;

// Simple maze layout: 0 = path, 1 = wall, 2 = pellet, 3 = power pellet
const initialMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 3, 1, 0, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 0, 1, 3, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 3, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 3, 1],
  [1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const PacManGame = ({ onBack, onScore }) => {
  const canvasRef = useRef(null);
  const [pacman, setPacman] = useState({ x: 10, y: 13 });
  const [direction, setDirection] = useState("RIGHT");
  const [requestedDirection, setRequestedDirection] = useState("RIGHT");
  const [maze, setMaze] = useState(JSON.parse(JSON.stringify(initialMaze)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [ghosts, setGhosts] = useState([
    { position: { x: 9, y: 10 }, direction: "UP", scared: false },
    { position: { x: 10, y: 10 }, direction: "UP", scared: false },
  ]);
  const [powerMode, setPowerMode] = useState(false);

  const pacmanRef = useRef(pacman);
  const directionRef = useRef(direction);
  const requestedDirectionRef = useRef(requestedDirection);
  const mazeRef = useRef(maze);
  const ghostsRef = useRef(ghosts);
  const powerModeRef = useRef(powerMode);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    pacmanRef.current = pacman;
    directionRef.current = direction;
    requestedDirectionRef.current = requestedDirection;
    mazeRef.current = maze;
    ghostsRef.current = ghosts;
    powerModeRef.current = powerMode;
    gameOverRef.current = gameOver;
  }, [pacman, direction, requestedDirection, maze, ghosts, powerMode, gameOver]);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setPacman({ x: 10, y: 13 });
    setDirection("RIGHT");
    setRequestedDirection("RIGHT");
    setMaze(JSON.parse(JSON.stringify(initialMaze)));
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setGhosts([
      { position: { x: 9, y: 10 }, direction: "UP", scared: false },
      { position: { x: 10, y: 10 }, direction: "UP", scared: false },
    ]);
    setPowerMode(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOverRef.current) return;
      switch (e.key) {
        case "ArrowUp":
          setRequestedDirection("UP");
          break;
        case "ArrowDown":
          setRequestedDirection("DOWN");
          break;
        case "ArrowLeft":
          setRequestedDirection("LEFT");
          break;
        case "ArrowRight":
          setRequestedDirection("RIGHT");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDirectionClick = (newDirection) => {
    if (gameOver) return;
    setRequestedDirection(newDirection);
  };

  const isValidMove = (pos, dir) => {
    let newX = pos.x;
    let newY = pos.y;
    switch (dir) {
      case "UP":
        newY -= 1;
        break;
      case "DOWN":
        newY += 1;
        break;
      case "LEFT":
        newX -= 1;
        break;
      case "RIGHT":
        newX += 1;
        break;
    }
    if (newX < 0) newX = GRID_SIZE - 1;
    if (newX >= GRID_SIZE) newX = 0;
    if (newY < 0) newY = GRID_SIZE - 1;
    if (newY >= GRID_SIZE) newY = 0;

    return !(
      newY >= 0 &&
      newY < GRID_SIZE &&
      newX >= 0 &&
      newX < GRID_SIZE &&
      mazeRef.current[newY][newX] === 1
    );
  };

  // Continue with game loop and drawing logic...
};

export default PacManGame;
