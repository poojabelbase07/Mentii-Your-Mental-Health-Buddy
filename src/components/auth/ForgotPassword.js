import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/Login.module.css'; // Reuse your existing styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setEmail(value);
    // Clear messages when user starts typing
    if (error) setError('');
    if (message) setMessage('');
  };

  const validateEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (trimmedEmail.length > 254) {
      setError('Email address is too long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage(
        'Password reset email sent! Check your inbox and follow the instructions to reset your password.'
      );
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(getErrorMessage(error.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Add timeout for success message
useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 30000); // Clear message after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/invalid-email':
        return 'Invalid email address format';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many password reset requests. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again';
      default:
        return errorCode || 'Failed to send password reset email. Please try again';
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Reset Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className={error ? styles.error : ''}
              placeholder="Enter your email address"
              disabled={loading}
              autoComplete="email"
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>

          <button 
            type="submit" 
            className={styles.authButton} 
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        {message && (
          <div className={`${styles.successMessage} ${styles.messageBox}`}>
            {message}
          </div>
        )}

        <div className={styles.authFooter}>
          <p>
            Remember your password?{' '}
            <Link to="/login" className={styles.authLink}>
              Back to Sign In
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.authLink}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;