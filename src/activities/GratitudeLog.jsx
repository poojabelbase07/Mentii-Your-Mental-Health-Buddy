import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import styles from './GratitudeLog.module.css';
import { db } from '../config/firebase'; // Make sure this import is correct

// Firebase functions following the same pattern as your game
const saveGratitudeToFirebase = async (gratitudeData) => {
  try {
    // Add server timestamp when saving
    const docRef = await addDoc(collection(db, "gratitudeEntries"), {
      ...gratitudeData,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving gratitude to Firebase:", error);
    return { success: false, error };
  }
};

const getGratitudeFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "gratitudeEntries"));
    const gratitudeEntries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: gratitudeEntries };
  } catch (error) {
    console.error("Error fetching gratitude entries:", error);
    return { success: false, error, data: [] };
  }
};

const GratitudeLog = ({ userId }) => {
  const [gratefulFor, setGratefulFor] = useState(['', '', '']);
  const [moodRating, setMoodRating] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGratitudeEntries();
  }, [userId]);

  const loadGratitudeEntries = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    try {
      const result = await getGratitudeFromFirebase();
      if (result.success) {
        // Filter entries for current user and sort by timestamp (most recent first)
        const userEntries = result.data
          .filter(entry => entry.userId === userId)
          .sort((a, b) => {
            // Handle timestamp comparison
            const aTime = a.timestamp?.seconds || a.timestamp?.toDate?.() || new Date(a.createdAt);
            const bTime = b.timestamp?.seconds || b.timestamp?.toDate?.() || new Date(b.createdAt);
            return new Date(bTime) - new Date(aTime);
          })
          .slice(0, 5); // Keep only last 5 entries
        
        setEntries(userEntries);
      } else {
        setError('Failed to load gratitude entries');
      }
    } catch (err) {
      console.error('Error loading gratitude entries:', err);
      setError('Error loading gratitude entries');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    const newGratefulFor = [...gratefulFor];
    newGratefulFor[index] = value;
    setGratefulFor(newGratefulFor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault?.();
    
    if (!userId) {
      alert('User ID is required');
      return;
    }

    // Check if at least one field is filled
    const filteredEntries = gratefulFor.filter(item => item.trim());
    if (filteredEntries.length === 0) {
      alert('Please enter at least one thing you\'re grateful for');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gratitudeData = {
        userId: userId,
        entryList: filteredEntries,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        createdAt: new Date().toISOString() // Keep for compatibility
      };

      // Add mood rating if provided
      if (moodRating && moodRating >= 1 && moodRating <= 10) {
        gratitudeData.moodRating = parseInt(moodRating);
      }

      // Save to Firebase using the same pattern as your game
      const result = await saveGratitudeToFirebase(gratitudeData);
      
      if (result.success) {
        console.log('Gratitude entry saved with ID:', result.id);

        // Clear form
        setGratefulFor(['', '', '']);
        setMoodRating('');
        
        // Show confirmation
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);

        // Reload entries to show updated list
        loadGratitudeEntries();
      } else {
        throw new Error(result.error?.message || 'Failed to save gratitude entry');
      }
    } catch (error) {
      console.error('Error saving gratitude entry:', error);
      setError(`Error saving entry: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Debug information
  useEffect(() => {
    console.log('GratitudeLog Component Debug Info:');
    console.log('- userId:', userId);
    console.log('- db object:', db);
    console.log('- entries:', entries);
  }, [userId, entries]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Gratitude Log</h2>
        <p className={styles.subtitle}>What are you grateful for today?</p>

        {/* Debug info - remove in production */}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Debug: User ID = {userId || 'Not provided'}
        </div>

        {/* Error display */}
        {error && (
          <div style={{ 
            color: '#ef4444', 
            backgroundColor: '#fef2f2', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            {gratefulFor.map((item, index) => (
              <div key={index} className={styles.inputWrapper}>
                <label className={styles.label}>
                  Grateful for #{index + 1}
                </label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Something you're grateful for...`}
                  className={styles.input}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Mood Rating (1-10) - Optional
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={moodRating}
              onChange={(e) => setMoodRating(e.target.value)}
              placeholder="How's your mood today?"
              className={styles.input}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Saving...' : 'Save Gratitude Entry'}
          </button>

          {showConfirmation && (
            <div className={styles.confirmation}>
              Saved! ✨
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries Section */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className={styles.historyTitle}>Recent Entries</h3>
          <button
            onClick={loadGratitudeEntries}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '20px',
            fontSize: '16px'
          }}>
            Loading entries...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '20px',
            fontSize: '16px'
          }}>
            No gratitude entries yet. Create your first entry above!
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className={styles.entriesList}>
            {entries.map((entry) => (
              <div key={entry.id} className={styles.entryItem}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryDate}>
                    {formatDate(entry.timestamp || entry.date)}
                  </span>
                  {entry.time && (
                    <span className={styles.entryTime}>
                      {entry.time}
                    </span>
                  )}
                  {entry.moodRating && (
                    <span className={styles.moodRating}>
                      Mood: {entry.moodRating}/10
                    </span>
                  )}
                </div>
                <ul className={styles.gratitudeList}>
                  {entry.entryList.map((item, index) => (
                    <li key={index} className={styles.gratitudeItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GratitudeLog;