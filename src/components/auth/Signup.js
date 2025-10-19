
// src/components/auth/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/Signup.module.css'; // Import the CSS module

const Signup = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    if (password.length >= 12) score++;
    
    if (score < 3) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    } else if (formData.displayName.trim().length > 50) {
      newErrors.displayName = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.displayName.trim())) {
      newErrors.displayName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) { // Changed from 6 to 8
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      await signup(formData.email, formData.password, formData.displayName.trim());
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      setErrors({ submit: getErrorMessage(error.code || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google signup failed:', error);
      setErrors({ submit: getErrorMessage(error.code || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/popup-closed-by-user':
        return 'Sign-up cancelled';
      case 'auth/popup-blocked':
        return 'Popup blocked. Please allow popups and try again';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later';
      case 'auth/operation-not-allowed':
        return 'This sign-up method is not enabled';
      default:
        return errorCode || 'Signup failed. Please try again';
    }
  };

  const renderGoogleSignUp = () => (
    <div className={styles.googleSignInSection}>
      <button
        type="button"
        className={`${styles.authButton} ${styles.google}`}
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Continue with Google'}
      </button>
      <div className={styles.divider}>
        <span>or</span>
      </div>
    </div>
  );

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Join Mentii</h1>
          <p>Start your mental health journey today</p>
        </div>

        {renderGoogleSignUp()}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className={errors.displayName ? styles.error : ''}
              placeholder="Enter your full name"
              disabled={loading}
              autoComplete="name"
            />
            {errors.displayName && <span className={styles.errorMessage}>{errors.displayName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.error : ''}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? styles.error : ''}
              placeholder="Create a strong password"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            {formData.password && (
              <div className={`${styles.passwordStrength} ${styles[passwordStrength]}`}>
                Password strength: {passwordStrength}
              </div>
            )}
           <small className={styles.formHelp}>
             Password must be at least 8 characters with uppercase, lowercase, number, and special character
           </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? styles.error : ''}
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.authButton} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {errors.submit && (
          <div className={`${styles.errorMessage} ${styles.submitError}`}>{errors.submit}</div>
        )}

        <div className={styles.authFooter}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.authLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
