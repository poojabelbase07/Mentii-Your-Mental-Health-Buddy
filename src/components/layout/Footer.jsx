import { Link } from "react-router-dom";
import styles from './Footer.module.css';
import { useAuth } from '../../contexts/AuthContext';

const Footer = () => {
  const { currentUser, logout } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
     <footer className={styles.footerSection}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <h4>🏠 Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/activities">Activities</Link></li>
                <li><Link to="/games">Games</Link></li>
                <li><Link to="https://one-chat-mentii.vercel.app/">AI Chat</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>📚 Resources</h4>
              <ul>
                <li><Link to="/about">About Mentii</Link></li>
                <li><Link to="/mentalhaccess">Mental Health Resources</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>🤝 Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/feedback">Send Feedback</Link></li>
                {currentUser && <li><Link to="/profile">My Profile</Link></li>}
              </ul>
            </div>
            {!currentUser && (
              <div className={styles.footerColumn}>
                <h4>🚀 Get Started</h4>
                <ul>
                  <li><Link to="/signup">Create Account</Link></li>
                  <li><Link to="/login">Sign In</Link></li>
                  <li><Link to="/demo">Try Demo</Link></li>
                </ul>
              </div>
            )}
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerInfo}>
              <p>&copy; 2025 Mentii. Made with 💙 for mental wellness.</p>
              <div className={styles.footerSocial}>
                <span>Follow us for daily wellness tips</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
