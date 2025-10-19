import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/3D/card";
import { Button } from "../ui/3D/button";
import { Input } from "../ui/3D/input";
import { Progress } from "../ui/3D/progress";
import { toast } from "sonner";

const MathChallenge = () => {
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [highScore, setHighScore] = useState(0);

  const generateQuestion = () => {
    let num1, num2, operator, question, answer;

    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
        break;
      case "medium":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
        if (operator === "÷") {
          answer = Math.floor(Math.random() * 10) + 1;
          num1 = num2 * answer;
        }
        break;
      case "hard":
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 30) + 5;
        operator = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
        if (operator === "÷") {
          answer = Math.floor(Math.random() * 12) + 1;
          num1 = num2 * answer;
        }
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
    }

    question = `${num1} ${operator} ${num2}`;

    if (operator === "+") {
      answer = num1 + num2;
    } else if (operator === "-") {
      if (difficulty !== "hard" && num1 < num2) {
        [num1, num2] = [num2, num1];
        question = `${num1} ${operator} ${num2}`;
      }
      answer = num1 - num2;
    } else if (operator === "×") {
      answer = num1 * num2;
    } else if (operator === "÷") {
      answer = num1 / num2;
    }

    setCurrentQuestion({ question, answer });
    setUserAnswer("");
    setTimeLeft(15);
  };

  const startGame = () => {
    setScore(0);
    setIsGameActive(true);
    generateQuestion();
  };

  const endGame = () => {
    setIsGameActive(false);
    if (score > highScore) {
      setHighScore(score);
      toast.success("New high score!");
    }
  };

  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Time's up!");
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, currentQuestion]);

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const submitAnswer = (e) => {
    e.preventDefault();

    if (!userAnswer) return;

    const userNum = parseInt(userAnswer);

    if (userNum === currentQuestion.answer) {
      const pointsEarned = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
      setScore((prev) => prev + pointsEarned);
      toast.success(`Correct! +${pointsEarned} points`);
      generateQuestion();
    } else {
      toast.error("Incorrect answer!");
      endGame();
    }
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    if (isGameActive) {
      toast.info(`Difficulty changed to ${newDifficulty}`);
      generateQuestion();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Math Challenge</CardTitle>
        <CardDescription>
          Solve math problems quickly to improve your mental calculation skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isGameActive ? (
          <div className="text-center space-y-6 py-4">
            <h3 className="text-xl font-bold mb-2">Math Challenge</h3>
            <p className="mb-4">
              Solve math problems as quickly as possible. The game ends when you give a wrong answer or time runs out.
            </p>

            <div className="space-y-3 max-w-xs mx-auto mb-6">
              <p className="font-medium text-sm text-left">Select Difficulty:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant={difficulty === "easy" ? "default" : "outline"} onClick={() => changeDifficulty("easy")} className="w-full">
                  Easy
                </Button>
                <Button variant={difficulty === "medium" ? "default" : "outline"} onClick={() => changeDifficulty("medium")} className="w-full">
                  Medium
                </Button>
                <Button variant={difficulty === "hard" ? "default" : "outline"} onClick={() => changeDifficulty("hard")} className="w-full">
                  Hard
                </Button>
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="px-8">
              Start Game
            </Button>

            {highScore > 0 && (
              <div className="text-sm text-gray-600">Your high score: {highScore} points</div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Score: {score}</div>
              <div className="text-sm font-medium">Time: {timeLeft}s</div>
            </div>

            <Progress value={(timeLeft / 15) * 100} className="h-2" />

            <div className="text-center space-y-6 py-4">
              <div className="text-3xl md:text-5xl font-bold my-8">{currentQuestion.question}</div>

              <form onSubmit={submitAnswer} className="max-w-xs mx-auto">
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={handleInputChange}
                    placeholder="Your answer"
                    className="flex-1 text-center text-lg"
                    autoFocus
                  />
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={endGame} size="sm">
                End Game
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MathChallenge;
