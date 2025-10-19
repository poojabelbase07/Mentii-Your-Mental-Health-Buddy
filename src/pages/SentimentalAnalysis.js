import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './SentimentalAnalysis.module.css';

const SentimentalAnalysis = () => {
  // FIXED: Changed 'user' to 'currentUser' to match AuthContext
  const { currentUser, saveAssessmentResult, userProfile, updateUserAssessment } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isResultSaved, setIsResultSaved] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isModuleComplete, setIsModuleComplete] = useState(false);
  const [result, setResult] = useState(null);

  // Comprehensive questionnaire covering key mental health areas
  const questions = [
    {
      id: 'q1',
      text: "How would you rate your overall emotional well-being today?",
      category: "overall_wellbeing",
      options: [
        { text: "Excellent - I feel emotionally strong and positive", value: 5, sentiment: "very_positive" },
        { text: "Good - I'm in a positive emotional state", value: 4, sentiment: "positive" },
        { text: "Fair - I feel emotionally balanced", value: 3, sentiment: "neutral" },
        { text: "Poor - I'm struggling emotionally today", value: 2, sentiment: "negative" },
        { text: "Very poor - I'm having a very difficult day emotionally", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q2',
      text: "How would you describe your current stress levels?",
      category: "stress_level",
      options: [
        { text: "Very low - I feel calm and relaxed", value: 5, sentiment: "very_positive" },
        { text: "Low - Minor stress but very manageable", value: 4, sentiment: "positive" },
        { text: "Moderate - Some stress but I'm coping well", value: 3, sentiment: "neutral" },
        { text: "High - Feeling quite stressed and overwhelmed", value: 2, sentiment: "negative" },
        { text: "Very high - Stress is overwhelming and hard to manage", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q3',
      text: "How optimistic do you feel about your future?",
      category: "future_outlook",
      options: [
        { text: "Very optimistic - Excited about what's ahead", value: 5, sentiment: "very_positive" },
        { text: "Optimistic - Generally positive about the future", value: 4, sentiment: "positive" },
        { text: "Neutral - Future will be what it will be", value: 3, sentiment: "neutral" },
        { text: "Pessimistic - Worried about what's coming", value: 2, sentiment: "negative" },
        { text: "Very pessimistic - Dreading the future", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q4',
      text: "How connected do you feel to the people in your life?",
      category: "social_connection",
      options: [
        { text: "Very connected - I have strong, meaningful relationships", value: 5, sentiment: "very_positive" },
        { text: "Connected - I feel good about my relationships", value: 4, sentiment: "positive" },
        { text: "Somewhat connected - My relationships are okay", value: 3, sentiment: "neutral" },
        { text: "Disconnected - I feel isolated from others", value: 2, sentiment: "negative" },
        { text: "Very disconnected - I feel completely alone", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q5',
      text: "How satisfied are you with your personal accomplishments recently?",
      category: "accomplishment",
      options: [
        { text: "Very satisfied - I'm proud of what I've achieved", value: 5, sentiment: "very_positive" },
        { text: "Satisfied - I've accomplished meaningful things", value: 4, sentiment: "positive" },
        { text: "Somewhat satisfied - I've made decent progress", value: 3, sentiment: "neutral" },
        { text: "Dissatisfied - I haven't accomplished much", value: 2, sentiment: "negative" },
        { text: "Very dissatisfied - I feel like I'm not progressing", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q6',
      text: "How would you rate your energy and motivation levels?",
      category: "energy_motivation",
      options: [
        { text: "High energy - I feel vibrant and highly motivated", value: 5, sentiment: "very_positive" },
        { text: "Good energy - I'm active and reasonably motivated", value: 4, sentiment: "positive" },
        { text: "Moderate energy - My energy fluctuates", value: 3, sentiment: "neutral" },
        { text: "Low energy - I often feel sluggish and unmotivated", value: 2, sentiment: "negative" },
        { text: "Very low energy - I'm constantly exhausted and lack motivation", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q7',
      text: "How comfortable are you with who you are as a person?",
      category: "self_acceptance",
      options: [
        { text: "Very comfortable - I genuinely like and accept myself", value: 5, sentiment: "very_positive" },
        { text: "Comfortable - I generally feel good about myself", value: 4, sentiment: "positive" },
        { text: "Somewhat comfortable - I'm working on self-acceptance", value: 3, sentiment: "neutral" },
        { text: "Uncomfortable - I struggle with self-doubt", value: 2, sentiment: "negative" },
        { text: "Very uncomfortable - I'm very critical of myself", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q8',
      text: "How well are you sleeping lately?",
      category: "sleep_quality",
      options: [
        { text: "Excellent - Deep, restful sleep consistently", value: 5, sentiment: "very_positive" },
        { text: "Good - Generally sleeping well", value: 4, sentiment: "positive" },
        { text: "Fair - Sleep is okay, some good and bad nights", value: 3, sentiment: "neutral" },
        { text: "Poor - Often have trouble sleeping", value: 2, sentiment: "negative" },
        { text: "Very poor - Consistently poor sleep quality", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q9',
      text: "How resilient do you feel when facing challenges?",
      category: "resilience",
      options: [
        { text: "Very resilient - I bounce back quickly from setbacks", value: 5, sentiment: "very_positive" },
        { text: "Resilient - I handle difficulties reasonably well", value: 4, sentiment: "positive" },
        { text: "Somewhat resilient - I eventually work through challenges", value: 3, sentiment: "neutral" },
        { text: "Not very resilient - Challenges often overwhelm me", value: 2, sentiment: "negative" },
        { text: "Very fragile - I struggle significantly with any setbacks", value: 1, sentiment: "very_negative" }
      ]
    },
    {
      id: 'q10',
      text: "How meaningful and purposeful does your life feel right now?",
      category: "life_meaning",
      options: [
        { text: "Very meaningful - I have a strong sense of purpose", value: 5, sentiment: "very_positive" },
        { text: "Meaningful - I generally feel purposeful", value: 4, sentiment: "positive" },
        { text: "Somewhat meaningful - I have some sense of direction", value: 3, sentiment: "neutral" },
        { text: "Not very meaningful - I often feel directionless", value: 2, sentiment: "negative" },
        { text: "Meaningless - I struggle to find purpose", value: 1, sentiment: "very_negative" }
      ]
    }
  ];

  const formatCategoryName = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Validation functions
  const validateAnswers = (answers) => {
    if (!answers || Object.keys(answers).length === 0) {
      throw new Error('No answers provided');
    }
    
    if (Object.keys(answers).length !== questions.length) {
      throw new Error(`Incomplete assessment: ${Object.keys(answers).length}/${questions.length} questions answered`);
    }
    
    return true;
  };

  const validateResult = (result) => {
    if (!result) {
      throw new Error('No result data available');
    }
    
    const requiredFields = ['overallScore', 'overallSentiment', 'sentimentCounts', 'categoryAverages'];
    const missingFields = requiredFields.filter(field => !result.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing result fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  };

  const calculateResult = (answers) => {
    try {
      validateAnswers(answers);
      
      const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.value, 0);
      const avgScore = totalScore / Object.keys(answers).length;
      
      const sentimentCounts = Object.values(answers).reduce((counts, answer) => {
        counts[answer.sentiment] = (counts[answer.sentiment] || 0) + 1;
        return counts;
      }, {});

      const categoryScores = Object.values(answers).reduce((scores, answer) => {
        if (!scores[answer.category]) {
          scores[answer.category] = { total: 0, count: 0 };
        }
        scores[answer.category].total += answer.value;
        scores[answer.category].count += 1;
        return scores;
      }, {});

      const categoryAverages = {};
      Object.keys(categoryScores).forEach(category => {
        categoryAverages[category] = categoryScores[category].total / categoryScores[category].count;
      });

      const sortedCategories = Object.entries(categoryAverages).sort((a, b) => b[1] - a[1]);
      const strongestAreas = sortedCategories.slice(0, 3);
      const weakestAreas = sortedCategories.slice(-3);

      let overallSentiment;
      if (avgScore >= 4.5) overallSentiment = "very_positive";
      else if (avgScore >= 3.5) overallSentiment = "positive";
      else if (avgScore >= 2.5) overallSentiment = "neutral";
      else if (avgScore >= 1.5) overallSentiment = "negative";
      else overallSentiment = "very_negative";

      const result = {
        overallScore: Math.round(avgScore * 20), // Convert to 0-100 scale for consistency with profile display
        avgScore: parseFloat(avgScore.toFixed(2)), // Keep original 1-5 scale for internal calculations
        overallSentiment,
        sentimentCounts,
        categoryAverages,
        strongestAreas,
        weakestAreas,
        totalQuestions: Object.keys(answers).length,
        completedAt: new Date().toISOString(),
        // Add fields expected by Profile component
        dominantEmotion: getSentimentLabel(overallSentiment),
        insights: generateInsights(avgScore, overallSentiment, strongestAreas, weakestAreas),
        recommendations: generateRecommendations(avgScore, overallSentiment)
      };

      validateResult(result);
      return result;
    } catch (error) {
      console.error('Error calculating result:', error);
      throw error;
    }
  };

  const generateInsights = (avgScore, sentiment, strongestAreas, weakestAreas) => {
    const insights = [];
    
    // Overall sentiment insight
    if (avgScore >= 4) {
      insights.push("You demonstrate strong emotional resilience and overall wellbeing.");
    } else if (avgScore >= 3) {
      insights.push("Your emotional wellbeing shows room for improvement with targeted strategies.");
    } else {
      insights.push("Your assessment indicates areas that may benefit from additional support and attention.");
    }
    
    // Strongest area insight
    if (strongestAreas.length > 0) {
      const topStrength = strongestAreas[0];
      insights.push(`Your strongest area is ${formatCategoryName(topStrength[0])}, which serves as a foundation for overall wellbeing.`);
    }
    
    // Growth area insight
    if (weakestAreas.length > 0) {
      const topGrowthArea = weakestAreas[0];
      insights.push(`Focus on developing ${formatCategoryName(topGrowthArea[0])} could significantly improve your overall emotional health.`);
    }
    
    return insights.join(' ');
  };

  const generateRecommendations = (avgScore, sentiment) => {
    const recommendations = [];
    
    if (avgScore >= 4) {
      recommendations.push("Continue maintaining your positive mental health practices");
      recommendations.push("Consider sharing your strategies with others who might benefit");
      recommendations.push("Focus on sustaining your current wellness routine");
    } else if (avgScore >= 3) {
      recommendations.push("Try incorporating daily mindfulness or meditation practices");
      recommendations.push("Focus on building stronger social connections");
      recommendations.push("Establish consistent sleep and exercise routines");
    } else {
      recommendations.push("Consider speaking with a mental health professional");
      recommendations.push("Practice stress reduction techniques daily");
      recommendations.push("Prioritize self-care activities that bring you joy");
    }
    
    return recommendations;
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'very_positive': return '#22c55e';
      case 'positive': return '#84cc16';
      case 'neutral': return '#eab308';
      case 'negative': return '#f97316';
      case 'very_negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSentimentLabel = (sentiment) => {
    switch(sentiment) {
      case 'very_positive': return 'Very Positive';
      case 'positive': return 'Positive';
      case 'neutral': return 'Neutral';
      case 'negative': return 'Negative';
      case 'very_negative': return 'Very Negative';
      default: return 'Unknown';
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: {
        questionId,
        value: selectedOption.value,
        sentiment: selectedOption.sentiment,
        text: selectedOption.text,
        category: questions[currentQuestionIndex].category
      }
    };
    
    setAnswers(updatedAnswers);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Assessment completed
        try {
          const assessmentResult = calculateResult(updatedAnswers);
          setResult(assessmentResult);
          setShowResult(true);
          setIsModuleComplete(true);
        } catch (error) {
          console.error('Error completing assessment:', error);
          alert('Error completing assessment. Please try again.');
        }
      }
    }, 500);
  };

  // Updated handleSaveResults function to store data properly for Profile component
  // const handleSaveResults = async () => {
  //   if (isSaving || isResultSaved) return;
    
  //   setIsSaving(true);
    
  //   try {
  //     console.log("🔍 Starting save process for Sentiment Analysis...");
      
  //     // FIXED: Changed 'user' to 'currentUser'
  //     if (!currentUser) {
  //       console.error("❌ No user found");
  //       alert("User not authenticated");
  //       return;
  //     }

  //     console.log("📊 Saving result:", result);

  //     // Prepare data structure that matches what Profile component expects
  //     const sentimentData = {
  //       overallScore: result.overallScore, // 0-100 scale
  //       avgScore: result.avgScore, // 1-5 scale for internal use
  //       overallSentiment: result.overallSentiment,
  //       dominantEmotion: result.dominantEmotion,
  //       sentimentCounts: result.sentimentCounts,
  //       categoryAverages: result.categoryAverages,
  //       strongestAreas: result.strongestAreas,
  //       weakestAreas: result.weakestAreas,
  //       insights: result.insights,
  //       recommendations: result.recommendations,
  //       completedAt: new Date(),
  //       totalQuestions: result.totalQuestions,
  //       moduleType: 'sentiment'
  //     };

  //     // Import Firebase functions
  //     const { db } = await import('../../config/firebase');
  //     const { doc, setDoc } = await import('firebase/firestore');

  //     // Store in user's document under assessments.sentiment
  //     // FIXED: Changed 'user.uid' to 'currentUser.uid'
  //     const userDocRef = doc(db, 'users', currentUser.uid);
  //     await setDoc(userDocRef, {
  //       assessments: {
  //         sentiment: sentimentData
  //       }
  //     }, { merge: true });

  //     console.log("✅ Sentiment Analysis results saved successfully");
      
  //     setIsResultSaved(true);
  //     alert('Sentiment Analysis completed and saved successfully!');
      
  //   } catch (error) {
  //     console.error("❌ Error saving Sentiment Analysis results:", error);
  //     alert("Error saving results. Please try again or contact support if the problem persists.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

// Updated handleSaveResults function to store data properly for Profile component
// const handleSaveResults = async () => {
//   if (isSaving || isResultSaved) return;
  
//   setIsSaving(true);
  
//   try {
//     console.log("🔍 Starting save process for Sentiment Analysis...");
    
//     if (!currentUser) {
//       console.error("❌ No user found");
//       alert("User not authenticated");
//       return;
//     }

//     console.log("📊 Saving result:", result);

//     // FIXED: Flatten nested arrays for Firestore compatibility
//     const sentimentData = {
//       overallScore: result.overallScore, // 0-100 scale
//       avgScore: result.avgScore, // 1-5 scale for internal use
//       overallSentiment: result.overallSentiment,
//       dominantEmotion: result.dominantEmotion,
//       sentimentCounts: result.sentimentCounts,
//       categoryAverages: result.categoryAverages,
//       // Convert nested arrays to simple objects
//       strongestAreas: {
//         first: { category: result.strongestAreas[0]?.[0], score: result.strongestAreas[0]?.[1] },
//         second: { category: result.strongestAreas[1]?.[0], score: result.strongestAreas[1]?.[1] },
//         third: { category: result.strongestAreas[2]?.[0], score: result.strongestAreas[2]?.[1] }
//       },
//       weakestAreas: {
//         first: { category: result.weakestAreas[0]?.[0], score: result.weakestAreas[0]?.[1] },
//         second: { category: result.weakestAreas[1]?.[0], score: result.weakestAreas[1]?.[1] },
//         third: { category: result.weakestAreas[2]?.[0], score: result.weakestAreas[2]?.[1] }
//       },
//       insights: result.insights,
//       recommendations: result.recommendations, // This is already a simple array of strings
//       completedAt: new Date(),
//       totalQuestions: result.totalQuestions,
//       moduleType: 'sentiment'
//     };

//     // Import Firebase functions
//     const { db } = await import('../../config/firebase');
//     const { doc, setDoc } = await import('firebase/firestore');

//     // Store in user's document under assessments.sentiment
//     const userDocRef = doc(db, 'users', currentUser.uid);
//     await setDoc(userDocRef, {
//       assessments: {
//         sentiment: sentimentData
//       }
//     }, { merge: true });

//     console.log("✅ Sentiment Analysis results saved successfully");
    
//     setIsResultSaved(true);
//     alert('Sentiment Analysis completed and saved successfully!');
    
//   } catch (error) {
//     console.error("❌ Error saving Sentiment Analysis results:", error);
//     alert("Error saving results. Please try again or contact support if the problem persists.");
//   } finally {
//     setIsSaving(false);
//   }
// };

// const handleSaveResults = async () => {
//   if (isSaving || isResultSaved) return;
  
//   setIsSaving(true);

//   try {
//     console.log("🔍 Starting save process using AuthContext.saveAssessmentResult...");

//     if (!currentUser || !result) {
//       alert("User or result data missing.");
//       return;
//     }

//     const sentimentData = {
//       overallScore: result.overallScore,
//       avgScore: result.avgScore,
//       overallSentiment: result.overallSentiment,
//       dominantEmotion: result.dominantEmotion,
//       sentimentCounts: result.sentimentCounts,
//       categoryAverages: result.categoryAverages,
//       strongestAreas: {
//         first: { category: result.strongestAreas[0]?.[0], score: result.strongestAreas[0]?.[1] },
//         second: { category: result.strongestAreas[1]?.[0], score: result.strongestAreas[1]?.[1] },
//         third: { category: result.strongestAreas[2]?.[0], score: result.strongestAreas[2]?.[1] }
//       },
//       weakestAreas: {
//         first: { category: result.weakestAreas[0]?.[0], score: result.weakestAreas[0]?.[1] },
//         second: { category: result.weakestAreas[1]?.[0], score: result.weakestAreas[1]?.[1] },
//         third: { category: result.weakestAreas[2]?.[0], score: result.weakestAreas[2]?.[1] }
//       },
//       insights: result.insights,
//       recommendations: result.recommendations,
//       completedAt: new Date().toISOString(),
//       totalQuestions: result.totalQuestions
//     };

//     await saveAssessmentResult('sentimentAnalysis', sentimentData);

//     console.log("✅ Sentiment Analysis result saved via AuthContext!");
//     setIsResultSaved(true);
//     alert('Sentiment Analysis completed and saved successfully!');
//   } catch (error) {
//     console.error("❌ Error saving result via AuthContext:", error);
//     alert("Error saving result. Please try again.");
//   } finally {
//     setIsSaving(false);
//   }
// };

const handleSaveResults = async () => {
  if (isSaving || isResultSaved) return;
  
  setIsSaving(true);

  try {
    console.log("🔍 Starting save process using AuthContext.saveAssessmentResult...");

    if (!currentUser || !result) {
      alert("User or result data missing.");
      return;
    }

    // Prepare data that matches what Profile.js expects
    const sentimentData = {
      // Core scores - Profile.js looks for moodScore first
      moodScore: result.overallScore, // This is what Profile.js checks first
      overallScore: result.overallScore,
      avgScore: result.avgScore,
      
      // Sentiment data
      overallSentiment: result.overallSentiment,
      dominantEmotion: result.dominantEmotion,
      sentimentCounts: result.sentimentCounts,
      categoryAverages: result.categoryAverages,
      
      // Areas data in the format Profile.js expects
      strongestAreas: {
        first: { category: result.strongestAreas[0]?.[0], score: result.strongestAreas[0]?.[1] },
        second: { category: result.strongestAreas[1]?.[0], score: result.strongestAreas[1]?.[1] },
        third: { category: result.strongestAreas[2]?.[0], score: result.strongestAreas[2]?.[1] }
      },
      weakestAreas: {
        first: { category: result.weakestAreas[0]?.[0], score: result.weakestAreas[0]?.[1] },
        second: { category: result.weakestAreas[1]?.[0], score: result.weakestAreas[1]?.[1] },
        third: { category: result.weakestAreas[2]?.[0], score: result.weakestAreas[2]?.[1] }
      },
      
      // Additional data
      insights: result.insights,
      recommendations: result.recommendations,
      completedAt: new Date().toISOString(),
      totalQuestions: result.totalQuestions,
      
      // Add fields for consistency with AuthContext expectations
      primaryResult: result.dominantEmotion,
      score: result.overallScore
    };

    // Save using AuthContext method
    await saveAssessmentResult('sentimentAnalysis', sentimentData);

    console.log("✅ Sentiment Analysis result saved via AuthContext!");
    setIsResultSaved(true);
    alert('Sentiment Analysis completed and saved successfully!');
    
  } catch (error) {
    console.error("❌ Error saving result via AuthContext:", error);
    alert("Error saving result. Please try again.");
  } finally {
    setIsSaving(false);
  }
};



  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    if (!saveAssessmentResult) {
      console.warn('saveAssessmentResult function not available in AuthContext');
    }
    if (!userProfile) {
      console.warn('userProfile not available in AuthContext');
    }
  }, [saveAssessmentResult, userProfile]);

  const currentQuestion = questions[currentQuestionIndex];

  if (showResult && result) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>Sentiment Analysis Complete! 🎉</h2>
            <p>Here's your emotional wellness assessment results</p>
          </div>

          <div className={styles.finalResults}>
            <div className={styles.overallScore}>
              <h3>Overall Wellness Score</h3>
              <div 
                className={styles.scoreCircle}
                style={{ borderColor: getSentimentColor(result.overallSentiment) }}
              >
                <span className={styles.scoreNumber}>{result.avgScore}</span>
                <span className={styles.scoreLabel}>out of 5</span>
              </div>
              <p className={styles.sentimentLabel}>
                {getSentimentLabel(result.overallSentiment)}
              </p>
            </div>

            <div className={styles.sentimentBreakdown}>
              <h3>Response Distribution</h3>
              <div className={styles.sentimentBars}>
                {Object.entries(result.sentimentCounts).map(([sentiment, count]) => (
                  <div key={sentiment} className={styles.sentimentBar}>
                    <span className={styles.sentimentName}>
                      {getSentimentLabel(sentiment)}
                    </span>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.barFill}
                        style={{ 
                          width: `${(count / result.totalQuestions) * 100}%`,
                          backgroundColor: getSentimentColor(sentiment)
                        }}
                      />
                    </div>
                    <span className={styles.sentimentCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.strengthsWeaknesses}>
              <div className={styles.strengths}>
                <h3>Your Strongest Areas</h3>
                {result.strongestAreas.map(([category, score], index) => (
                  <div key={index} className={styles.categoryItem}>
                    <span className={styles.categoryName}>
                      {formatCategoryName(category)}
                    </span>
                    <span className={styles.categoryScore}>{score.toFixed(1)}/5</span>
                  </div>
                ))}
              </div>

              <div className={styles.improvements}>
                <h3>Areas for Growth</h3>
                {result.weakestAreas.map(([category, score], index) => (
                  <div key={index} className={styles.categoryItem}>
                    <span className={styles.categoryName}>
                      {formatCategoryName(category)}
                    </span>
                    <span className={styles.categoryScore}>{score.toFixed(1)}/5</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.recommendations}>
              <h3>Personalized Recommendations</h3>
              <div className={styles.recommendationsList}>
                {result.recommendations.map((rec, index) => (
                  <p key={index}>• {rec}</p>
                ))}
              </div>
            </div>

            {/* Key Insights Section */}
            <div className={styles.insights}>
              <h3>Key Insights</h3>
              <p className={styles.insightsText}>{result.insights}</p>
            </div>
          </div>

          <div className={styles.actionButtons}>
            {!isResultSaved ? (
              <button 
                onClick={handleSaveResults}
                className={styles.saveButton}
                disabled={isSaving}
                style={{ 
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving Results...' : 'Save Results'}
              </button>
            ) : (
              <div className={styles.savedActions}>
                <div className={styles.savedMessage}>
                  <span className={styles.checkmark}>✅</span>
                  <span>Results saved successfully!</span>
                </div>
                <button 
                  onClick={handleBackToDashboard}
                  className={styles.dashboardButton}
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.progress}>
            <div className={styles.questionProgress}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.questionSection}>
          <h2 className={styles.questionText}>{currentQuestion.text}</h2>
          
          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                className={styles.optionButton}
                style={{ 
                  '--sentiment-color': getSentimentColor(option.sentiment)
                }}
              >
                <span className={styles.optionText}>{option.text}</span>
                <div className={styles.optionIndicator} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navigationHint}>
          <p>Select the option that best describes how you feel</p>
        </div>
      </div>
    </div>
  );
};

export default SentimentalAnalysis;
