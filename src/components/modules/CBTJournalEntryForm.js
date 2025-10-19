// src/components/modules/CBTJournalEntryForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './CBTJournalEntryForm.module.css'; // New CSS module for journaling
import Sentiment from 'sentiment'; // Keep client-side sentiment analysis
const sentiment = new Sentiment();

const CBTJournalEntryForm = ({ entryToEdit, onSaveSuccess }) => {
  const { currentUser, addJournalEntry, updateJournalEntry, getAssessmentStatus, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    situation: '',
    emotions: [], // Array of { emotion: string, intensity: number }
    automaticThoughts: '',
    cognitiveDistortions: [], // Optional: array of strings
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    outcomeEmotion: '',
    outcomeIntensity: 0,
  });
  const [emotionInput, setEmotionInput] = useState('');
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // If an entryToEdit is passed, populate the form for editing
    if (entryToEdit) {
      setFormData({
        situation: entryToEdit.situation || '',
        emotions: entryToEdit.emotions || [],
        automaticThoughts: entryToEdit.automaticThoughts || '',
        cognitiveDistortions: entryToEdit.cognitiveDistortions || [],
        evidenceFor: entryToEdit.evidenceFor || '',
        evidenceAgainst: entryToEdit.evidenceAgainst || '',
        alternativeThought: entryToEdit.alternativeThought || '',
        outcomeEmotion: entryToEdit.outcomeEmotion || '',
        outcomeIntensity: entryToEdit.outcomeIntensity || 0,
      });
      setIsEditMode(true);
    } else {
      // Reset form for new entry
      setFormData({
        situation: '',
        emotions: [],
        automaticThoughts: '',
        cognitiveDistortions: [],
        evidenceFor: '',
        evidenceAgainst: '',
        alternativeThought: '',
        outcomeEmotion: '',
        outcomeIntensity: 0,
      });
      setIsEditMode(false);
    }
  }, [currentUser, navigate, entryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmotion = () => {
    if (emotionInput.trim() && emotionIntensity >= 0 && emotionIntensity <= 100) {
      setFormData(prev => ({
        ...prev,
        emotions: [...prev.emotions, { emotion: emotionInput.trim(), intensity: emotionIntensity }],
      }));
      setEmotionInput('');
      setEmotionIntensity(50); // Reset to default
    }
  };

  const handleRemoveEmotion = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Perform sentiment analysis on automaticThoughts
      const analysisResult = sentiment.analyze(formData.automaticThoughts);
      const sentimentData = {
        score: analysisResult.score, // A number between -5 and +5
        comparative: analysisResult.comparative, // A number between -1 and +1
        label: analysisResult.score > 0 ? 'Positive' : (analysisResult.score < 0 ? 'Negative' : 'Neutral'),
        // You might want to store more details from analysisResult if needed
      };

      const entryDataToSave = {
        ...formData,
        sentimentAnalysis: sentimentData,
      };

      if (isEditMode && entryToEdit?.id) {
        await updateJournalEntry(entryToEdit.id, entryDataToSave);
        alert('Journal entry updated successfully!');
      } else {
        await addJournalEntry(entryDataToSave);
        alert('Journal entry saved successfully!');
        // Optionally clear form after saving new entry
        setFormData({
          situation: '',
          emotions: [],
          automaticThoughts: '',
          cognitiveDistortions: [],
          evidenceFor: '',
          evidenceAgainst: '',
          alternativeThought: '',
          outcomeEmotion: '',
          outcomeIntensity: 0,
        });
      }

      // Refresh user profile to potentially update module completion status
      await refreshUserProfile(currentUser.uid);

      if (onSaveSuccess) {
        onSaveSuccess(); // Callback to parent (e.g., to navigate or refresh list)
      } else {
        navigate('/cbt-journal'); // Navigate back to the list view
      }

    } catch (err) {
      console.error('Failed to save journal entry:', err);
      setError(err.message || 'Failed to save journal entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>CBT Journal Entry</h1>
      <p className={styles.description}>
        {isEditMode ? 'Edit your thought record.' : 'Use this form to record and reframe your thoughts based on Cognitive Behavioral Therapy principles.'}
      </p>

      <form onSubmit={handleSubmit} className={styles.journalForm}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="situation" className={styles.label}>Situation:</label>
          <textarea
            id="situation"
            name="situation"
            value={formData.situation}
            onChange={handleChange}
            placeholder="What happened? Where were you? Who was involved? When?"
            className={styles.textarea}
            required
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Emotions & Intensity:</label>
          <div className={styles.emotionInputGroup}>
            <input
              type="text"
              value={emotionInput}
              onChange={(e) => setEmotionInput(e.target.value)}
              placeholder="e.g., Anxiety, Sadness"
              className={styles.input}
            />
            <input
              type="number"
              value={emotionIntensity}
              onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
              min="0"
              max="100"
              className={styles.intensityInput}
              aria-label="Emotion Intensity (0-100)"
            />
            <button type="button" onClick={handleAddEmotion} className={styles.addEmotionBtn}>
              Add Emotion
            </button>
          </div>
          <div className={styles.emotionTags}>
            {formData.emotions.map((emo, index) => (
              <span key={index} className={styles.emotionTag}>
                {emo.emotion} ({emo.intensity}%)
                <button type="button" onClick={() => handleRemoveEmotion(index)} className={styles.removeEmotionBtn}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="automaticThoughts" className={styles.label}>Automatic Thoughts:</label>
          <textarea
            id="automaticThoughts"
            name="automaticThoughts"
            value={formData.automaticThoughts}
            onChange={handleChange}
            placeholder="What thoughts went through your mind? (Often negative, unhelpful)"
            className={styles.textarea}
            required
            rows="4"
          />
          <p className={styles.hint}>*These thoughts will be analyzed for sentiment.</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="evidenceFor" className={styles.label}>Evidence for the Automatic Thought:</label>
          <textarea
            id="evidenceFor"
            name="evidenceFor"
            value={formData.evidenceFor}
            onChange={handleChange}
            placeholder="What facts or reasons support this thought?"
            className={styles.textarea}
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="evidenceAgainst" className={styles.label}>Evidence Against the Automatic Thought:</label>
          <textarea
            id="evidenceAgainst"
            name="evidenceAgainst"
            value={formData.evidenceAgainst}
            onChange={handleChange}
            placeholder="What facts or reasons go against this thought? Or alternative perspectives?"
            className={styles.textarea}
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="alternativeThought" className={styles.label}>Alternative Balanced Thought:</label>
          <textarea
            id="alternativeThought"
            name="alternativeThought"
            value={formData.alternativeThought}
            onChange={handleChange}
            placeholder="What's a more balanced, realistic, or helpful thought?"
            className={styles.textarea}
            required
            rows="4"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="outcomeEmotion" className={styles.label}>Outcome Emotion:</label>
          <input
            type="text"
            id="outcomeEmotion"
            name="outcomeEmotion"
            value={formData.outcomeEmotion}
            onChange={handleChange}
            placeholder="How do you feel now?"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="outcomeIntensity" className={styles.label}>Outcome Emotion Intensity (0-100%):</label>
          <input
            type="number"
            id="outcomeIntensity"
            name="outcomeIntensity"
            value={formData.outcomeIntensity}
            onChange={handleChange}
            min="0"
            max="100"
            className={styles.input}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Entry' : 'Save Entry')}
        </button>
        <button type="button" onClick={() => navigate('/cbt-journal')} className={styles.backButton}>
            Back to Journal List
        </button>
      </form>
    </div>
  );
};

export default CBTJournalEntryForm;
