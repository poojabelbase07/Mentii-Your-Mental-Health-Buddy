import React, { useState } from "react";
import "./Games.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Gamepad2, Award, Clock, Shuffle, Puzzle, Palette } from "lucide-react";

// Import actual game components (make sure these paths are correct)
import BubblePopGame from "../components/games/BubblePopGame";
import ColorPsychology from "../components/games/ColorPsychology";
import SnakeGame from "../components/games/SnakeGame";
import TetrisGame from "../components/games/TetrisGame";
import MemoryMatch from "../components/games/MemoryMatch";
import WordScramble from "../components/games/WordScramble";
import ReactionTest from "../components/games/ReactionTest";
import ColorMatch from "../components/games/ColorMatch";
import MathChallenge from "../components/games/MathChallenge";
import SpaceInvadersGame from "../components/games/SpaceInvadersGame";
import PacManGame from "../components/games/PacManGame";
import PongChallenge from "../components/games/PongChallenge";
import PinballClassic from "../components/games/PinballClassic";
import MazeGame from "../components/games/MazeGame";

const GameCard = ({ game, onPlay }) => {
  return (
    <div className="game-card">
      <div className="game-image-wrapper">
        <img src={game.image} alt={game.title} />
        {game.popular && (
          <div className="popular-badge">Popular</div>
        )}
        <div className={`difficulty-badge ${game.difficulty}`}>
          {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
        </div>
      </div>
      <div className="game-card-content">
        <div className="game-card-title">{game.title}</div>
        <div className="game-card-description">{game.description}</div>
        <button 
          onClick={() => onPlay(game.id)} 
          className="play-button"
        >
          <Gamepad2 /> Play Now
        </button>
      </div>
    </div>
  );
};

const Games = () => {
  const [filter, setFilter] = useState("all");
  const [activeGame, setActiveGame] = useState(null);
  const [highScores, setHighScores] = useState({});

  const games = [
    {
      id: "bubble-pop",
      title: "Bubble Pop",
      description: "Pop as many bubbles as you can before time runs out!",
      image: "https://placehold.co/800x600/99a9ff/1A1F2C?text=Bubble+Pop",
      difficulty: "easy",
      category: "reaction",
      popular: true
    },
    {
      id: "color-psychology",
      title: "Color Psychology",
      description: "Learn how colors affect your emotions and thoughts.",
      image: "https://placehold.co/800x600/ff9ee5/1A1F2C?text=Color+Psychology",
      difficulty: "medium",
      category: "psychology",
      popular: true
    },
     {
      id: "word-scramble",
      title: "Word Scramble",
      description: "Unscramble letters to form words against the clock.",
      image: "https://placehold.co/800x600/a2ff99/1A1F2C?text=Word+Scramble",
      difficulty: "hard",
      category: "puzzle",
      popular: true
    },
    {
      id: "reaction-test",
      title: "Reaction Test",
      description: "Test your reflexes with this quick reaction game.",
      image: "https://placehold.co/800x600/ff99e5/1A1F2C?text=Reaction+Test",
      difficulty: "easy",
      category: "reaction",
      popular: false
    },
    {
      id: "space-invaders",
      title: "Space Invaders",
      description: "Defend Earth from descending alien ships in this arcade classic.",
      image: "https://placehold.co/800x600/ffb099/1A1F2C?text=Space+Invaders",
      difficulty: "medium",
      category: "reaction",
      popular: true
    },
    {
      id: "maze-game",
      title: "Color Psychology- Maze Game",
      description: "Defend Earth from descending alien ships in this arcade classic.",
      image: "https://placehold.co/800x600/ffb099/1A1F2C?text=Space+Invaders",
      difficulty: "medium",
      category: "reaction",
      popular: true
    },
    {
      id: "memory-match",
      title: "Memory Match",
      description: "Find matching pairs of cards in this classic memory game.",
      image: "https://placehold.co/800x600/ffc285/1A1F2C?text=Memory+Match",
      difficulty: "medium",
      category: "memory",
      popular: false
    },
   
    
    {
      id: "color-match",
      title: "Color Match",
      description: "Match colors quickly before they change.",
      image: "https://placehold.co/800x600/fffa99/1A1F2C?text=Color+Match",
      difficulty: "medium",
      category: "memory",
      popular: false
    },
    {
      id: "math-challenge",
      title: "Math Challenge",
      description: "Solve math problems as fast as you can.",
      image: "https://placehold.co/800x600/99fffa/1A1F2C?text=Math+Challenge",
      difficulty: "hard",
      category: "puzzle",
      popular: false
    },
    {
      id: "tetris-classic",
      title: "Tetris Classic",
      description: "Arrange falling blocks to create complete lines in this timeless classic.",
      image: "https://placehold.co/800x600/99e5ff/1A1F2C?text=Tetris+Classic",
      difficulty: "medium",
      category: "puzzle",
      popular: true
    },
    {
      id: "snake-game",
      title: "Snake Game",
      description: "Control a snake to eat apples and grow without hitting walls or yourself.",
      image: "https://placehold.co/800x600/a9ff99/1A1F2C?text=Snake+Game",
      difficulty: "easy",
      category: "reaction",
      popular: true
    },
    
    {
      id: "pinball-classic",
      title: "Pinball Classic",
      description: "Keep the ball in play and rack up points in this virtual pinball machine.",
      image: "https://placehold.co/800x600/e5ff99/1A1F2C?text=Pinball+Classic",
      difficulty: "medium",
      category: "reaction",
      popular: false
    },
    {
      id: "pacman-maze",
      title: "Pac-Man Maze",
      description: "Navigate mazes and eat dots while avoiding colorful ghosts.",
      image: "https://placehold.co/800x600/ff99c7/1A1F2C?text=Pac-Man+Maze",
      difficulty: "medium",
      category: "puzzle",
      popular: true
    },
    {
      id: "pong-challenge",
      title: "Pong Challenge",
      description: "The original video game! Bounce the ball past your opponent's paddle.",
      image: "https://placehold.co/800x600/99ffd5/1A1F2C?text=Pong+Challenge",
      difficulty: "easy",
      category: "reaction",
      popular: false
    }
  ];

  const handlePlayGame = (id) => {
    setActiveGame(id);
  };

  const handleBackToGames = () => {
    setActiveGame(null);
  };

  const handleScore = (score) => {
    if (!activeGame) return;
    setHighScores(prev => {
      const currentHighScore = prev[activeGame] || 0;
      if (score > currentHighScore) {
        return { ...prev, [activeGame]: score };
      }
      return prev;
    });
  };

  const filteredGames = filter === "all"
    ? games
    : games.filter(game =>
        filter === "popular"
          ? game.popular
          : game.category === filter || game.difficulty === filter
      );

  return (
    <div className="games-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container">
          <div className="games-header">
            <h1>Games</h1>
            <p className="subtitle">
              Have fun and take your mind off stress with these relaxing games.
            </p>
          </div>

          {activeGame ? (
            <div className="container">
              <div 
                className="back-button" 
                onClick={handleBackToGames}
              >
                ← Back to all games
              </div>

              <h2 className="active-game-title">
                {games.find(g => g.id === activeGame)?.title}
              </h2>

              {activeGame === "bubble-pop" && (
                <BubblePopGame onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "memory-match" && (
                <MemoryMatch onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "word-scramble" && (
                <WordScramble onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "reaction-test" && (
                <ReactionTest onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "color-match" && (
                <ColorMatch onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "pacman-maze" && (
                <PacManGame onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "pong-challenge" && (
                <PongChallenge onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "pinball-classic" && (
                <PinballClassic onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "math-challenge" && (
                <MathChallenge onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "maze-game" && (
                <MazeGame />
              )}
              {activeGame === "color-psychology" && (
                <ColorPsychology />
              )}
              {activeGame === "space-invaders" && (
                <SpaceInvadersGame onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "snake-game" && (
                <SnakeGame onBack={handleBackToGames} onScore={handleScore} />
              )}
              {activeGame === "tetris-classic" && (
                <TetrisGame onBack={handleBackToGames} onScore={handleScore} />
              )}

              {!(
                activeGame === "bubble-pop" ||
                activeGame === "memory-match" ||
                activeGame === "word-scramble" ||
                activeGame === "reaction-test" ||
                activeGame === "color-match" ||
                activeGame === "pacman-maze" ||
                activeGame === "pong-challenge" ||
                activeGame === "pinball-classic" ||
                activeGame === "math-challenge" ||
                activeGame === "color-psychology" ||
                activeGame === "space-invaders" ||
                activeGame === "snake-game" ||
                activeGame === "tetris-classic"
              ) && (
                <div className="game-coming-soon">
                  <h3>Game coming soon!</h3>
                  <button 
                    onClick={handleBackToGames}
                    className="play-button"
                  >
                    Back to Games
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="filter-buttons">
                <div
                  className={`filter-button ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All Games
                </div>
                <div
                  className={`filter-button ${filter === "popular" ? "active" : ""}`}
                  onClick={() => setFilter("popular")}
                >
                  <Award /> Popular
                </div>
                <div
                  className={`filter-button ${filter === "memory" ? "active" : ""}`}
                  onClick={() => setFilter("memory")}
                >
                  <Shuffle /> Memory
                </div>
                <div
                  className={`filter-button ${filter === "reaction" ? "active" : ""}`}
                  onClick={() => setFilter("reaction")}
                >
                  <Clock /> Reaction
                </div>
                <div
                  className={`filter-button ${filter === "puzzle" ? "active" : ""}`}
                  onClick={() => setFilter("puzzle")}
                >
                  <Puzzle /> Puzzle
                </div>
                <div
                  className={`filter-button ${filter === "psychology" ? "active" : ""}`}
                  onClick={() => setFilter("psychology")}
                >
                  <Palette /> Psychology
                </div>
              </div>

              <div className="games-grid">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={handlePlayGame}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
