import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/3D/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

// Define tetrimino shapes
const TETRIMINOS = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS = {
  I: "#00CED1",
  J: "#0000CD",
  L: "#FFA500",
  O: "#FFFF00",
  S: "#008000",
  T: "#800080",
  Z: "#FF0000",
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

const TetrisGame = ({ onBack, onScore }) => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const requestRef = useRef();
  const lastDropTime = useRef(0);
  const dropInterval = useRef(1000);

  useEffect(() => {
    if (gameActive && !currentPiece) {
      spawnNewPiece();
    }
  }, [gameActive, currentPiece]);

  const spawnNewPiece = () => {
    const types = Object.keys(TETRIMINOS);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const newPiece = {
      shape: TETRIMINOS[randomType],
      type: randomType,
      position: {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETRIMINOS[randomType][0].length / 2),
        y: 0,
      },
    };

    if (checkCollision(newPiece)) {
      setGameOver(true);
      setGameActive(false);
      onScore(score);
      return;
    }

    setCurrentPiece(newPiece);
  };

  const checkCollision = (piece) => {
    if (!piece) return false;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] === 0) continue;

        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;

        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true;
        }

        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }

    return false;
  };

  const rotatePiece = useCallback(() => {
    if (!currentPiece || !gameActive) return;

    const rotatedShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    const rotatedPiece = {
      ...currentPiece,
      shape: rotatedShape,
    };

    let adjustedPiece = { ...rotatedPiece };

    if (checkCollision(adjustedPiece)) {
      adjustedPiece.position.x -= 1;
      if (!checkCollision(adjustedPiece)) {
        setCurrentPiece(adjustedPiece);
        return;
      }

      adjustedPiece.position.x += 2;
      if (!checkCollision(adjustedPiece)) {
        setCurrentPiece(adjustedPiece);
        return;
      }

      adjustedPiece.position.x -= 1;
      adjustedPiece.position.y -= 1;
      if (!checkCollision(adjustedPiece)) {
        setCurrentPiece(adjustedPiece);
        return;
      }

      return;
    }

    setCurrentPiece(rotatedPiece);
  }, [currentPiece, gameActive, board]);

  const movePiece = useCallback(
    (direction) => {
      if (!currentPiece || !gameActive) return;

      const newX = currentPiece.position.x + (direction === "left" ? -1 : 1);
      const movedPiece = {
        ...currentPiece,
        position: {
          ...currentPiece.position,
          x: newX,
        },
      };

      if (!checkCollision(movedPiece)) {
        setCurrentPiece(movedPiece);
      }
    },
    [currentPiece, gameActive, board]
  );

  const dropPiece = useCallback(() => {
    if (!currentPiece || !gameActive) return;

    const droppedPiece = {
      ...currentPiece,
      position: {
        ...currentPiece.position,
        y: currentPiece.position.y + 1,
      },
    };

    if (!checkCollision(droppedPiece)) {
      setCurrentPiece(droppedPiece);
    } else {
      lockPiece();
    }
  }, [currentPiece, gameActive, board]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || !gameActive) return;

    let dropDistance = 0;
    while (
      !checkCollision({
        ...currentPiece,
        position: {
          ...currentPiece.position,
          y: currentPiece.position.y + dropDistance + 1,
        },
      })
    ) {
      dropDistance++;
    }

    setCurrentPiece({
      ...currentPiece,
      position: {
        ...currentPiece.position,
        y: currentPiece.position.y + dropDistance,
      },
    });

    lockPiece();
  }, [currentPiece, gameActive, board]);

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;

          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.type;
          }
        }
      }
    }

    let completedLines = 0;
    const updatedBoard = newBoard.filter(row => {
      const isComplete = row.every(cell => cell !== null);
      if (isComplete) completedLines++;
      return !isComplete;
    });

    while (updatedBoard.length < BOARD_HEIGHT) {
      updatedBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (completedLines > 0) {
      const linePoints = [0, 100, 300, 500, 800];
      const newScore = score + linePoints[completedLines] * level;
      const newLines = lines + completedLines;
      const newLevel = Math.floor(newLines / 10) + 1;

      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);

      dropInterval.current = Math.max(100, 1000 - (newLevel - 1) * 100);
    }

    setBoard(updatedBoard);
    setCurrentPiece(null);
  }, [currentPiece, board, score, level, lines, onScore]);

  const gameLoop = useCallback(
    (timestamp) => {
      if (!gameActive || gameOver) return;

      if (timestamp - lastDropTime.current >= dropInterval.current) {
        lastDropTime.current = timestamp;
        dropPiece();
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [gameActive, gameOver, dropPiece]
  );

  useEffect(() => {
    if (gameActive && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameActive, gameOver, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActive || gameOver) return;

      switch (e.key) {
        case "ArrowLeft":
          movePiece("left");
          break;
        case "ArrowRight":
          movePiece("right");
          break;
        case "ArrowDown":
          dropPiece();
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        case " ":
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameActive, gameOver, movePiece, dropPiece, rotatePiece, hardDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#EEEEEE";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw board cells
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = COLORS[board[y][x]];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      const { shape, position, type } = currentPiece;
      ctx.fillStyle = COLORS[type];

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            ctx.fillRect(
              (position.x + x) * CELL_SIZE,
              (position.y + y) * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
            ctx.strokeRect(
              (position.x + x) * CELL_SIZE,
              (position.y + y) * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }
      }
    }
  }, [board, currentPiece]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        style={{ border: "2px solid #333", backgroundColor: "#000" }}
      />
      <div>
        <Button onClick={onBack}>Back</Button>
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div>Lines: {lines}</div>
      </div>
      <div>
        <Button onClick={() => movePiece("left")}>
          <ArrowLeft />
        </Button>
        <Button onClick={() => movePiece("right")}>
          <ArrowRight />
        </Button>
        <Button onClick={dropPiece}>
          <ArrowDown />
        </Button>
        <Button onClick={rotatePiece}>
          <ArrowUp />
        </Button>
        <Button onClick={hardDrop}>Drop</Button>
      </div>
    </div>
  );
};

export default TetrisGame;
