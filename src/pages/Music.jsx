import React, { useState } from 'react';
import { Play, Heart, Star, Clock, Users, Brain, Sparkles, Moon, Sun, Leaf } from 'lucide-react';

const WellnessGames = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const games = [
    {
      id: 1,
      title: 'Mindful Breathing',
      description: 'A gentle breathing exercise to center your mind and reduce anxiety. Follow the visual guide for perfect rhythm.',
      category: 'mindfulness',
      duration: '5-10 min',
      difficulty: 'Beginner',
      players: 1,
      color: 'from-blue-100 to-blue-200',
      icon: <Leaf className="w-8 h-8 text-blue-500" />,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 2,
      title: 'Gratitude Garden',
      description: 'Plant seeds of gratitude and watch your virtual garden bloom. Reflect on positive moments daily.',
      category: 'gratitude',
      duration: '10-15 min',
      difficulty: 'Beginner',
      players: 1,
      color: 'from-green-100 to-emerald-200',
      icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 3,
      title: 'Emotion Explorer',
      description: 'Navigate through different emotional landscapes and learn healthy coping strategies for each feeling.',
      category: 'emotional',
      duration: '15-20 min',
      difficulty: 'Intermediate',
      players: 1,
      color: 'from-purple-100 to-purple-200',
      icon: <Heart className="w-8 h-8 text-purple-500" />,
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 4,
      title: 'Sleep Sanctuary',
      description: 'Create the perfect bedtime routine with calming activities and sleep-inducing soundscapes.',
      category: 'sleep',
      duration: '20-30 min',
      difficulty: 'Beginner',
      players: 1,
      color: 'from-indigo-100 to-blue-200',
      icon: <Moon className="w-8 h-8 text-indigo-500" />,
      image: 'https://images.unsplash.com/photo-1419242902857-b424e5c18cab?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 5,
      title: 'Focus Forest',
      description: 'Build concentration skills while growing a beautiful forest. Use the Pomodoro technique with nature sounds.',
      category: 'focus',
      duration: '25-45 min',
      difficulty: 'Intermediate',
      players: 1,
      color: 'from-teal-100 to-cyan-200',
      icon: <Brain className="w-8 h-8 text-teal-500" />,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 6,
      title: 'Sunrise Affirmations',
      description: 'Start your day with powerful, personalized affirmations that boost confidence and self-love.',
      category: 'positivity',
      duration: '8-12 min',
      difficulty: 'Beginner',
      players: 1,
      color: 'from-orange-100 to-pink-200',
      icon: <Sun className="w-8 h-8 text-orange-500" />,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 7,
      title: 'Anxiety Alchemist',
      description: 'Transform anxious thoughts into positive energy through interactive cognitive behavioral exercises.',
      category: 'anxiety',
      duration: '15-25 min',
      difficulty: 'Advanced',
      players: 1,
      color: 'from-rose-100 to-pink-200',
      icon: <Star className="w-8 h-8 text-rose-500" />,
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: 8,
      title: 'Community Circle',
      description: 'Connect with others in a safe, moderated space to share experiences and support each other.',
      category: 'social',
      duration: '30-60 min',
      difficulty: 'Intermediate',
      players: '2-8',
      color: 'from-yellow-100 to-amber-200',
      icon: <Users className="w-8 h-8 text-amber-500" />,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&crop=center'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Games', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'mindfulness', label: 'Mindfulness', icon: <Leaf className="w-4 h-4" /> },
    { key: 'gratitude', label: 'Gratitude', icon: <Heart className="w-4 h-4" /> },
    { key: 'emotional', label: 'Emotions', icon: <Heart className="w-4 h-4" /> },
    { key: 'sleep', label: 'Sleep', icon: <Moon className="w-4 h-4" /> },
    { key: 'focus', label: 'Focus', icon: <Brain className="w-4 h-4" /> },
    { key: 'positivity', label: 'Positivity', icon: <Sun className="w-4 h-4" /> },
    { key: 'anxiety', label: 'Anxiety Relief', icon: <Star className="w-4 h-4" /> },
    { key: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> }
  ];

  const toggleFavorite = (gameId) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'text-emerald-600 bg-emerald-50';
      case 'Intermediate': return 'text-blue-600 bg-blue-50';
      case 'Advanced': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-6 tracking-wide">
            Wellness
            <span className="block text-4xl md:text-5xl font-extralight text-gray-600 mt-2">
              Games
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Discover interactive experiences designed to nurture your mental well-being. 
            Each game is crafted with care to help you find peace, build resilience, and connect with yourself.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.key
                    ? 'bg-white text-gray-800 shadow-lg ring-2 ring-blue-200'
                    : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50"
            >
              {/* Game Image */}
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-90`} />
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(game.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                    favorites.includes(game.id)
                      ? 'bg-red-100 text-red-500'
                      : 'bg-white/80 text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart 
                    className="w-5 h-5" 
                    fill={favorites.includes(game.id) ? 'currentColor' : 'none'} 
                  />
                </button>

                {/* Game Icon */}
                <div className="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl">
                  {game.icon}
                </div>
              </div>

              {/* Game Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">
                    {game.description}
                  </p>
                </div>

                {/* Game Stats */}
                <div className="flex flex-wrap gap-2 mb-6 text-xs">
                  <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full">
                    <Clock className="w-3 h-3" />
                    {game.duration}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full">
                    <Users className="w-3 h-3" />
                    {game.players}
                  </span>
                </div>

                {/* Play Button */}
                <button className="w-full bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Begin Journey
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-700 mb-2">No games found</h3>
            <p className="text-gray-500 font-light">Try selecting a different category to discover more wellness experiences.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full border border-white/50">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-gray-600 font-light">Crafted with care for your mental wellness</span>
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .container {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
        
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        
        .hover\\:shadow-2xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
        }
        
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .duration-500 {
          transition-duration: 500ms;
        }
        
        .duration-700 {
          transition-duration: 700ms;
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
        
        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }
        
        .ring-2 {
          ring-width: 2px;
        }
        
        .ring-blue-200 {
          ring-color: rgb(191 219 254);
        }
        
        button:focus {
          outline: none;
          ring-width: 2px;
          ring-color: rgb(147 197 253);
          ring-opacity: 0.5;
        }
        
        .font-light {
          font-weight: 300;
        }
        
        .font-extralight {
          font-weight: 200;
        }
        
        .tracking-wide {
          letter-spacing: 0.025em;
        }
        
        .leading-relaxed {
          line-height: 1.625;
        }
      `}</style>
    </div>
  );
};

export default WellnessGames;