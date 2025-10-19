import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import styles from './Bashboard.module.css';
import Footer from '@/components/layout/Footer';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      id: 'sentimentAnalysis',
      title: 'Sentimental Analysis',
      description: 'Analyze your emotional patterns and feelings through text input',
      icon: '💭',
      path: '/sentimental-analysis',
      color: styles.moduleBlue,
      features: ['Text Analysis', 'Emotion Detection', 'Mood Tracking']
    },
    {
      id: 'cbt', // Keep the ID 'cbt' for consistency in userProfile.moduleProgress
      title: 'CBT Journaling', // UPDATED TITLE
      description: 'Record, reframe, and analyze your thoughts using Cognitive Behavioral Therapy principles.', // UPDATED DESCRIPTION
      icon: '✍️', // NEW ICON (or '📝' or '📖')
      path: '/cbt-journal', // UPDATED PATH
      color: styles.moduleGreen,
      features: ['Thought Reframing', 'Emotion Tracking', 'Cognitive Distortions'] // UPDATED FEATURES
    },
    {
      id: 'colorPsychology',
      title: 'Color Psychology',
      description: 'Discover psychological insights through color preferences and associations',
      icon: '🎨',
      path: '/color-psychology',
      color: styles.modulePurple,
      features: ['Color Therapy', 'Personality Insights', 'Mood Colors']
    }
  ];

  const getModuleStatus = (moduleId) => {
    // This logic needs to consider that journaling might not have a simple 'completed' status.
    // For now, we can check if the user has *any* journal entries.
    if (moduleId === 'cbt') {
      // Assuming userProfile.moduleProgress.cbt.summary.entryCount exists after a save
      // or you could check if the user has any entries by fetching them in AuthContext
      // and providing a flag in userProfile.
      return userProfile?.moduleProgress?.cbt?.summary?.entryCount > 0 ? 'completed' : 'pending';
    }
    return userProfile?.moduleProgress?.[moduleId]?.completed ? 'completed' : 'pending';
  };

  const getModuleScore = (moduleId) => {
    // For CBT, you might want to show the count of entries or a derived score.
    if (moduleId === 'cbt') {
      return userProfile?.moduleProgress?.cbt?.summary?.entryCount ?? 0; // Display entry count
    }
    return userProfile?.moduleProgress?.[moduleId]?.summary?.score ?? null;
  };

  const formatDate = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleRetake = async (moduleId) => {
    const confirmReset = window.confirm(`Are you sure you want to reset your progress for "${moduleId}"?`);
    if (!confirmReset) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`moduleProgress.${moduleId}`]: {
          completed: false,
          completedAt: null,
          assessmentId: null,
          summary: null
        }
      });
      alert('Module progress has been reset.');
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset module:', err);
      alert('Error resetting module progress.');
    }
  };

  const handleResetAllModules = async () => {
    const confirmReset = window.confirm('Are you sure you want to reset all assessment modules? This cannot be undone.');
    if (!confirmReset) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updates = {};

      modules.forEach((module) => {
        updates[`moduleProgress.${module.id}`] = {
          completed: false,
          completedAt: null,
          assessmentId: null,
          summary: null
        };
      });

      await updateDoc(userRef, updates);
      alert('All module progress has been reset.');
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset all modules:', err);
      alert('Error resetting all module progress.');
    }
  };

  const getCompletedCount = () => {
    if (!userProfile?.moduleProgress) return 0;
    return Object.values(userProfile.moduleProgress).filter((module) => module.completed).length;
  };

  const canViewFinalResult = () => getCompletedCount() === 3;
  const getProgressPercentage = () => (getCompletedCount() / 3) * 100;

  return (
    <div>
    <div className={styles.pageContainer}>
      <main className={styles.dashboardMain}>
        <div className={styles.container}>
          <section className={styles.welcomeSection}>
            {currentUser?.displayName && (
              <p className={styles.welcomeUser}>Welcome back, <strong>{currentUser.displayName}</strong> 👋</p>
            )}
            <h2>Your Mental Health Journey</h2>
            <p>Complete all three assessments to get your personalized mental health insights and recommendations.</p>
          </section>

          <section className={styles.progressSection}>
            <div className={`${styles.progressCard} ${styles.card}`}>
              <h3>Assessment Progress</h3>
              <div className={styles.progressVisual}>
                <div className={styles.progressCircle}>
                  <svg className={styles.progressRing} width="120" height="120">
                    <circle className={styles.progressRingCircleBg} stroke="#e5e7eb" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60" />
                    <circle
                      className={styles.progressRingCircle}
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - getProgressPercentage() / 100)}`}
                    />
                  </svg>
                  <div className={styles.progressText}>
                    <span className={styles.progressNumber}>{getCompletedCount()}/3</span>
                    <span className={styles.progressLabel}>Complete</span>
                  </div>
                </div>
                <div className={styles.progressDetails}>
                  <p className={styles.progressDescription}>
                    {getCompletedCount() === 0 && "Start your journey by completing your first assessment"}
                    {getCompletedCount() === 1 && "Great start! Continue with your next assessment"}
                    {getCompletedCount() === 2 && "Almost there! Complete your final assessment"}
                    {getCompletedCount() === 3 && "Congratulations! All assessments completed"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.modulesSection}>
            <h3 className={styles.sectionTitle}>Assessment Modules</h3>

            <div className={styles.modulesGrid}>
              {modules.map((module) => (
                <div key={module.id} className={`${styles.moduleCard} ${styles.card} ${module.color}`}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleIcon}><span>{module.icon}</span></div>
                    <div className={styles.moduleStatusBadge}>
                      <span className={`${styles.statusIndicator} ${styles[getModuleStatus(module.id)]}`}>
                        {getModuleStatus(module.id) === 'completed' ? '✓' : '○'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.moduleContent}>
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>
                    {getModuleStatus(module.id) === 'completed' && getModuleScore(module.id) !== null && (
                      <p className={styles.moduleScore}>
                        {module.id === 'cbt' 
                          ? `Entries: ${getModuleScore(module.id)}`
                          : `Score: ${getModuleScore(module.id)}`
                        }
                      </p>
                    )}
                    <ul className={styles.moduleFeatures}>
                      {module.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                    {getModuleStatus(module.id) === 'completed' && userProfile?.moduleProgress?.[module.id]?.completedAt && (
                      <p className={styles.moduleCompletedAt}>
                        Completed on: {formatDate(userProfile.moduleProgress[module.id].completedAt)}
                      </p>
                    )}
                  </div>
                  <div className={styles.moduleFooter}>
                    <div className={styles.moduleStatusText}>
                      Status: <span className={styles[getModuleStatus(module.id)]}>
                        {getModuleStatus(module.id) === 'completed' ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    <Link
                      to={module.path}
                      className={`${styles.btn} ${
                        getModuleStatus(module.id) === 'completed'
                          ? styles.btnSecondary
                          : styles.btnPrimary
                      } ${styles.moduleBtn}`}
                    >
                      {module.id === 'cbt' 
                        ? (getModuleStatus(module.id) === 'completed' ? 'Continue Journaling' : 'Start Journaling')
                        : (getModuleStatus(module.id) === 'completed' ? 'Review & Retake' : 'Start Assessment')
                      }
                    </Link>
                    {getModuleStatus(module.id) === 'completed' && module.id !== 'cbt' && (
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.retakeBtn}`}
                        onClick={() => handleRetake(module.id)}
                      >
                        Reset Progress
                      </button>
                    )}
                    {/* For CBT, retake implies clearing entries, which might be a separate action */}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset All Assessments Button moved here at the bottom */}
            <div className={styles.resetAllButtonContainer}>
              <button
                className={`${styles.btn} ${styles.btnDanger} ${styles.resetAllButton}`}
                onClick={handleResetAllModules}
                data-tooltip="Reset all module progress at once"
              >
                Reset Assessments
              </button>
            </div>
          </section>

          <section className={styles.finalResultSection}>
            <div className={`${styles.finalResultCard} ${styles.card}`}>
              <div className={styles.finalResultContent}>
                <h3>Complete Mental Health Analysis</h3>
                <p>
                  {canViewFinalResult()
                    ? "All assessments completed! View your comprehensive mental health report with personalized insights and recommendations."
                    : "Complete all three assessment modules to unlock your comprehensive mental health analysis with personalized insights."
                  }
                </p>
                <div className={styles.finalResultActions}>
                  {canViewFinalResult() ? (
                    <Link to="/final-result" className={`${styles.btn} ${styles.btnSuccess} ${styles.finalResultBtn}`}>
                      <span>🎯</span>
                      View Complete Analysis
                    </Link>
                  ) : (
                    <button className={`${styles.btn} ${styles.btnDisabled} ${styles.finalResultBtn}`} disabled>
                      <span>🔒</span>
                      Complete All Assessments First ({getCompletedCount()}/3)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    <Footer/>
    </div>
  );
};

export default Dashboard;