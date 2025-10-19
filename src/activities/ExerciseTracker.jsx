import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase'; // Assuming your firebase config is here
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import styles from './ExerciseTracker.module.css'; // Import the CSS module
import { format } from 'date-fns'; // For date formatting

const ExerciseTracker = ({ userId }) => {
  const [activityType, setActivityType] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [intensity, setIntensity] = useState('');
  const [moodBefore, setMoodBefore] = useState(3); // Default to middle
  const [moodAfter, setMoodAfter] = useState(3); // Default to middle
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);

  // Fetch past entries on component mount
  useEffect(() => {
    const fetchPastEntries = async () => {
      if (!userId) {
        setError('User not logged in. Cannot fetch exercise logs.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const exerciseCollectionRef = collection(db, `users/${userId}/exerciseLogs`);
        const q = query(exerciseCollectionRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date and then format for display
          timestamp: doc.data().timestamp?.toDate(),
        }));
        setPastEntries(entries);
      } catch (err) {
        console.error("Error fetching past exercise logs:", err);
        setError('Failed to fetch past exercise logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastEntries();
  }, [userId]); // Re-fetch if userId changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('User not logged in. Please log in to save your exercise.');
      return;
    }

    // Basic validation
    if (!activityType || !durationMinutes || !intensity) {
      setError('Please fill in Activity Type, Duration, and Intensity.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    const durationNum = parseFloat(durationMinutes);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duration must be a positive number.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const newExerciseLog = {
        timestamp: serverTimestamp(),
        activityType: activityType,
        durationMinutes: durationNum,
        intensity: intensity,
        // Only include mood ratings if they are set (optional fields)
        moodBefore: parseInt(moodBefore, 10),
        moodAfter: parseInt(moodAfter, 10),
      };

      const exerciseCollectionRef = collection(db, `users/${userId}/exerciseLogs`);
      await addDoc(exerciseCollectionRef, newExerciseLog);

      setMessage('Exercise logged!');
      // Clear form fields
      setActivityType('');
      setDurationMinutes('');
      setIntensity('');
      setMoodBefore(3);
      setMoodAfter(3);

      // Re-fetch to update the past entries list
      const exerciseCollectionRefRefresh = collection(db, `users/${userId}/exerciseLogs`);
      const qRefresh = query(exerciseCollectionRefRefresh, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshotRefresh = await getDocs(qRefresh);
      const updatedEntries = querySnapshotRefresh.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setPastEntries(updatedEntries);

      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error("Error saving exercise log:", err);
      setError('Failed to save entry. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.exerciseTrackerCard}>
      <h2 className={styles.title}>Exercise Tracker</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="activityType" className={styles.label}>Activity Type:</label>
          <select
            id="activityType"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className={styles.selectField}
            required
          >
            <option value="">Select Activity</option>
            <option value="Running">Running</option>
            <option value="Yoga">Yoga</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Walking">Walking</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="durationMinutes" className={styles.label}>Duration (minutes):</label>
          <input
            id="durationMinutes"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className={styles.inputField}
            placeholder="e.g., 30"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Intensity:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="intensity"
                value="Low"
                checked={intensity === 'Low'}
                onChange={(e) => setIntensity(e.target.value)}
                required
              /> Low
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="intensity"
                value="Moderate"
                checked={intensity === 'Moderate'}
                onChange={(e) => setIntensity(e.target.value)}
              /> Moderate
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="intensity"
                value="High"
                checked={intensity === 'High'}
                onChange={(e) => setIntensity(e.target.value)}
              /> High
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="moodBefore" className={styles.label}>Mood Before (1-5): {moodBefore}</label>
          <input
            id="moodBefore"
            type="range"
            min="1"
            max="5"
            value={moodBefore}
            onChange={(e) => setMoodBefore(e.target.value)}
            className={styles.slider}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="moodAfter" className={styles.label}>Mood After (1-5): {moodAfter}</label>
          <input
            id="moodAfter"
            type="range"
            min="1"
            max="5"
            value={moodAfter}
            onChange={(e) => setMoodAfter(e.target.value)}
            className={styles.slider}
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Logging...' : 'Log Exercise'}
        </button>
      </form>

      <h3 className={styles.pastEntriesTitle}>Your Last 5 Exercises</h3>
      {loading && pastEntries.length === 0 && <p>Loading past entries...</p>}
      {!loading && pastEntries.length === 0 && !error && <p className={styles.noEntriesMessage}>No past exercise entries found. Log your first exercise!</p>}
      
      {!error && pastEntries.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.exerciseTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Duration</th>
                <th>Intensity</th>
                <th>Mood Lift</th>
              </tr>
            </thead>
            <tbody>
              {pastEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.timestamp ? format(entry.timestamp, 'MMM d, yyyy') : 'N/A'}</td>
                  <td>{entry.activityType}</td>
                  <td>{entry.durationMinutes} min</td>
                  <td>{entry.intensity}</td>
                  <td>
                    {entry.moodBefore && entry.moodAfter
                      ? (entry.moodAfter - entry.moodBefore > 0 ? `+${entry.moodAfter - entry.moodBefore}` : entry.moodAfter - entry.moodBefore)
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExerciseTracker;
