import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Home.module.css';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const decorationsY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Activity cards data
  const activities = [
    {
      icon: '🧩',
      title: 'Brain Puzzles',
      description: 'Challenge your mind with engaging puzzles and cognitive games.',
      color: 'purple',
      link: '/games'
    },
    {
      icon: '📝',
      title: 'Calm Zone',
      description: 'Express your thoughts and feelings through structured journaling exercises.',
      color: 'orange',
      link: '/calm'
    },
    {
      icon: '🎵',
      title: 'Mental Health Resource',
      description: 'Discover curated playlists and interactive music experiences.',
      color: 'green',
      link: '/mentalhaccess'
    }
  ];

  // Floating ball animations
  const ballVariants = {
    animate: (custom) => ({
      y: [0, -20 - custom * 5, 0],
      x: [0, 10 + custom * 3, 0],
      transition: {
        duration: 3 + custom * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: custom * 0.5
      }
    })
  };

  return (
    <div className={styles.homeContainer}>
      {/* Refactored: Navbar component */}
      <Navbar />

      {/* Enhanced Hero Section with Parallax */}
      <motion.div className={styles.heroSection} style={{ y: heroY }}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Find <span className={styles.highlightText}>Joy</span> and{' '}
            <span className={styles.highlightText}>Peace</span> in Every Moment
          </motion.h1>
          
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover engaging activities, therapeutic games, and personalized support to help you 
            navigate your mental health journey with playfulness and care.
          </motion.p>
          
          <motion.div 
            className={styles.heroButtons}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {currentUser ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/activities" className={`${styles.btn} ${styles.btnPrimary}`}>
                    <span>🎯</span> Explore Activities
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/games" className={`${styles.btn} ${styles.btnSecondary}`}>
                    <span>🎮</span> Play Games
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="https://one-chat-mentii.vercel.app/" className={`${styles.btn} ${styles.btnTertiary}`}>
                    <span>💬</span> Talk to Mentii
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
                    <span>✨</span> Get Started Free
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`}>
                    <span>👋</span> Welcome Back
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Stats Section for logged-in users */}
          {currentUser && (
            <motion.div 
              className={styles.heroStats}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className={styles.stat}>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Activities Available</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>8</span>
                <span className={styles.statLabel}>Games to Play</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>AI Support</span>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Enhanced floating decorations with parallax */}
        <motion.div className={styles.heroDecorations} style={{ y: decorationsY }}>
          {[...Array(6)].map((_, index) => (
            <motion.div 
              key={index}
              className={`${styles.floatingBall} ${styles[`ball${index + 1}`]}`}
              variants={ballVariants}
              animate="animate"
              custom={index}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced Activities Section */}
      <div className={styles.activitiesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className={styles.sectionSubtitle}>WHAT WE OFFER</p>
            <h2 className={styles.sectionTitle}>Engaging Activities for Your Mind</h2>
            <p className={styles.sectionDescription}>
              Discover a variety of evidence-based activities designed to help you relax, 
              express yourself, and find moments of peace throughout your day.
            </p>
          </motion.div>

          <div className={styles.activitiesGrid}>
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.title}
                className={styles.activityCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
                onClick={() => navigate(activity.link)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`${styles.activityIcon} ${styles[activity.color]}`}>
                  <span>{activity.icon}</span>
                </div>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
                <motion.div 
                  className={styles.cardArrow}
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Balance Section */}
      <div className={styles.balanceSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.balanceContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.balanceText}>
              <h2>Ready to Find Your Balance?</h2>
              <p>
                {currentUser 
                  ? "Continue your wellness journey with personalized activities and games tailored to your needs."
                  : "Join thousands of users who have found peace and joy through our interactive mental wellness platform."
                }
              </p>
              <div className={styles.balanceButtons}>
                {currentUser ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/games" className={`${styles.btn} ${styles.btnPrimary}`}>
                        🎮 Start Playing
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/activities" className={`${styles.btn} ${styles.btnSecondary}`}>
                        🌱 Explore Activities
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
                        🚀 Join Free Today
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`}>
                        🔑 Sign In
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced floating decorations */}
        <div className={styles.balanceDecorations}>
          {[...Array(3)].map((_, index) => (
            <motion.div 
              key={index}
              className={`${styles.floatingBall} ${styles[`balanceBall${index + 1}`]}`}
              animate={{
                y: [0, -15 - index * 5, 0],
                x: [0, 8 + index * 2, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Daily Dose Section */}
      <div className={styles.dailyDoseSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.dailyDoseContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.dailyDoseText}>
              <h2>Find <span className={styles.highlightText}>Balance</span> in Your Day</h2>
            </div>
            <motion.div 
              className={styles.dailyDoseCard}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.doseHeader}>
                <span className={styles.doseLabel}>DAILY DOSE OF JOY</span>
                <span className={styles.doseTime}>Updated Daily</span>
              </div>
              <div className={styles.doseContent}>
                <div className={styles.doseImage}>
                  <div className={styles.placeholderImage}>
                    <span>😊</span>
                    <p>Mood Booster</p>
                  </div>
                </div>
                <div className={styles.doseInfo}>
                  <h3>Discover Daily Moments of Happiness</h3>
                  <p>
                    From uplifting quotes to therapeutic activities, find something 
                    new each day to brighten your mood and support your wellbeing.
                  </p>
                  {currentUser && (
                    <motion.button
                      onClick={() => navigate('/activities?daily=true')}
                      className={styles.doseButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Today's Content →
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer/>
     
    </div>
  );
};

export default Home;
