import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/3D/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150;

const SnakeGame = ({ onBack, onScore }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const gameActiveRef = useRef(gameActive);

  useEffect(() => {
    directionRef.current = direction;
    gameOverRef.current = gameOver;
    gameActiveRef.current = gameActive;
  }, [direction, gameOver, gameActive]);

  const placeFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setGameOver(false);
    setGameActive(true);
    setScore(0);
    placeFood();
  };

  const checkCollision = (head, snakeBody) => {
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
        return true;
      }
    }

    return false;
  };

  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current || gameOverRef.current) return;

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        setGameActive(false);
        onScore(score);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 1);
        placeFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, placeFood, score, onScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActiveRef.current) return;

      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDirectionClick = (newDirection) => {
    if (!gameActive) return;

    switch (newDirection) {
      case "UP":
        if (directionRef.current !== "DOWN") setDirection("UP");
        break;
      case "DOWN":
        if (directionRef.current !== "UP") setDirection("DOWN");
        break;
      case "LEFT":
        if (directionRef.current !== "RIGHT") setDirection("LEFT");
        break;
      case "RIGHT":
        if (directionRef.current !== "LEFT") setDirection("RIGHT");
        break;
    }
  };

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    context.fillStyle = "#4CAF50";
    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? "#388E3C" : "#4CAF50";
      context.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    context.fillStyle = "#FF5252";
    context.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    context.strokeStyle = "#E0E0E0";
    context.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      context.beginPath();
      context.moveTo(i * CELL_SIZE, 0);
      context.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      context.stroke();

      context.beginPath();
      context.moveTo(0, i * CELL_SIZE);
      context.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      context.stroke();
    }
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full flex justify-between items-center">
        <div className="text-lg font-bold">Score: {score}</div>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-gray-300"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-8">Your score: {score}</p>
            <div className="space-x-4">
              <Button
                onClick={resetGame}
                className="bg-mentii-500 hover:bg-mentii-600"
              >
                Play Again
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="text-white border-white"
              >
                Back to Games
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 w-48">
        <div></div>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick("UP")}
          className="aspect-square p-0"
        >
          <ArrowUp />
        </Button>
        <div></div>

        <Button
          variant="outline"
          onClick={() => handleDirectionClick("LEFT")}
          className="aspect-square p-0"
        >
          <ArrowLeft />
        </Button>
        <div></div>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick("RIGHT")}
          className="aspect-square p-0"
        >
          <ArrowRight />
        </Button>

        <div></div>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick("DOWN")}
          className="aspect-square p-0"
        >
          <ArrowDown />
        </Button>
        <div></div>
      </div>
    </div>
  );
};

export default SnakeGame;
