// src/components/modules/ColorPsychology.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ColorPsychology.module.css';

const ColorPsychology = () => {
  const { currentUser, checkPrerequisite, saveAssessmentResult, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);

  // Color psychology questions and color options
  const colorQuestions = [
    {
      id: 'mood',
      question: 'Which color best represents your current mood?',
      type: 'color-grid'
    },
    {
      id: 'energy',
      question: 'What color gives you the most energy?',
      type: 'color-grid'
    },
    {
      id: 'calm',
      question: 'Which color makes you feel most calm and peaceful?',
      type: 'color-grid'
    },
    {
      id: 'motivation',
      question: 'What color motivates you to take action?',
      type: 'color-grid'
    },
    {
      id: 'reflection',
      question: 'Which color helps you reflect and think deeply?',
      type: 'color-grid'
    }
  ];

  const colorOptions = [
    { name: 'Red', hex: '#FF6B6B', meaning: 'Energy, passion, action' },
    { name: 'Blue', hex: '#4ECDC4', meaning: 'Calm, trust, stability' },
    { name: 'Green', hex: '#45B7D1', meaning: 'Growth, harmony, balance' },
    { name: 'Yellow', hex: '#FFA07A', meaning: 'Joy, optimism, creativity' },
    { name: 'Purple', hex: '#98D8C8', meaning: 'Wisdom, spirituality, mystery' },
    { name: 'Orange', hex: '#F7DC6F', meaning: 'Enthusiasm, warmth, confidence' },
    { name: 'Pink', hex: '#BB8FCE', meaning: 'Love, compassion, nurturing' },
    { name: 'Brown', hex: '#D2B48C', meaning: 'Stability, comfort, earthiness' },
    { name: 'Black', hex: '#2C3E50', meaning: 'Sophistication, power, elegance' },
    { name: 'White', hex: '#ECF0F1', meaning: 'Purity, clarity, new beginnings' }
  ];

// Mood weights for scoring
const moodWeights = {
  Red: 90,
  Orange: 85,
  Yellow: 80,
  Blue: 75,
  Green: 70,
  Purple: 65,
  Pink: 60,
  White: 55,
  Brown: 50,
  Black: 35
};


  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      

      try {
        const accessGranted = await checkPrerequisite('ColorPsychology');
        setHasAccess(accessGranted);
        
        if (!accessGranted) {
          setError('Please complete the CBT Chatbot module first to access Color Psychology.');
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setError('Error checking module access. Please try again.');
      }
    };

    checkAccess();
  },  [currentUser, navigate, checkPrerequisite]);


  // const handleColorSelect = (colorName, colorHex) => {
  //   const currentQuestion = colorQuestions[currentStep];
  //   setResponses(prev => ({
  //     ...prev,
  //     [currentQuestion.id]: {
  //       color: colorName,
  //       hex: colorHex,
  //       question: currentQuestion.question
  //     }
  //   }));
  // };
 
  const handleColorSelect = (colorName, colorHex) => {
    const currentQuestion = colorQuestions[currentStep];
  
    // Save the response
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        color: colorName,
        hex: colorHex,
        question: currentQuestion.question
      }
    }));
  
    // Automatically move to the next question after a short delay
    setTimeout(() => {
      if (currentStep < colorQuestions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete(); // Last step, trigger completion
      }
    }, 300); // Adjust delay (in ms) to control how fast it transitions
  };
  

  const handleNext = () => {
    if (currentStep < colorQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generatePersonalityProfile = (responses, dominantColor) => {
    const profiles = {
      'Red': 'You are energetic, passionate, and action-oriented. You thrive on excitement and aren\'t afraid to take risks.',
      'Blue': 'You are calm, trustworthy, and stable. You value peace and harmony in your relationships and environment.',
      'Green': 'You are balanced, growth-oriented, and harmonious. You seek stability while embracing positive change.',
      'Yellow': 'You are optimistic, creative, and joyful. You bring light and positivity to those around you.',
      'Purple': 'You are wise, spiritual, and mysterious. You think deeply and value personal growth and transformation.',
      'Orange': 'You are enthusiastic, warm, and confident. You enjoy social connections and inspiring others.',
      'Pink': 'You are loving, compassionate, and nurturing. You prioritize relationships and emotional well-being.',
      'Brown': 'You are stable, comfortable, and grounded. You value security and prefer practical solutions.',
      'Black': 'You are sophisticated, powerful, and elegant. You appreciate quality and have strong personal boundaries.',
      'White': 'You are pure, clear, and open to new beginnings. You value simplicity and fresh starts.'
    };
  
    return profiles[dominantColor] || 'You have a unique and balanced color personality.';
  };
  




  const generateColorProfile = () => {
    const colorCounts = {};
    const colorMeanings = {};

    // Count color preferences and gather meanings
    Object.values(responses).forEach(response => {
      const color = response.color;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
      
      const colorData = colorOptions.find(opt => opt.name === color);
      if (colorData) {
        colorMeanings[color] = colorData.meaning;
      }
    });

    // Find dominant colors
    const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    const dominantColor = sortedColors[0]?.[0];
    const secondaryColor = sortedColors[1]?.[0] || null;

    // Generate insights
    const insights = [];
    
    if (dominantColor) {
      insights.push(`Your dominant color preference is ${dominantColor}, suggesting you are drawn to ${colorMeanings[dominantColor]?.toLowerCase()}.`);
    }
    
    if (secondaryColor) {
      insights.push(`Your secondary color preference is ${secondaryColor}, indicating you also value ${colorMeanings[secondaryColor]?.toLowerCase()}.`);
    }

    // Color psychology recommendations
    const recommendations = [
      `Consider incorporating more ${dominantColor.toLowerCase()} in your environment to enhance your natural tendencies.`,
      'Use color visualization techniques during meditation or relaxation.',
      'Pay attention to how different colors affect your mood throughout the day.',
      'Create a personal color palette that supports your emotional well-being.'
    ];

    // Mood score calculation based on selected colors
const moodScoreRaw = Object.values(responses).reduce((acc, response) => {
  const weight = moodWeights[response.color] || 50; // default to neutral
  return acc + weight;
}, 0);

const moodScore = Math.round(moodScoreRaw / colorQuestions.length);




const profileResult = {
  dominantColor,
  colorPreferences: colorCounts,
  insights,
  recommendations,
  overallProfile: generatePersonalityProfile(responses, dominantColor),
  moodScore
};

if (secondaryColor) {
  profileResult.secondaryColor = secondaryColor;
}


return profileResult;
 };
  
//  const handleComplete = async () => {
//   setIsLoading(true);
//   setError('');

//   try {
//     const colorProfile = generateColorProfile();

//     // ✅ Build the base assessment data
//     const assessmentData = {
//       dominantColor: colorProfile.dominantColor || null,
//       colorPreferences: colorProfile.colorPreferences,
//       overallProfile: colorProfile.overallProfile,
//       moodScore: colorProfile.moodScore,
//       insights: colorProfile.insights.join(' '),
//       recommendations: colorProfile.recommendations,
//       responses,
//       completedAt: new Date().toISOString(),
//       moduleType: 'colorPsychology',
//       totalQuestions: colorQuestions.length
//     };

//     // ✅ Conditionally add secondaryColor only if it exists
//     if (colorProfile.secondaryColor) {
//       assessmentData.secondaryColor = colorProfile.secondaryColor;
//     }

//     console.log('Saving ColorPsychology assessment:', assessmentData);

//     // ✅ Save to Firebase
//     await saveAssessmentResult('colorPsychology', assessmentData);
//     await refreshUserProfile();

//     console.log('Color Psychology assessment completed successfully');

//     // ✅ Redirect after short delay
//     setTimeout(() => {
//       navigate('/dashboard');
//     }, 3000);

//   } catch (error) {
//     console.error('Error saving color psychology results:', error);
//     setError(`Failed to save your results: ${error.message}`);
//   } finally {
//     setIsLoading(false);
//   }
// };

const handleComplete = async () => {
  setIsLoading(true);
  setError('');

  try {
    const colorProfile = generateColorProfile(); // Ensure this function is returning the correct profile

    // Build the assessment data
    const assessmentData = {
      dominantColor: colorProfile.dominantColor || null,
      colorPreferences: colorProfile.colorPreferences,
      overallProfile: colorProfile.overallProfile,
      moodScore: colorProfile.moodScore,
      insights: colorProfile.insights.join(' '),
      recommendations: colorProfile.recommendations,
      responses,
      completedAt: new Date().toISOString(),
      moduleType: 'colorPsychology', // Ensure this is set correctly
      totalQuestions: colorQuestions.length
    };

    console.log('Saving ColorPsychology assessment:', assessmentData); // Debug log

    // Save to Firebase
    await saveAssessmentResult('colorPsychology', assessmentData);
    await refreshUserProfile();

    console.log('Color Psychology assessment completed successfully'); // Debug log

    // Redirect after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

  } catch (error) {
    console.error('Error saving color psychology results:', error); // Log the error
    setError(`Failed to save your results: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};


  const currentQuestion = colorQuestions[currentStep];
  const currentResponse = responses[currentQuestion?.id];
  const isStepComplete = currentResponse && currentResponse.color;

  if (!currentUser) {
    return <div className={styles.loading}>Loading...</div>;
  }
  

  if (!hasAccess) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Access Restricted</h1>
          <p className={styles.error}>{error}</p>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (currentStep >= colorQuestions.length) {
    const profile = generateColorProfile();

    
    return (
      <div className={styles.container}>
        <div className={styles.resultsCard}>
          <h1 className={styles.title}>Your Color Psychology Profile</h1>
          
          <div className={styles.profileSection}>
            <h2>Dominant Colors</h2>
            <div className={styles.colorResults}>
              <div className={styles.dominantColor}>
                <div 
                  className={styles.colorCircle}
                  style={{ backgroundColor: colorOptions.find(c => c.name === profile.dominantColor)?.hex }}
                ></div>
                <span>{profile.dominantColor}</span>
              </div>
              {profile.secondaryColor && (
                <div className={styles.secondaryColor}>
                  <div 
                    className={styles.colorCircle}
                    style={{ backgroundColor: colorOptions.find(c => c.name === profile.secondaryColor)?.hex }}
                  ></div>
                  <span>{profile.secondaryColor}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.profileSection}>
            <h2>Your Personality Profile</h2>
            <p className={styles.profileText}>{profile.overallProfile}</p>
          </div>

          <div className={styles.profileSection}>
            <h2>Key Insights</h2>
            <ul className={styles.insightsList}>
              {profile.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className={styles.profileSection}>
            <h2>Recommendations</h2>
            <ul className={styles.recommendationsList}>
              {profile.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Saving your results...</div>
          ) : (
            <p className={styles.completionMessage}>
              Congratulations! You've completed all modules. Redirecting to dashboard...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Color Psychology Assessment</h1>
          <div className={styles.progress}>
            Step {currentStep + 1} of {colorQuestions.length}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.questionSection}>
          <h2 className={styles.question}>{currentQuestion.question}</h2>
          
          <div className={styles.colorGrid}>
            {colorOptions.map((color) => (
              <div
                key={color.name}
                className={`${styles.colorOption} ${
                  currentResponse?.color === color.name ? styles.selected : ''
                }`}
                onClick={() => handleColorSelect(color.name, color.hex)}
              >
                <div 
                  className={styles.colorCircle}
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className={styles.colorInfo}>
                  <span className={styles.colorName}>{color.name}</span>
                  <span className={styles.colorMeaning}>{color.meaning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            className={styles.backButton}
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          <button
            className={styles.nextButton}
            onClick={handleNext}
            disabled={!isStepComplete || isLoading}
          >
            {currentStep === colorQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPsychology;
