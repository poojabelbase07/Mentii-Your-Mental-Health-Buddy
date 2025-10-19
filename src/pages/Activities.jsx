import React, { useState } from 'react';
import { Heart, Moon, Dumbbell, Brain, HelpCircle, Palette, Timer } from 'lucide-react';

// Import all activity components (you'll create these next)
import GratitudeLog from '../activities/GratitudeLog';
import SleepTracker from '../activities/SleepTracker'; // Assuming you've uncommented this
import ExerciseTracker from '../activities/ExerciseTracker'; // Assuming you've uncommented this
// import MeditationTracker from './components/MeditationTracker';
// import SelfHelpQuizzes from './components/SelfHelpQuizzes';
// import ArtZoneActivity from './components/ArtZoneActivity';
// import PomodoroSessions from './components/PomodoroSessions';

import styles from './Activities.module.css';
import Footer from '@/components/layout/Footer';
import { div } from '@tensorflow/tfjs';

const Activities = ({ userId }) => {
  // 1. State to keep track of the currently active activity
  const [activeActivity, setActiveActivity] = useState(null);

  const activities = [
    {
      id: 'gratitude',
      title: 'Gratitude Log',
      description: 'Track daily gratitude and mood',
      icon: Heart,
      color: '#8b5cf6',
      component: GratitudeLog,
      available: true
    },
    {
      id: 'sleep',
      title: 'Sleep Tracker',
      description: 'Monitor sleep patterns and quality',
      icon: Moon,
      color: '#3b82f6',
      component: SleepTracker, // Make sure this is uncommented and available: true in your actual code
      available: true
    },
    {
      id: 'exercise',
      title: 'Exercise Tracker',
      description: 'Log workouts and fitness goals',
      icon: Dumbbell,
      color: '#10b981',
      component: ExerciseTracker, // Make sure this is uncommented and available: true in your actual code
      available: true
    },
    {
      id: 'meditation',
      title: 'Meditation Tracker',
      description: 'Track mindfulness and meditation sessions',
      icon: Brain,
      color: '#f59e0b',
      component: null, // MeditationTracker,
      available: false
    },
    {
      id: 'quizzes',
      title: 'Self Help Quizzes',
      description: 'Assess and improve mental wellness',
      icon: HelpCircle,
      color: '#ef4444',
      component: null, // SelfHelpQuizzes,
      available: false
    },
    {
      id: 'art',
      title: 'Art Zone',
      description: 'Creative expression and art therapy',
      icon: Palette,
      color: '#ec4899',
      component: null, // ArtZoneActivity,
      available: false
    },
    {
      id: 'pomodoro',
      title: 'Pomodoro Sessions',
      description: 'Focus sessions with productivity tracking',
      icon: Timer,
      color: '#f97316',
      component: null, // PomodoroSessions,
      available: false
    }
  ];

  const handleActivitySelect = (activity) => {
    if (!activity.available) {
      // IMPORTANT: Avoid using alert() in production React apps.
      // Use a custom modal or toast notification instead.
      alert('This activity is coming soon!');
      return;
    }
    setActiveActivity(activity); // Set the selected activity
  };

  // 2. Function to handle going back to the activities menu
  const handleBackToMenu = () => {
    setActiveActivity(null); // Setting activeActivity to null will render the grid of activities
  };

  // 3. Conditional rendering: If an activity is active, show it with a back button
  if (activeActivity && activeActivity.component) {
    const ActivityComponent = activeActivity.component;
    return (
      <div className={styles.activityContainer}>
        {/* This is your "Back to Activities" button */}
        <div className={styles.backButton} onClick={handleBackToMenu}>
          ← Back to Activities
        </div>
        {/* Render the selected activity component, passing userId */}
        <ActivityComponent userId={userId} />
      </div>
    );
  }

  // Otherwise, render the activities menu grid
  return (
    <div>
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Wellness Activities</h1>
        <p className={styles.subtitle}>
          Choose an activity to improve your mental health and wellbeing
        </p>
      </div>

      <div className={styles.activitiesGrid}>
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div
              key={activity.id}
              className={`${styles.activityCard} ${
                !activity.available ? styles.unavailable : ''
              }`}
              onClick={() => handleActivitySelect(activity)}
              style={{ '--activity-color': activity.color }}
            >
              <div className={styles.iconContainer}>
                <IconComponent 
                  size={32} 
                  className={styles.icon}
                />
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>
                  {activity.title}
                </h3>
                <p className={styles.cardDescription}>
                  {activity.description}
                </p>
              </div>

              {!activity.available && (
                <div className={styles.comingSoon}>
                  Coming Soon
                </div>
              )}

              <div className={styles.cardArrow}>→</div>
            </div>
          );
        })}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>7</span>
          <span className={styles.statLabel}>Activities</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>3</span> {/* Updated count for available activities */}
          <span className={styles.statLabel}>Available</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>4</span> {/* Updated count for coming soon */}
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
      </div>
    </div>
      <Footer/>
    </div>
      
  );
};

export default Activities;