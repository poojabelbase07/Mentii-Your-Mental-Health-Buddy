import React, { useState, useEffect, useRef } from 'react';
import { db } from '../config/firebase'; // Assuming your firebase config is here
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, where } from 'firebase/firestore';
import { startOfDay, subDays, format, parseISO } from 'date-fns';
import styles from './SleepTracker.module.css'; // Import the CSS module

const SleepTracker = ({ userId }) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastSleepLogs, setPastSleepLogs] = useState([]);

  const canvasRef = useRef(null);

  // Helper function to calculate sleep duration
  const calculateSleepDuration = (bedtimeStr, wakeTimeStr) => {
    if (!bedtimeStr || !wakeTimeStr) return null;

    const now = new Date();
    // Create Date objects for today's date with the given times
    let bedTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(bedtimeStr.split(':')[0]), parseInt(bedtimeStr.split(':')[1]));
    let wakeTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(wakeTimeStr.split(':')[0]), parseInt(wakeTimeStr.split(':')[1]));

    // If wake time is earlier than bedtime, it means wake time is on the next day
    if (wakeTimeDate < bedTimeDate) {
      wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
    }

    const durationMs = wakeTimeDate.getTime() - bedTimeDate.getTime();
    const totalHours = durationMs / (1000 * 60 * 60); // Convert milliseconds to hours
    return totalHours;
  };

  // Function to draw the sleep chart
  const drawChart = (data) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const DENSITY_PIXELS = 1; // For higher resolution on some displays
    canvas.width = canvas.offsetWidth * DENSITY_PIXELS;
    canvas.height = canvas.offsetHeight * DENSITY_PIXELS;
    ctx.scale(DENSITY_PIXELS, DENSITY_PIXELS);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    const padding = 30;
    const chartWidth = canvas.offsetWidth - 2 * padding;
    const chartHeight = canvas.offsetHeight - 2 * padding;

    // Sort data by date ascending for chart
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Determine max sleep hours for scaling Y-axis
    const maxHours = Math.max(...sortedData.map(d => d.totalHours), 8); // Ensure at least 8 hours for scale
    const minHours = Math.min(...sortedData.map(d => d.totalHours), 4); // Ensure at least 4 hours for scale
    const rangeHours = maxHours - minHours;

    // Draw X and Y axes
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight); // Y-axis
    ctx.lineTo(padding + chartWidth, padding + chartHeight); // X-axis
    ctx.stroke();

    // Draw data points and lines
    ctx.beginPath();
    ctx.strokeStyle = '#8a2be2'; // Purple line
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    sortedData.forEach((entry, index) => {
      const x = padding + (index / (sortedData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((entry.totalHours - minHours) / rangeHours) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw circles for data points
      ctx.fillStyle = '#8a2be2';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw labels for hours
      ctx.fillStyle = '#555';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${entry.totalHours.toFixed(1)}h`, x, y - 10);

      // Draw labels for dates (X-axis)
      ctx.textAlign = 'center';
      ctx.fillText(format(new Date(entry.date), 'MMM d'), x, padding + chartHeight + 15);
    });
    ctx.stroke();

    // Y-axis labels (min and max hours)
    ctx.fillStyle = '#555';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${maxHours.toFixed(0)}h`, padding - 5, padding);
    ctx.fillText(`${minHours.toFixed(0)}h`, padding - 5, padding + chartHeight);
  };

  // Fetch past sleep logs on component mount
  useEffect(() => {
    const fetchPastSleepLogs = async () => {
      if (!userId) {
        setError('User not logged in. Cannot fetch sleep logs.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const sleepCollectionRef = collection(db, `users/${userId}/sleepLogs`);
        const sevenDaysAgo = startOfDay(subDays(new Date(), 7)); // Get start of day 7 days ago

        const q = query(
          sleepCollectionRef,
          where('date', '>=', sevenDaysAgo), // Filter for last 7 days
          orderBy('date', 'desc'),
          limit(7) // Limit to 7 entries for the chart
        );
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate().toISOString().split('T')[0], // Store date as YYYY-MM-DD string for chart
        }));
        setPastSleepLogs(logs);
      } catch (err) {
        console.error("Error fetching past sleep logs:", err);
        setError('Failed to fetch past sleep logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastSleepLogs();
  }, [userId]); // Re-fetch if userId changes

  // Effect to redraw chart when pastSleepLogs change
  useEffect(() => {
    if (pastSleepLogs.length > 0) {
      drawChart(pastSleepLogs);
    } else {
      // Clear canvas if no data
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [pastSleepLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('User not logged in. Please log in to save your entry.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const totalHours = calculateSleepDuration(bedtime, wakeTime);

    if (totalHours === null || isNaN(totalHours) || totalHours <= 0) {
      setError('Please enter valid bedtime and wake time.');
      setLoading(false);
      return;
    }

    // Determine the date of the sleep entry (the night the user went to bed)
    const now = new Date();
    let entryDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(bedtime.split(':')[0]), parseInt(bedtime.split(':')[1]));
    // If bedtime is in the evening (e.g., after noon) and current time is morning, assume it's the previous day's sleep
    if (bedtime.split(':')[0] >= 12 && now.getHours() < 12) { // If bedtime is PM and current time is AM
      entryDate.setDate(entryDate.getDate() - 1);
    }
    // Set to start of day for consistent date timestamp
    entryDate = startOfDay(entryDate);

    try {
      const newSleepLog = {
        date: serverTimestamp(), // Use server timestamp for consistency and ordering
        bedtime: bedtime, // Store as string for time input
        wakeTime: wakeTime, // Store as string for time input
        totalHours: parseFloat(totalHours.toFixed(2)), // Round to 2 decimal places
        sleepQuality: sleepQuality,
        notes: notes,
        // Add a separate field for the actual sleep date for querying
        sleepDate: entryDate.toISOString().split('T')[0] // YYYY-MM-DD for easier querying/filtering
      };

      const sleepCollectionRef = collection(db, `users/${userId}/sleepLogs`);
      await addDoc(sleepCollectionRef, newSleepLog);

      setMessage(`You slept ${totalHours.toFixed(1)} hours with quality: ${sleepQuality}. Saved!`);
      // Clear form fields
      setBedtime('');
      setWakeTime('');
      setSleepQuality('Good');
      setNotes('');

      // Re-fetch to update the past entries list and chart
      const sleepCollectionRefRefresh = collection(db, `users/${userId}/sleepLogs`);
      const sevenDaysAgoRefresh = startOfDay(subDays(new Date(), 7));
      const qRefresh = query(
        sleepCollectionRefRefresh,
        where('date', '>=', sevenDaysAgoRefresh),
        orderBy('date', 'desc'),
        limit(7)
      );
      const querySnapshotRefresh = await getDocs(qRefresh);
      const updatedLogs = querySnapshotRefresh.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString().split('T')[0],
      }));
      setPastSleepLogs(updatedLogs);

      setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    } catch (err) {
      console.error("Error saving sleep log:", err);
      setError('Failed to save sleep log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sleepTrackerCard}>
      <h2 className={styles.title}>Sleep Tracker</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="bedtime" className={styles.label}>Bedtime:</label>
          <input
            id="bedtime"
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className={styles.timeInput}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="wakeTime" className={styles.label}>Wake Time:</label>
          <input
            id="wakeTime"
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className={styles.timeInput}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="sleepQuality" className={styles.label}>Sleep Quality:</label>
          <select
            id="sleepQuality"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value)}
            className={styles.selectField}
            required
          >
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="notes" className={styles.label}>Notes (optional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textareaField}
            rows="3"
            placeholder="Any thoughts about your sleep?"
          ></textarea>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Saving...' : 'Log Sleep'}
        </button>
      </form>

      <h3 className={styles.chartTitle}>Last 7 Days Sleep Overview</h3>
      {loading && pastSleepLogs.length === 0 && <p className={styles.loadingMessage}>Loading sleep data...</p>}
      {!loading && pastSleepLogs.length === 0 && !error && <p className={styles.noDataMessage}>No sleep data for the last 7 days. Log your sleep!</p>}

      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.sleepChart}></canvas>
      </div>

      <div className={styles.pastLogsList}>
        {pastSleepLogs.length > 0 && (
          <>
            <h4 className={styles.pastLogsHeader}>Recent Entries:</h4>
            <ul>
              {pastSleepLogs.map(log => (
                <li key={log.id} className={styles.pastLogItem}>
                  <span>{format(parseISO(log.date), 'MMM d, yyyy')}: </span>
                  <strong>{log.totalHours.toFixed(1)} hours</strong> (Quality: {log.sleepQuality})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default SleepTracker;
