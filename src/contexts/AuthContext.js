import React, { createContext, useContext, useState, useEffect } from 'react';
// import { deleteDoc } from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc, // Make sure deleteDoc is imported
  orderBy // Import orderBy for sorting
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Auth actions
  const signup = async (email, password, displayName = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await createUserProfile(userCredential.user.uid, email, displayName);
    setCurrentUser(userCredential.user);
    await refreshUserProfile(userCredential.user.uid);
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCredential.user);
    await refreshUserProfile(userCredential.user.uid);
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null); // Clear user profile on logout
  };

  const resetPassword = async (email) => {
    if (!email || !email.trim()) {
      throw new Error('auth/invalid-email');
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      throw new Error('auth/invalid-email');
    }
    
    try {
      await sendPasswordResetEmail(auth, email.trim());
      console.log('Password reset email sent to:', email);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      const cleanError = new Error(error.code || 'Failed to send reset email');
      cleanError.code = error.code;
      throw cleanError;
    }
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await createUserProfile(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
    }
    setCurrentUser(userCredential.user);
    await refreshUserProfile(userCredential.user.uid);
    return userCredential;
  };

  const signinAnonymously = async () => {
    const userCredential = await signInAnonymously(auth);
    setCurrentUser(userCredential.user);
    await refreshUserProfile(userCredential.user.uid); 
    return userCredential;
  };

  let recaptchaVerifier;
  const createRecaptchaVerifier = (containerId) => {
    if (!recaptchaVerifier?.verifier) { // Check for actual verifier instance
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, need to re-render.');
          if (recaptchaVerifier) {
            recaptchaVerifier.clear(); // Clear the existing verifier widget
          }
          recaptchaVerifier = null; 
        }
      });
      recaptchaVerifier.render().catch(err => { // Render and catch errors
          console.error("reCAPTCHA render error:", err);
          // Potentially try to clear and re-initialize or inform user
          if (recaptchaVerifier) recaptchaVerifier.clear();
          recaptchaVerifier = null;
      }); 
    }
    return recaptchaVerifier;
  };

  const sendPhoneVerification = async (phoneNumber) => {
    if (!recaptchaVerifier) {
      throw new Error("reCAPTCHA not initialized or not rendered. Please ensure it's visible or try again.");
    }
    // Ensure verifier is rendered and ready if possible, though direct check is hard.
    // Rely on RecaptchaVerifier's own error handling if not ready.
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    window.confirmationResult = confirmationResult; 
    return confirmationResult;
  };

  const verifyPhoneCode = async (code) => {
    if (!window.confirmationResult) {
      throw new Error("Phone verification not initiated or timed out.");
    }
    const userCredential = await window.confirmationResult.confirm(code);
    // If linking to an existing anonymous account, handle appropriately here or in UI
    setCurrentUser(userCredential.user);
    await refreshUserProfile(userCredential.user.uid);
    return userCredential;
  };

  const deleteAllAssessments = async () => {
    if (!currentUser) throw new Error('No user logged in');
  
    try {
      const q = query(collection(db, 'assessments'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
  
      const deletionPromises = [];
      querySnapshot.forEach(docSnap => {
        deletionPromises.push(deleteDoc(doc(db, 'assessments', docSnap.id)));
      });
  
      await Promise.all(deletionPromises);
      console.log("✅ All assessment data deleted for user:", currentUser.uid);
  
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Reset module progress correctly
      const initialModuleProgress = {
        sentimentAnalysis: { completed: false, completedAt: null, summary: null },
        cbt: { completed: false, completedAt: null, summary: null },
        colorPsychology: { completed: false, completedAt: null, summary: null },
        finalAnalysis: { completed: false, completedAt: null, summary: null },
      };

      await updateDoc(userDocRef, {
        moduleProgress: initialModuleProgress,
        lastResetAt: serverTimestamp(),
      });
  
      await refreshUserProfile(currentUser.uid);
    } catch (err) {
      console.error("❌ Failed to delete assessment data:", err);
      throw err;
    }
  };
  
  const deleteAllJournalEntries = async () => {
    if (!currentUser) throw new Error('No user logged in');
    const q = query(collection(db, 'journal_entries'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'journal_entries', docSnap.id)));
    await Promise.all(promises);
    console.log('✅ All journal entries deleted');
    // Also reset CBT module progress after deleting all entries
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            'moduleProgress.cbt': { completed: false, completedAt: null, summary: { entryCount: 0 } }
        });
        await refreshUserProfile(currentUser.uid);
    } catch (error) {
        console.error("❌ Failed to reset CBT module progress after deleting entries:", error)
    }
  };

  const createUserProfile = async (uid, email, displayName = '') => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        uid,
        email,
        displayName: displayName || email, // Ensure displayName has a fallback
        createdAt: serverTimestamp(),
        moduleProgress: {
          sentimentAnalysis: { completed: false, completedAt: null, summary: null },
          cbt: { completed: false, completedAt: null, summary: null }, // summary will be objectified by addJournalEntry
          colorPsychology: { completed: false, completedAt: null, summary: null },
          finalAnalysis: { completed: false, completedAt: null, summary: null },
        },
        lastLoginAt: serverTimestamp(),
      });
      console.log('User profile created in Firestore for:', email);
    } catch (error) {
      console.error('Error creating user profile in Firestore:', error);
      throw error;
    }
  };

  const refreshUserProfile = async (uid) => {
    if (!uid) {
        console.warn("refreshUserProfile called with no UID.");
        setUserProfile(null);
        setProfileLoading(false);
        return;
    }
    setProfileLoading(true);
    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        console.log('Refreshed user profile:', docSnap.data());
      } else {
        console.warn('No user profile found for UID:', uid, 'Attempting to create one if user is authenticated.');
        if (currentUser && currentUser.uid === uid) { // Only create if it's the current authenticated user
             await createUserProfile(uid, currentUser.email, currentUser.displayName);
             const newDocSnap = await getDoc(userDocRef);
             if (newDocSnap.exists()) {
                setUserProfile(newDocSnap.data());
             }
        } else {
            setUserProfile(null); // No profile and not the current user / no user
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setUserProfile(null); // Set to null on error
    } finally {
      setProfileLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!currentUser) throw new Error('No user logged in to update profile');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updates = {};
      for (const key in profileData) {
        if (profileData[key] !== '' && profileData[key] !== null && profileData[key] !== undefined) {
          updates[key] = profileData[key];
        }
      }

      if (Object.keys(updates).length > 0) { // Only update if there are changes
        await updateDoc(userDocRef, updates);
      }

      if (profileData.displayName !== undefined && currentUser.displayName !== profileData.displayName) {
        await updateProfile(currentUser, { displayName: profileData.displayName });
      }

      await refreshUserProfile(currentUser.uid); 
      console.log('Profile updated in Firestore and Auth (if display name changed).');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const getUserAssessments = async () => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      const q = query(collection(db, 'assessments'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const results = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        // Use moduleType from data, ensure it's a string for key
        const type = String(data.moduleType); 
        results[type] = {
          ...data,
          id: doc.id,
          // Ensure completedAt is a consistent format, prefer ISO string if converting from Timestamp
          completedAt: data.timestamp?.toDate?.() ? data.timestamp.toDate().toISOString() : (data.timestamp || data.completedAt)
        };
      });
      return results;
    } catch (err) {
      console.error('Error fetching assessments:', err);
      return {}; // Return empty object on error
    }
  };

  const saveAssessmentResult = async (moduleType, assessmentData, summaryDataForProfile) => {
    if (!currentUser) throw new Error('No user logged in');
    console.log(`🧪 saveAssessmentResult for ${moduleType} triggered`);
    
    try {
      const normalizedResult = {
        ...assessmentData,
        userId: currentUser.uid,
        moduleType: moduleType, // Ensure moduleType is correctly passed and stored
        timestamp: serverTimestamp(), // This will be the main timestamp for the assessment document
      };
      const assessmentDocRef = await addDoc(collection(db, 'assessments'), normalizedResult);
      console.log(`✅ Saved ${moduleType} assessment in 'assessments' with ID:`, assessmentDocRef.id);

      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Use summaryDataForProfile if provided, otherwise derive a basic summary
      let summaryToSave;
      if (summaryDataForProfile && Object.keys(summaryDataForProfile).length > 0) {
        summaryToSave = summaryDataForProfile;
      } else {
        // Fallback summary derivation (should ideally be handled by summaryDataForProfile)
        let derivedScore = 0;
        let derivedPrimaryResult = 'Completed';
        switch (moduleType) {
          case 'sentimentAnalysis':
            derivedPrimaryResult = assessmentData.overallSentiment || 'N/A';
            derivedScore = assessmentData.overallScore || 0;
            break;
          case 'cbt': // This case is less likely to be hit if addJournalEntry handles CBT progress
            derivedPrimaryResult = assessmentData.overallConfidence || 'N/A';
            derivedScore = assessmentData.overallConfidence || 0;
            break;
          case 'colorPsychology':
            derivedPrimaryResult = assessmentData.overallProfile || assessmentData.dominantColor || 'Completed';
            derivedScore = assessmentData.moodScore || 0;
            break;
          case 'finalAnalysis':
            derivedPrimaryResult = assessmentData.summary || 'Completed';
            derivedScore = assessmentData.overallScore || 0; // overallScore here is holisticWellnessScoreNN from finalAssessmentDataToSave
            break;
          default:
            // Keep default 'Completed' and 0 score
            break;
        }
        summaryToSave = { score: derivedScore, primaryResult: derivedPrimaryResult };
      }

      await updateDoc(userDocRef, {
        [`moduleProgress.${moduleType}`]: {
          completed: true,
          completedAt: serverTimestamp(), // Use a serverTimestamp for when moduleProgress is updated
          summary: summaryToSave // Save the determined summary
        },
        lastAssessmentAt: serverTimestamp(), // Optional: track overall last assessment activity
      });
      console.log(`✅ Updated user profile moduleProgress for ${moduleType}`);

      await refreshUserProfile(currentUser.uid);
    } catch (error) {
      console.error(`❌ Error saving ${moduleType} assessment:`, error);
      throw error;
    }
  };

  const checkPrerequisite = (currentModule) => {
    const order = {
      sentimentAnalysis: null, // No prerequisite
      cbt: 'sentimentAnalysis', // Sentiment Analysis must be complete
      colorPsychology: 'cbt'    // CBT (journaling) must be complete
    };
    const requiredModuleId = order[currentModule];
    if (!requiredModuleId) return true; // No prerequisite for this module

    // Check completion based on userProfile.moduleProgress
    // For CBT, completion might be defined by having at least one entry.
    if (requiredModuleId === 'cbt') {
        return (userProfile?.moduleProgress?.[requiredModuleId]?.summary?.entryCount ?? 0) > 0;
    }
    return userProfile?.moduleProgress?.[requiredModuleId]?.completed || false;
  };

  const getCorrectNavigationPath = (fromModule) => {
    // Defines the next module in the sequence or dashboard if it's the last one.
    const sequence = ['sentimentAnalysis', 'cbt', 'colorPsychology'];
    const currentIndex = sequence.indexOf(fromModule);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      return '/dashboard'; // Go to dashboard if module not found or it's the last
    }
    // Navigate to the next module in the sequence
    const nextModuleKey = sequence[currentIndex + 1];
    // This needs to map module keys to actual paths
    const paths = {
        'sentimentAnalysis': '/sentimental-analysis', // from Dashboard.js
        'cbt': '/cbt-journal',                   // from Dashboard.js
        'colorPsychology': '/color-psychology'     // from Dashboard.js
    };
    return paths[nextModuleKey] || '/dashboard';
  };

  const resetAllModules = async () => {
    if (!currentUser) throw new Error('No user logged in to reset modules');
    try {
      console.log('🔄 Initiating module reset for user:', currentUser.uid);
      const q = query(collection(db, 'assessments'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${deletePromises.length} assessment records.`);

      // Also delete all journal entries for the user
      await deleteAllJournalEntries(); // This will also reset CBT progress

      const userDocRef = doc(db, 'users', currentUser.uid);
      // Define the state for all modules after a full reset
      const initialModuleProgress = {
          sentimentAnalysis: { completed: false, completedAt: null, summary: null },
          cbt: { completed: false, completedAt: null, summary: { entryCount: 0 } }, // Explicitly reset entryCount
          colorPsychology: { completed: false, completedAt: null, summary: null },
          finalAnalysis: { completed: false, completedAt: null, summary: null },
      };
      await updateDoc(userDocRef, {
        moduleProgress: initialModuleProgress,
        lastResetAt: serverTimestamp(), 
      });
      console.log('✅ User moduleProgress reset in profile for all modules.');
      await refreshUserProfile(currentUser.uid);
      console.log('✨ Module reset complete and profile refreshed.');
      return true; 
    } catch (error) {
      console.error('❌ Error resetting all modules:', error);
      throw error;
    }
  };

  // UPDATED addJournalEntry to correctly handle summary initialization/update
  const addJournalEntry = async (entryData) => {
    if (!currentUser) {
      throw new Error('User not authenticated.');
    }
    try {
      const docRef = await addDoc(collection(db, 'journal_entries'), {
        ...entryData,
        userId: currentUser.uid,
        timestamp: serverTimestamp(), 
      });
      console.log('✅ Journal entry added with ID:', docRef.id);
  
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const entryCount = snapshot.size;
  
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Fetch current cbt summary to preserve other fields if any, though unlikely for now
      const userDocSnap = await getDoc(userDocRef);
      const currentCbtSummary = userDocSnap.data()?.moduleProgress?.cbt?.summary || {};
      
      const newCbtProgress = {
        completed: true, // Mark as completed (or engaged) upon first entry
        completedAt: serverTimestamp(), 
        summary: {
          ...currentCbtSummary, // Preserve existing summary fields
          entryCount: entryCount,
          lastEntryTimestamp: serverTimestamp() // Useful for showing activity
        }
      };
      
      await updateDoc(userDocRef, {
        'moduleProgress.cbt': newCbtProgress
      });
      console.log('✅ Updated user profile with CBT journal entry count and completion status.');
  
      await refreshUserProfile(currentUser.uid);
  
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding journal entry or updating progress:', error);
      throw error;
    }
  };
  

  const getJournalEntries = async () => {
    if (!currentUser) {
      return [];
    }
    try {
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc') 
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure timestamp is a JS Date object for easier use in components
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null, 
      }));
      console.log('✅ Fetched journal entries:', entries.length);
      return entries;
    } catch (error) {
      console.error('❌ Error fetching journal entries:', error);
      throw error; // Re-throw to be caught by UI
    }
  };

  const getJournalEntryById = async (entryId) => {
    if (!currentUser || !entryId) {
      return null;
    }
    try {
      const docRef = doc(db, 'journal_entries', entryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
        const entry = {
          id: docSnap.id,
          ...docSnap.data(),
          timestamp: docSnap.data().timestamp?.toDate ? docSnap.data().timestamp.toDate() : null,
        };
        console.log('✅ Fetched journal entry by ID:', entryId);
        return entry;
      } else {
        console.warn('❌ Journal entry not found or user not authorized for ID:', entryId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching journal entry by ID:', error);
      throw error;
    }
  };

  const updateJournalEntry = async (entryId, updatedData) => {
    if (!currentUser || !entryId) {
      throw new Error('User not authenticated or entry ID missing.');
    }
    try {
      const entryRef = doc(db, 'journal_entries', entryId);
      const docSnap = await getDoc(entryRef);
      if (!docSnap.exists() || docSnap.data().userId !== currentUser.uid) {
        throw new Error('Unauthorized: You can only update your own entries.');
      }

      await updateDoc(entryRef, {
          ...updatedData,
          updatedAt: serverTimestamp() // Add an updatedAt timestamp
      });
      console.log('✅ Journal entry updated:', entryId);
      // Optionally, refresh user profile if an update might affect summaries (e.g. sentiment of last entry)
      // await refreshUserProfile(currentUser.uid); 
      return true;
    } catch (error) {
      console.error('❌ Error updating journal entry:', error);
      throw error;
    }
  };

  const deleteJournalEntry = async (entryId) => {
    if (!currentUser) {
      throw new Error('User not authenticated.');
    }
    try {
      const entryRef = doc(db, 'journal_entries', entryId);
      const docSnap = await getDoc(entryRef);
      if (!docSnap.exists() || docSnap.data().userId !== currentUser.uid) {
        throw new Error('Unauthorized: You can only delete your own entries.');
      }

      await deleteDoc(entryRef);
      console.log('✅ Journal entry deleted:', entryId);

      // After deleting an entry, re-calculate entry count and update moduleProgress.cbt
      const q = query(collection(db, 'journal_entries'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const newEntryCount = snapshot.size;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userProfileSnap = await getDoc(userDocRef);
      const currentCbtSummary = userProfileSnap.data()?.moduleProgress?.cbt?.summary || {};

      await updateDoc(userDocRef, {
        'moduleProgress.cbt.summary': {
            ...currentCbtSummary,
            entryCount: newEntryCount
        },
        // If count is 0, mark CBT as not completed
        'moduleProgress.cbt.completed': newEntryCount > 0 
      });
      await refreshUserProfile(currentUser.uid); // Refresh to reflect changes

      return true;
    } catch (error) {
      console.error('❌ Error deleting journal entry or updating progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
          await refreshUserProfile(user.uid);
          // Optionally update lastLoginAt, but refreshUserProfile might already handle it if structured so
          const userDocRef = doc(db, 'users', user.uid);
          updateDoc(userDocRef, { lastLoginAt: serverTimestamp() }).catch(err => console.warn("Failed to update lastLoginAt", err));
      } else {
          setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userProfile,
    profileLoading,
    signup,
    login,
    signin: login, // Alias for convenience
    logout,
    signInWithGoogle,
    signinAnonymously,
    createRecaptchaVerifier,
    sendPhoneVerification,
    verifyPhoneCode,
    // createUserProfile, // Typically not exposed directly, called by signup/signin flows
    refreshUserProfile,
    getUserAssessments,
    updateUserProfile,
    saveAssessmentResult,
    checkPrerequisite,
    getCorrectNavigationPath,
    resetAllModules,
    deleteAllAssessments,
    resetPassword, 
    addJournalEntry,
    getJournalEntries,
    getJournalEntryById,
    updateJournalEntry,
    deleteJournalEntry,
    deleteAllJournalEntries
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}