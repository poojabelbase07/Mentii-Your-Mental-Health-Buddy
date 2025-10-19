import React, { useState } from 'react';
import styles from './CP.module.css';

const ColorPsychology = () => {
  const [activeTab, setActiveTab] = useState('choose');
  const [selectedColor, setSelectedColor] = useState(null);
  const [userMood, setUserMood] = useState(null);
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const colors = [
    {
      color: '#FF5733',
      name: 'Vibrant Red',
      description: 'A warm, energetic color that grabs attention',
      psychology: 'Red is associated with energy, passion, and excitement. It can increase heart rate and stimulate appetite.',
      mood: 'energetic'
    },
    {
      color: '#FFC300',
      name: 'Bright Yellow',
      description: 'A cheerful, optimistic color that radiates warmth',
      psychology: 'Yellow is linked to happiness, optimism, and mental stimulation. It can help with focus and creativity.',
      mood: 'optimistic'
    },
    {
      color: '#36D7B7',
      name: 'Turquoise',
      description: 'A refreshing blend of blue and green',
      psychology: 'Turquoise represents calm, clarity, and communication. It has a balancing and refreshing effect.',
      mood: 'refreshed'
    },
    {
      color: '#3498DB',
      name: 'Sky Blue',
      description: 'A peaceful, serene color reminiscent of clear skies',
      psychology: 'Blue evokes feelings of calmness, trust, and reliability. It can lower blood pressure and heart rate.',
      mood: 'calm'
    },
    {
      color: '#9B59B6',
      name: 'Royal Purple',
      description: 'A rich, creative color associated with luxury',
      psychology: 'Purple combines the stability of blue and the energy of red, representing creativity, wisdom, and luxury.',
      mood: 'creative'
    },
    {
      color: '#E74C3C',
      name: 'Deep Red',
      description: 'A powerful, passionate color',
      psychology: 'Deep red signals power, determination, and passion. It can evoke strong emotions and create urgency.',
      mood: 'passionate'
    },
    {
      color: '#F39C12',
      name: 'Orange',
      description: 'A warm, energetic color between red and yellow',
      psychology: 'Orange combines the energy of red with the happiness of yellow. It represents enthusiasm, creativity, and determination.',
      mood: 'creative'
    },
    {
      color: '#2ECC71',
      name: 'Green',
      description: 'A natural, balanced color associated with growth',
      psychology: 'Green symbolizes growth, harmony, and healing. It\'s the most restful color for the human eye and can reduce anxiety.',
      mood: 'balanced'
    },
    {
      color: '#1ABC9C',
      name: 'Teal',
      description: 'A sophisticated blend of blue and green',
      psychology: 'Teal represents mental clarity and emotional balance. It\'s both calming and refreshing.',
      mood: 'balanced'
    },
    {
      color: '#34495E',
      name: 'Navy Blue',
      description: 'A deep, focused color associated with depth',
      psychology: 'Navy blue conveys intelligence, integrity, and depth. It helps with concentration and logical thinking.',
      mood: 'focused'
    },
    {
      color: '#16A085',
      name: 'Emerald',
      description: 'A rich, vibrant shade of green',
      psychology: 'Emerald green represents growth, renewal, and abundance. It has a balancing and harmonizing effect.',
      mood: 'balanced'
    },
    {
      color: '#8E44AD',
      name: 'Deep Purple',
      description: 'A mysterious, creative color',
      psychology: 'Deep purple is associated with mystery, spirituality, and creativity. It can stimulate imagination and intuition.',
      mood: 'creative'
    }
  ];
  
  const moodSuggestions = [
    {
      mood: 'energetic',
      emoji: '⚡',
      description: 'You\'re feeling energetic and ready for action. Your mind is alert and your body feels charged.',
      activities: [
        'Go for a brisk walk or jog',
        'Try a new workout routine',
        'Dance to your favorite upbeat music',
        'Start a project you\'ve been putting off',
        'Clean and organize your space'
      ]
    },
    {
      mood: 'creative',
      emoji: '🎨',
      description: 'Your creative juices are flowing. Your mind is open to new ideas and possibilities.',
      activities: [
        'Draw or paint something',
        'Write in a journal or start a story',
        'Try a new recipe',
        'Listen to inspiring music',
        'Start a creative project'
      ]
    },
    {
      mood: 'calm',
      emoji: '😌',
      description: 'You\'re feeling peaceful and relaxed. Your mind is clear and your body is at ease.',
      activities: [
        'Practice deep breathing exercises',
        'Try a guided meditation',
        'Read a book in a comfortable spot',
        'Take a warm bath',
        'Listen to calming music'
      ]
    },
    {
      mood: 'optimistic',
      emoji: '😊',
      description: 'You\'re feeling positive and hopeful. You see the bright side of things and feel good about the future.',
      activities: [
        'Make a gratitude list',
        'Reach out to a friend',
        'Plan something to look forward to',
        'Spend time outdoors in nature',
        'Listen to uplifting podcasts or music'
      ]
    },
    {
      mood: 'focused',
      emoji: '🧠',
      description: 'Your mind is sharp and concentrated. You\'re ready to tackle complex tasks and solve problems.',
      activities: [
        'Work on puzzles or brain teasers',
        'Learn something new',
        'Organize your tasks and set priorities',
        'Create a detailed plan for a project',
        'Practice mindfulness exercises'
      ]
    },
    {
      mood: 'passionate',
      emoji: '❤️',
      description: 'You\'re feeling intense emotion and drive. Your heart is engaged and you care deeply.',
      activities: [
        'Express your feelings through art or writing',
        'Connect with loved ones',
        'Work on something meaningful to you',
        'Listen to emotional music',
        'Volunteer or help someone'
      ]
    },
    {
      mood: 'balanced',
      emoji: '⚖️',
      description: 'You\'re feeling centered and harmonious. Your mind and body are in sync.',
      activities: [
        'Practice yoga or gentle stretching',
        'Spend time in nature',
        'Engage in mindful activities',
        'Journal about what\'s working well in your life',
        'Create a balanced meal'
      ]
    },
    {
      mood: 'refreshed',
      emoji: '🌊',
      description: 'You\'re feeling renewed and recharged. Your mind is clear and you feel ready for what\'s next.',
      activities: [
        'Set new goals or intentions',
        'Reorganize your space',
        'Try something new',
        'Connect with friends',
        'Plan your next steps'
      ]
    }
  ];

  const showToastMessage = (title, description) => {
    setToastMessage(`${title}: ${description}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setUserMood(color.mood);
    
    // Find the corresponding mood suggestion
    const moodData = moodSuggestions.find(m => m.mood === color.mood);
    if (moodData) {
      setSuggestedActivities(moodData.activities);
      
      // Show toast with mood detection
      showToastMessage(
        `Mood Detected: ${color.mood}`,
        `${moodData.emoji} ${moodData.description}`
      );
    }
    
    // Move to results tab
    setActiveTab('results');
  };

  const resetGame = () => {
    setSelectedColor(null);
    setUserMood(null);
    setSuggestedActivities([]);
    setActiveTab('choose');
  };
  
  return (
    <div className={styles.container}>
      {showToast && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Color Psychology</h1>
          <p className={styles.description}>
            Colors can reveal a lot about your current emotional state. Choose the color that appeals to you the most right now.
          </p>
        </div>
        
        <div className={styles.content}>
          <div className={styles.tabs}>
            <div className={styles.tabsList}>
              <button
                className={`${styles.tabsTrigger} ${activeTab === 'choose' ? styles.active : ''}`}
                onClick={() => setActiveTab('choose')}
              >
                Choose Colors
              </button>
              <button
                className={`${styles.tabsTrigger} ${activeTab === 'results' ? styles.active : ''} ${!selectedColor ? styles.disabled : ''}`}
                onClick={() => selectedColor && setActiveTab('results')}
                disabled={!selectedColor}
              >
                Your Results
              </button>
            </div>
            
            {activeTab === 'choose' && (
              <div className={styles.tabsContent}>
                <div className={styles.colorGrid}>
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className={styles.colorOption}
                      onClick={() => handleColorSelect(color)}
                    >
                      <div
                        className={styles.colorSquare}
                        style={{ backgroundColor: color.color }}
                      />
                      <span className={styles.colorName}>{color.name}</span>
                    </div>
                  ))}
                </div>
                
                <p className={styles.instruction}>
                  Choose the color that draws you in or feels most appealing right now.
                </p>
              </div>
            )}
            
            {activeTab === 'results' && selectedColor && (
              <div className={styles.tabsContent}>
                <div className={styles.results}>
                  <div className={styles.resultHeader}>
                    <div
                      className={styles.selectedColor}
                      style={{ backgroundColor: selectedColor.color }}
                    />
                    
                    <div className={styles.colorInfo}>
                      <h3 className={styles.colorTitle}>{selectedColor.name}</h3>
                      <p className={styles.colorDescription}>{selectedColor.description}</p>
                      
                      <h4 className={styles.sectionTitle}>Color Psychology:</h4>
                      <p className={styles.psychologyText}>{selectedColor.psychology}</p>
                      
                      {userMood && (
                        <>
                          <h4 className={styles.sectionTitle}>Your Current Mood:</h4>
                          <div className={styles.moodCard}>
                            <div className={styles.moodHeader}>
                              <span className={styles.moodEmoji}>
                                {moodSuggestions.find(m => m.mood === userMood)?.emoji}
                              </span>
                              <span className={styles.moodName}>{userMood}</span>
                            </div>
                            <p className={styles.moodDescription}>
                              {moodSuggestions.find(m => m.mood === userMood)?.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {suggestedActivities.length > 0 && (
                    <div className={styles.activitiesSection}>
                      <h3 className={styles.activitiesTitle}>Suggested Activities for Your Mood</h3>
                      <div className={styles.activitiesGrid}>
                        {suggestedActivities.map((activity, index) => (
                          <div key={index} className={styles.activityCard}>
                            <p className={styles.activityText}>{activity}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className={styles.exploreMore}>
                        <h3 className={styles.exploreTitle}>Ready to explore more activities?</h3>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionButton}>
                            Try Mind Games
                          </button>
                          <button className={styles.actionButton}>
                            Mood Music
                          </button>
                          <button className={styles.actionButton}>
                            Journal Your Thoughts
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.resetSection}>
                    <button
                      onClick={resetGame}
                      className={styles.resetButton}
                    >
                      Choose Another Color
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>About Color Psychology</h2>
        <p className={styles.infoParagraph}>
          Color psychology is the study of how colors affect human behavior, mood, and physiological reactions. Different colors can evoke different feelings and responses.
        </p>
        <p className={styles.infoParagraph}>
          The colors you're drawn to can reveal a lot about your current emotional state. Your color preferences might change based on your mood, needs, or life circumstances.
        </p>
        <p className={styles.infoParagraph}>
          This simple exercise helps you understand your current emotional state and suggests activities that might complement or balance your mood.
        </p>
      </div>
    </div>
  );
};

export default ColorPsychology;