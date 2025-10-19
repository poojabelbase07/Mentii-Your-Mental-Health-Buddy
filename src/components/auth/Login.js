import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/Login.module.css'; // Import the CSS module

const Login = () => {
  const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone', 'anonymous'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    verificationCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState(1); // 1: enter phone, 2: enter code
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  const {
    signin,
    signinAnonymously,
    sendPhoneVerification,
    verifyPhoneCode,
    createRecaptchaVerifier,
    signInWithGoogle,
    currentUser 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Cleanup on component unmount or auth method change
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.warn('Error clearing recaptcha:', error);
        }
      }
    };
  }, [authMethod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input
    let sanitizedValue = value;
    if (name === 'email') {
      sanitizedValue = value.trim().toLowerCase();
    } else if (name === 'phoneNumber') {
      // Remove any non-digit characters except +
      sanitizedValue = value.replace(/[^\d+]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmailForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneNumber = () => {
    const newErrors = {};
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be in international format (e.g., +1234567890)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = () => {
    const newErrors = {};
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
   
  const checkRateLimit = () => {
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      throw new Error(`Too many attempts. Try again in ${remainingTime} seconds.`);
    }
    return true;
  };

  // const handleEmailLogin = async (e) => {
  //   e.preventDefault();
  //   if (!validateEmailForm()) return;

  //   setLoading(true);
  //   setErrors({});
    
  //   try {
  //     const result = await signin(formData.email, formData.password);
  //     if (result && result.user) {
  //       navigate(from, { replace: true });
  //     }
  //   } catch (error) {
  //     setErrors({ submit: getErrorMessage(error.code || error.message) });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;
  
    try {
      checkRateLimit(); // Add this line
    } catch (error) {
      setErrors({ submit: error.message });
      return;
    }
  
    setLoading(true);
    setErrors({});
    
    try {
      const result = await signin(formData.email, formData.password);
      if (result && result.user) {
        setAttemptCount(0); // Reset on success
        navigate(from, { replace: true });
      }
    } catch (error) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Lock out after 5 failed attempts
      if (newAttemptCount >= 5) {
        setLockoutTime(Date.now() + 300000); // 5 minutes
      }
      
      setErrors({ submit: getErrorMessage(error.code || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});
    try {
      const result = await signInWithGoogle();
      if (result?.user) navigate(from, { replace: true });
    } catch (error) {
      setErrors({ submit: getErrorMessage(error.code || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const result = await signinAnonymously();
      if (result && result.user) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setErrors({ submit: getErrorMessage(error.code || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    
    if (phoneStep === 1) {
      // Step 1: Send verification code
      if (!validatePhoneNumber()) return;

      setLoading(true);
      setErrors({});

      try {
        // Create recaptcha verifier
        if (!recaptchaRef.current) {
          recaptchaRef.current = createRecaptchaVerifier('recaptcha-container');
        }

        const confirmation = await sendPhoneVerification(formData.phoneNumber, recaptchaRef.current);
        setConfirmationResult(confirmation);
        setPhoneStep(2);
      } catch (error) {
        console.error('Phone verification failed:', error);
        setErrors({ submit: getErrorMessage(error.code || error.message) });
        // Reset recaptcha on error
        if (recaptchaRef.current) {
          recaptchaRef.current.clear();
          recaptchaRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Step 2: Verify code
      if (!validateVerificationCode()) return;

      setLoading(true);
      setErrors({});

      try {
        const result = await verifyPhoneCode(formData.verificationCode);
                if (result && result.user) {
          navigate(from, { replace: true });
        }
      } catch (error) {
        setErrors({ submit: getErrorMessage(error.code || error.message) });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetPhoneAuth = () => {
    setPhoneStep(1);
    setConfirmationResult(null);
    setFormData(prev => ({ ...prev, verificationCode: '' }));
    setErrors({});
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code';
      case 'auth/code-expired':
        return 'Verification code has expired. Please request a new one';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later';
      default:
        return errorCode || 'Authentication failed. Please try again';
    }
  };

  const renderGoogleSignIn = () => (
    <div className={styles.googleSignInSection}>
      <button
        className={styles.authButton}
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
      <div className={styles.divider}>
        <span>or</span>
      </div>
    </div>
  );

  const renderAuthMethodSelector = () => (
    <div className={styles.authMethodSelector}>
      <div className={styles.methodTabs}>
        <button
          type="button"
          className={`${styles.methodTab} ${authMethod === 'email' ? styles.active : ''}`}
          onClick={() => setAuthMethod('email')}
        >
          Email
        </button>
        <button
          type="button"
          className={`${styles.methodTab} ${authMethod === 'phone' ? styles.active : ''}`}
          onClick={() => setAuthMethod('phone')}
        >
          Phone
        </button>
        <button
          type="button"
          className={`${styles.methodTab} ${authMethod === 'anonymous' ? styles.active : ''}`}
          onClick={() => setAuthMethod('anonymous')}
        >
          Guest
        </button>
      </div>
    </div>
  );

  // const renderEmailForm = () => (
  //   <form onSubmit={handleEmailLogin} className={styles.authForm}>
  //     <div className={styles.formGroup}>
  //       <label htmlFor="email">Email</label>
  //       <input
  //         type="email"
  //         id="email"
  //         name="email"
  //         value={formData.email}
  //         onChange={handleChange}
  //         className={errors.email ? styles.error : ''}
  //         placeholder="Enter your email"
  //         disabled={loading}
  //         autoComplete="email"
  //       />
  //       {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
  //     </div>

  //     <div className={styles.formGroup}>
  //       <label htmlFor="password">Password</label>
  //       <input
  //         type="password"
  //         id="password"
  //         name="password"
  //         value={formData.password}
  //         onChange={handleChange}
  //         className={errors.password ? styles.error : ''}
  //         placeholder="Enter your password"
  //         disabled={loading}
  //         autoComplete="current-password"
  //       />
  //       {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
  //     </div>

      

  //     <button type="submit" className={styles.authButton} disabled={loading}>
  //       {loading ? 'Signing In...' : 'Sign In'}
  //     </button>
  //   </form>
  // );

// Add this to your renderEmailForm function, after the password input field:
  
const renderEmailForm = () => (
  <form onSubmit={handleEmailLogin} className={styles.authForm}>
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
        placeholder="Enter your password"
        disabled={loading}
        autoComplete="current-password"
      />
      {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
      
      {/* Add this forgot password link */}
      <div className={styles.forgotPasswordContainer}>
        <Link to="/forgot-password" className={styles.forgotPasswordLink}>
          Forgot your password?
        </Link>
      </div>
    </div>

    <button type="submit" className={styles.authButton} disabled={loading}>
      {loading ? 'Signing In...' : 'Sign In'}
    </button>
  </form>
);

  const renderPhoneForm = () => (
    <form onSubmit={handlePhoneLogin} className={styles.authForm}>
      {phoneStep === 1 ? (
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={errors.phoneNumber ? styles.error : ''}
            placeholder="+1234567890"
            disabled={loading}
          />
          {errors.phoneNumber && <span className={styles.errorMessage}>{errors.phoneNumber}</span>}
          <small className={styles.formHelp}>Enter phone number with country code</small>
        </div>
      ) : (
        <div>
          <div className={styles.formGroup}>
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleChange}
              className={errors.verificationCode ? styles.error : ''}
              placeholder="123456"
              disabled={loading}
              maxLength="6"
            />
            {errors.verificationCode && <span className={styles.errorMessage}>{errors.verificationCode}</span>}
            <small className={styles.formHelp}>Enter the 6-digit code sent to {formData.phoneNumber}</small>
          </div>
          <button
            type="button"
            className={styles.authButtonSecondary}
            onClick={resetPhoneAuth}
            disabled={loading}
          >
            Use Different Number
          </button>
        </div>
      )}

      <button type="submit" className={styles.authButton} disabled={loading}>
        {loading ? 'Processing...' : phoneStep === 1 ? 'Send Code' : 'Verify & Sign In'}
      </button>

      <div id="recaptcha-container"></div>
    </form>
  );

  const renderAnonymousForm = () => (
    <div className={styles.authForm}>
      <div className={styles.anonymousInfo}>
        <p>Continue as a guest to explore the app without creating an account.</p>
        <p><small>Note: Your data won't be saved permanently.</small></p>
      </div>
      
      <button
        type="button"
        className={styles.authButton}
        onClick={handleAnonymousLogin}
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Continue as Guest'}
      </button>
    </div>
  );

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your mental health journey</p>
        </div>

        {renderGoogleSignIn()}

        {renderAuthMethodSelector()}

        {authMethod === 'email' && renderEmailForm()}
        {authMethod === 'phone' && renderPhoneForm()}
        {authMethod === 'anonymous' && renderAnonymousForm()}

        {errors.submit && (
          <div className={styles.errorMessage}>{errors.submit}</div>
        )}

        <div className={styles.authFooter}>
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

export default Login;
