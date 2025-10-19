import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CBTJournalEntryForm from './CBTJournalEntryForm'; // Re-use the form for editing
import styles from './CBTJournalEntryDetail.module.css';

const CBTJournalEntryDetail = () => {
  const { id } = useParams(); // Get the entry ID from the URL
  const navigate = useNavigate();
  const { currentUser, getJournalEntryById, deleteJournalEntry } = useAuth();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  const fetchEntry = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedEntry = await getJournalEntryById(id);
      if (fetchedEntry) {
        setEntry(fetchedEntry);
      } else {
        setError('Journal entry not found or unauthorized access.');
      }
    } catch (err) {
      console.error('Error fetching journal entry:', err);
      setError(err.message || 'Failed to load journal entry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id, currentUser, getJournalEntryById, navigate]); // Re-fetch if ID or user changes

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await deleteJournalEntry(id);
        alert('Entry deleted successfully!');
        navigate('/cbt-journal'); // Go back to the list after deletion
      } catch (err) {
        console.error('Error deleting entry:', err);
        alert(`Failed to delete entry: ${err.message}`);
      }
    }
  };

  const handleSaveSuccess = () => {
    setIsEditing(false); // Exit edit mode
    fetchEntry(); // Refresh the displayed entry details
  };

  // Helper function to get sentiment class name
  const getSentimentClass = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return styles.sentimentPositive;
      case 'negative':
        return styles.sentimentNegative;
      case 'neutral':
      default:
        return styles.sentimentNeutral;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading entry details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Entry not found.</div>
      </div>
    );
  }

  if (isEditing) {
    return <CBTJournalEntryForm entryToEdit={entry} onSaveSuccess={handleSaveSuccess} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Journal Entry Details</h1>
      <div className={styles.description}>
        <span>📅</span>
        Recorded on: {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
      </div>

      <div className={styles.detailCard}>
        <h4>🎯 Situation</h4>
        <div className={styles.detailContent}>{entry.situation}</div>

        <h4>💭 Emotions</h4>
        <ul className={styles.emotionList}>
          {entry.emotions.length > 0 ? (
            entry.emotions.map((emo, index) => (
              <li 
                key={index}
                style={{'--intensity': `${emo.intensity}%`}}
              >
                <span>😊</span>
                {emo.emotion} ({emo.intensity}%)
              </li>
            ))
          ) : (
            <li>No emotions recorded.</li>
          )}
        </ul>

        <h4>🧠 Automatic Thoughts</h4>
        <div className={styles.detailContent}>
          {entry.automaticThoughts}
          {entry.sentimentAnalysis && (
            <div className={styles.detailSubContent}>
              Sentiment: <span className={`${styles.sentimentBadge} ${getSentimentClass(entry.sentimentAnalysis.label)}`}>
                {entry.sentimentAnalysis.label === 'positive' && '😊'}
                {entry.sentimentAnalysis.label === 'negative' && '😔'}
                {entry.sentimentAnalysis.label === 'neutral' && '😐'}
                {entry.sentimentAnalysis.label} ({entry.sentimentAnalysis.score.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {entry.cognitiveDistortions && entry.cognitiveDistortions.length > 0 && (
          <>
            <h4>🔍 Cognitive Distortions Identified</h4>
            <div className={styles.detailContent}>{entry.cognitiveDistortions.join(', ')}</div>
          </>
        )}

        <h4>✅ Evidence For Automatic Thought</h4>
        <div className={styles.detailContent}>{entry.evidenceFor || 'N/A'}</div>

        <h4>❌ Evidence Against Automatic Thought</h4>
        <div className={styles.detailContent}>{entry.evidenceAgainst || 'N/A'}</div>

        <h4>⚖️ Alternative Balanced Thought</h4>
        <div className={styles.detailContent}>{entry.alternativeThought}</div>

        <h4>🎯 Outcome Emotion</h4>
        <div className={styles.detailContent}>{entry.outcomeEmotion} ({entry.outcomeIntensity}%)</div>

        <div className={styles.detailActions}>
          <button onClick={() => setIsEditing(true)} className={styles.editButton}>
            ✏️ Edit Entry
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            🗑️ Delete Entry
          </button>
          <button onClick={() => navigate('/cbt-journal')} className={styles.backButton}>
            ← Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default CBTJournalEntryDetail;




