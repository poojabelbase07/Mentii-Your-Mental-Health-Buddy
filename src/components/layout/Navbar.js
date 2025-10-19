import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import styles from '../Home.module.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <motion.div 
          className={styles.navBrand}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className={styles.brandLink}>
            <span className={styles.brandIcon}>🌟</span>
            Mentii
          </Link>
        </motion.div>
        
        <div className={styles.navLinks}>
          {currentUser ? (
            <div className={styles.userMenu}>
              <div className={styles.quickNav}>
                <motion.button
                  onClick={() => handleNavClick('/')}
                  className={styles.navButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Home
                </motion.button>
                <motion.button
                  onClick={() => handleNavClick('/activities')}
                  className={styles.navButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Activities
                </motion.button>
                <motion.button
                  onClick={() => handleNavClick('/games')}
                  className={styles.navButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Games
                </motion.button>
                
                <motion.button
                  onClick={() => handleNavClick('/dashboard')}
                  className={styles.navButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
                <motion.button
                  onClick={() => handleNavClick('/profile')}
                  className={styles.navButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Profile
                </motion.button>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>
                  Hi, {(currentUser?.displayName?.split(' ')[0]) || (currentUser?.email?.split('@')[0]) || 'User'}! 👋

                </span>
                <motion.button 
                  onClick={handleLogout} 
                  className={styles.logoutBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className={styles.loginBtn}>
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/signup" className={styles.signupBtn}>
                  Get Started
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
