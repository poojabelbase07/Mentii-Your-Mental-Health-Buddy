import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Import the new CSS module
import styles from '../../styles/Profile.module.css';
import { div } from '@tensorflow/tfjs';

// Helper function for category names
const formatCategoryName = (category) => {
  if (!category) return '';
  return category.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Helper function for formatting areas data
const formatAreasData = (areas) => {
  if (!Array.isArray(areas) || areas.length === 0) {
    return 'N/A';
  }
  return areas.map(area => formatCategoryName(area)).join(', ');
};

// Helper function to format date for display - MOVED OUTSIDE Profile component
const formatDate = (date) => {
  if (!date) return 'N/A';
  let d;
  if (typeof date.toDate === 'function') {
    d = date.toDate();
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) {
    console.error("Invalid date received by formatDate:", date);
    return 'Invalid Date';
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to determine CSS class for score badge color - MOVED OUTSIDE Profile component
const getScoreColorClass = (score) => {
  if (score >= 70) return styles.scoreHigh;
  if (score >= 50) return styles.scoreMedium;
  return styles.scoreLow;
};

// New Emotion Badge Component for better visual representation
const EmotionBadge = ({ emotion }) => {
  let className = styles.emotionNeutral; // Default
  let icon = '😐'; // Default neutral icon

  switch (emotion?.toLowerCase()) {
    case 'positive':
      className = styles.emotionPositive;
      icon = '😊'; // Happy face
      break;
    case 'negative':
      className = styles.emotionNegative;
      icon = '😔'; // Sad face
      break;
    case 'neutral':
    default:
      className = styles.emotionNeutral;
      icon = '😐'; // Neutral face
      break;
  }

  return (
    <span className={`${styles.emotionBadge} ${className}`}>
      {icon} {emotion}
    </span>
  );
};

// New Component for Module Results to handle dynamic display - UPDATED PROPS
const ModuleResultCard = ({ title, result, moduleKey, description, getScoreColorClass, formatDate }) => {
  if (!result) {
    return (
      <div className={styles.moduleCardEmpty}>
        <h3>{title}</h3>
        <p>{description}</p>
        <a
          href={
            moduleKey === 'sentiment' ? '/sentimental-analysis' :
            moduleKey === 'cbt' ? '/cbt-chatbot' :
            moduleKey === 'colorPsychology' ? '/color-psychology' : '#'
          }
          className={styles.callToAction}
        >
          Start Module Now &rarr;
        </a>
      </div>
    );
  }

  // Special handling for CBT to show entry count
  if (moduleKey === 'cbt') {
    return (
      
      <div className={styles.moduleCard}>
        <div className={styles.moduleCardHeader}>
          <div>
            <h3>{title}</h3>
            {result.lastEntryTimestamp && (
              <p>Last Entry: {new Date(result.lastEntryTimestamp).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <div className={styles.moduleCardContent}>
          <p>
            <strong>Entries Recorded:</strong> {result.entryCount || 0}
          </p>
          {/* You could add more aggregate CBT data here, e.g., average sentiment of thoughts */}
        </div>
      </div>
    );
  }

  // General handling for other modules
  const score = result.moodScore || result.overallScore || result.confidence || result.wellbeingScore || result.score || 0;
  // Using passed prop
  const scoreClass = getScoreColorClass(score);

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleCardHeader}>
        <div>
          <h3>{title}</h3>
          {/* Using passed prop */}
          <p>Completed on {formatDate(result.completedAt)}</p>
        </div>
        <div className={`${styles.scoreBadge} ${scoreClass}`}>
          Score: {score}
        </div>
      </div>

      <div className={styles.moduleCardContent}>
        {moduleKey === 'sentiment' && (
          <>
            <p><strong>Overall Sentiment:</strong> <EmotionBadge emotion={result.overallSentiment} /></p>
            <p><strong>Score:</strong> <span className={styles.scoreText} style={{ color: result.overallScore >= 70 ? 'green' : result.overallScore >= 40 ? 'orange' : 'red' }}>{result.overallScore}</span>/100</p>
            <p><strong>Common Themes:</strong> {formatAreasData(result.commonThemes)}</p>
          </>
        )}

        {moduleKey === 'colorPsychology' && (
          <>
            <p><strong>Mood Score:</strong> <span className={styles.scoreText} style={{ color: result.moodScore >= 70 ? 'green' : result.moodScore >= 40 ? 'orange' : 'red' }}>{result.moodScore}</span>/100</p>
            <p><strong>Primary Profile:</strong> {formatCategoryName(result.overallProfile)}</p>
            <p><strong>Dominant Color:</strong> {result.dominantColor}</p>
          </>
        )}

        {result.dominantEmotion && (
          <p>
            <strong>Dominant Emotion:</strong> <EmotionBadge emotion={result.dominantEmotion} />
          </p>
        )}

        {result.strongestAreas && formatAreasData(result.strongestAreas) !== 'N/A' && (
          <p>
            <strong>Strongest Areas:</strong> {formatAreasData(result.strongestAreas)}
          </p>
        )}

        {result.weakestAreas && formatAreasData(result.weakestAreas) !== 'N/A' && (
          <p>
            <strong>Areas for Improvement:</strong> {formatAreasData(result.weakestAreas)}
          </p>
        )}

        {result.cognitiveDistortions && result.cognitiveDistortions.length > 0 && (
          <p>
            <strong>Key Issues:</strong> {result.cognitiveDistortions.join(', ')}
          </p>
        )}

        {result.secondaryColor && (
          <p>
            <strong>Secondary Color:</strong> {result.secondaryColor}
          </p>
        )}

        {result.insights && result.insights.length > 0 && (
          <p className={styles.insightText}>
            "{Array.isArray(result.insights) ? result.insights.join(' ').slice(0, 100) : result.insights.slice(0,100)}..."
          </p>
        )}
      </div>
    </div>
  );
};

// Component for the Final Analysis result
const FinalAnalysisCard = ({ result }) => {
  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'var(--accent-color-green)';
    if (score >= 0.4) return 'var(--accent-color-yellow)';
    return 'var(--danger-color)';
  };

  // Safely get recommendations, defaulting to an empty array if not present or not an array
  const recommendations = result?.recommendations && Array.isArray(result.recommendations)
    ? result.recommendations
    : [];

  // Safely get keyInsights, defaulting to an empty array if not present or not an array
  const keyInsights = result?.keyInsights && Array.isArray(result.keyInsights)
    ? result.keyInsights
    : [];

  return (
    <div className={`${styles.moduleCard} ${styles.finalAnalysisCard}`}>
      <h3>Comprehensive Mental Health Report</h3>
      <p className={styles.moduleDescription}>Your combined results provide a holistic view of your well-being.</p>
      <div className={styles.resultDetails}>
        <p>
          <strong>Overall Well-being Score:</strong>
          <span className={styles.finalScore} style={{ color: getScoreColor(result.overallScore) }}>
            {(result.overallScore * 100).toFixed(0)}/100
          </span>
        </p>
        <p><strong>Mental State Summary:</strong> {result.summary}</p>

        {keyInsights.length > 0 && (
          <div className={styles.keyInsightsGrid}>
            {keyInsights.map((insight, index) => (
              <div key={index} className={styles.insightItem}>
                {insight}
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <>
            <p><strong>Personalized Recommendations:</strong></p>
            <ul className={styles.recommendationsList}>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </>
        )}

        {result.timestamp && (
          <p className={styles.completedAt}>Generated on: {new Date(result.timestamp).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  // const { currentUser, userProfile, updateUserProfile, getUserAssessments, getJournalEntries, logout } = useAuth();
  const { currentUser, userProfile, updateUserProfile, getUserAssessments, getJournalEntries, logout, deleteAllAssessments } = useAuth();

  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    age: '',
    occupation: '',
    location: ''
  });
  const [moduleResults, setModuleResults] = useState({
    sentiment: null,
    cbt: null,
    colorPsychology: null,
    finalAnalysis: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Memoized function to load user data and assessments
  const loadUserData = useCallback(async () => {
    try {
      // Use userProfile for display purposes if available, fallback to currentUser
      setProfile({
        displayName: userProfile?.displayName || currentUser?.displayName || '',
        email: currentUser?.email || '', // Email is from auth and usually not editable
        age: userProfile?.age || '',
        occupation: userProfile?.occupation || '',
        location: userProfile?.location || ''
      });

      const assessments = await getUserAssessments();
      const progress = userProfile?.moduleProgress || {};

      let colorPsychologyData = null;
      if (assessments?.colorPsychology) {
        colorPsychologyData = {
          ...assessments.colorPsychology,
          completedAt: assessments.colorPsychology.completedAt?.toDate?.()?.toISOString() || assessments.colorPsychology.completedAt
        };
      } else if (progress?.colorPsychology?.summary?.score) {
        colorPsychologyData = {
          moodScore: progress.colorPsychology.summary.score,
          overallProfile: progress.colorPsychology.summary.primaryResult,
          completedAt: progress.colorPsychology.completedAt?.toDate?.()?.toISOString() || progress.colorPsychology.completedAt,
        };
      }

      // NEW: Fetch CBT Journal entries to create a summary for display
      const journalEntries = await getJournalEntries();
      const cbtJournalSummary = journalEntries.length > 0 ? {
        entryCount: journalEntries.length,
        lastEntryTimestamp: journalEntries[0].timestamp, // Most recent entry
        // You can add more aggregate data here, e.g., average sentiment of automatic thoughts
      } : null;

      setModuleResults({
        sentiment: assessments?.sentimentAnalysis || assessments?.sentiment || progress?.sentimentAnalysis?.summary || null,
        cbt: cbtJournalSummary, // Use the new summary for CBT
        colorPsychology: colorPsychologyData,
        finalAnalysis: assessments?.finalAnalysis || null
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data in Profile.js:', error);
      setLoading(false);
    }
  }, [currentUser, userProfile, getUserAssessments, getJournalEntries]);

  // Effect to load data on component mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle input changes for profile editing
  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    setSaveSuccess(false);
  };

  // Validate profile fields before saving
  const validateProfile = () => {
    const errors = {};
    if (!profile.displayName.trim()) {
      errors.displayName = 'Display Name is required.';
    }
    if (profile.age && (isNaN(profile.age) || profile.age <= 0 || profile.age > 120)) {
      errors.age = 'Please enter a valid age (1-120).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile({
        displayName: profile.displayName,
        age: profile.age,
        occupation: profile.occupation,
        location: profile.location
      });
      setIsEditing(false);
      setSaveSuccess(true);
      // CSS animation handles fade out after a delay
      setTimeout(() => setSaveSuccess(false), 4000); // Reset state after animation completes
    } catch (error) {
      console.error('Error updating profile:', error);
      setValidationErrors(prev => ({ ...prev, general: 'Error updating profile. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>Loading your unique profile...</div>
          </div>
        </div>
      </div>
    );
  }

  // Render the main Profile content
  return (
    
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <header className={styles.profileHeader}>
          {/* Dynamically display user's name */}
          <h1>Welcome, {profile.displayName || 'User'}!</h1>
          <p>Explore your insights and manage your account details.</p>
        </header>

        {/* Profile Information Section */}
        <section style={{ marginBottom: '40px' }}>
          <div className={styles.sectionHeading}>
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button
                className={styles.primaryButton}
                onClick={() => {
                  setIsEditing(true);
                  setSaveSuccess(false);
                  setValidationErrors({});
                }}
              >
                Edit Profile
              </button>
            ) : (
              <div className={styles.buttonGroup}>
                <button
                  className={styles.primaryButton}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setIsEditing(false);
                    setValidationErrors({});
                    setSaveSuccess(false);
                    loadUserData();
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <p className={styles.successMessage}>
              Profile updated successfully!
            </p>
          )}
          {validationErrors.general && (
            <p className={styles.errorText}>
              {validationErrors.general}
            </p>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={profile.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your display name"
              className={validationErrors.displayName ? styles.inputError : ''}
            />
            {validationErrors.displayName && (
              <p className={styles.errorText}>
                {validationErrors.displayName}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled={true}
            />
            <small className={styles.errorText} style={{ color: 'var(--text-light)', display: 'block' }}>
              Email cannot be changed
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div className={styles.formGroup}>
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                disabled={!isEditing}
                placeholder="Your age"
                className={validationErrors.age ? styles.inputError : ''}
              />
              {validationErrors.age && (
                <p className={styles.errorText}>
                  {validationErrors.age}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="occupation">Occupation</label>
              <input
                id="occupation"
                type="text"
                value={profile.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                disabled={!isEditing}
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={profile.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
              placeholder="Your location"
            />
          </div>
        </section>

        {/* Assessment Results Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 className={styles.sectionHeading}>Your Assessment Insights</h2>

          {/* All assessment sections in one row (on larger screens) */}
          <div className={styles.moduleResultsGrid}>
            <ModuleResultCard
              title="📊 Sentiment Analysis"
              result={moduleResults.sentiment}
              moduleKey="sentiment"
              description="Analyzes your emotional patterns and sentiment trends."
              getScoreColorClass={getScoreColorClass} // Pass as prop
              formatDate={formatDate} // Pass as prop
            />

            <ModuleResultCard
              title="✍️ CBT Journaling"
              result={moduleResults.cbt}
              moduleKey="cbt"
              description="A record of your thought reframing exercises and emotional shifts."
              getScoreColorClass={getScoreColorClass} // Pass as prop
              formatDate={formatDate} // Pass as prop
            />

            <ModuleResultCard
              title="🎨 Color Psychology"
              result={moduleResults.colorPsychology}
              moduleKey="colorPsychology"
              description="Reveals personality traits through color preferences."
              getScoreColorClass={getScoreColorClass} // Pass as prop
              formatDate={formatDate} // Pass as prop
            />
              {userProfile?.moduleProgress?.finalAnalysis?.summary ? (
  <ModuleResultCard
    title="Final Comprehensive Result"
    result={{
      ...userProfile.moduleProgress.finalAnalysis.summary,
      score: userProfile.moduleProgress.finalAnalysis.summary?.overallScore || 0,
      completedAt: userProfile.moduleProgress.finalAnalysis.completedAt,
      insights: userProfile.moduleProgress.finalAnalysis.summary?.insights,
      recommendations: userProfile.moduleProgress.finalAnalysis.summary?.recommendations,
      summary: userProfile.moduleProgress.finalAnalysis.summary?.summary,
    }}
    moduleKey="finalAnalysis"
    description="This summary combines all modules using a neural network to give you a final insight."
    getScoreColorClass={getScoreColorClass}
    formatDate={formatDate}
  />
) : (
  <div className={styles.moduleCardEmpty}>
    <h3>Final Comprehensive Result</h3>
    <p>Please complete all modules to unlock your mental health summary.</p>
    <a href="/final-result" className={styles.callToAction}>
      View Final Analysis →
    </a>
  </div>
)}




          </div>

          <div style={{ marginTop: '30px' }}>
            <FinalAnalysisCard result={moduleResults.finalAnalysis} />
          </div>
        </section>

        {/* Account Actions Section */}
        <section style={{ borderTop: '2px solid var(--border-color)', paddingTop: '40px' }}>
          <h2 className={styles.sectionHeading}>Account Actions</h2>

          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryButton}
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </button>

            {moduleResults.finalAnalysis && (
              <button
                className={styles.primaryButton}
                onClick={() => window.location.href = '/final-result'}
              >
                View Detailed Analysis
              </button>
            )}

            <button
              className={styles.dangerButton}
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
  className={styles.dangerButton}
  onClick={async () => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete all assessment data? This action cannot be undone.");
    if (confirmDelete) {
      try {
        await deleteAllAssessments();
        alert("✅ All assessment data deleted.");
        loadUserData(); // Refresh profile with no assessments
      } catch (err) {
        alert("❌ Failed to delete data: " + err.message);
      }
    }
  }}
>
  Delete All Assessments
</button>


          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;