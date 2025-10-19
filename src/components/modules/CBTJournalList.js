import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './CBTJournalList.module.css'; // Reusing the same CSS module

const CBTJournalList = () => {
  const { currentUser, getJournalEntries, deleteJournalEntry } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedEntries = await getJournalEntries();
      setEntries(fetchedEntries);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
      setError(err.message || 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, getJournalEntries, navigate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);


  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await deleteJournalEntry(entryId);
        alert('Entry deleted successfully!');
        fetchEntries(); // Refresh the list
      } catch (err) {
        console.error('Error deleting entry:', err);
        alert(`Failed to delete entry: ${err.message}`);
      }
    }
  };

  const handleEdit = (entryId) => {
    navigate(`/cbt-journal/edit/${entryId}`);
  };

  if (loading) {
    return <div className={styles.container}><p>Loading journal entries...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Your CBT Journal</h1>
      <p className={styles.description}>A chronological record of your thought reframing exercises.</p>

      <button onClick={() => navigate('/cbt-journal/new')} className={styles.newEntryButton}>
        + Add New Entry
      </button>

      {entries.length === 0 ? (
        <p className={styles.noEntries}>You haven't recorded any journal entries yet. Click "Add New Entry" to get started!</p>
      ) : (
        <div className={styles.entryList}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.journalCard}>
              <div className={styles.cardHeader}>
                <h3>Entry from {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}</h3>
                <span className={styles.cardTime}>
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p><strong>Situation:</strong> {entry.situation.substring(0, 100)}{entry.situation.length > 100 ? '...' : ''}</p>
              <p><strong>Automatic Thoughts:</strong> {entry.automaticThoughts.substring(0, 100)}{entry.automaticThoughts.length > 100 ? '...' : ''}</p>
              {entry.sentimentAnalysis && (
                <p>
                  <strong>Sentiment of Thoughts:</strong>
                  <span className={`${styles.sentimentBadge} ${styles[`sentiment${entry.sentimentAnalysis.label}`]}`}>
                    {entry.sentimentAnalysis.label} ({entry.sentimentAnalysis.score.toFixed(2)})
                  </span>
                </p>
              )}
              {entry.alternativeThought && (
                 <p><strong>Alternative Thought:</strong> {entry.alternativeThought.substring(0, 100)}{entry.alternativeThought.length > 100 ? '...' : ''}</p>
              )}

              <div className={styles.cardActions}>
                <button onClick={() => navigate(`/cbt-journal/view/${entry.id}`)} className={styles.viewButton}>View Details</button>
                <button onClick={() => handleEdit(entry.id)} className={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(entry.id)} className={styles.deleteButton}>Delete</button>
                <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
  ← Back to Dashboard
</button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CBTJournalList;
