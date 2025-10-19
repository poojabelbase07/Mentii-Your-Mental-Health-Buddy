import React, { useState, useEffect } from 'react';
import styles from './CalmZone.module.css';
import {
  Play, Headphones, Video, Heart, BookOpen, Volume2, ExternalLink, Shuffle, Save
} from 'lucide-react';

const CalmZone = () => {
  const [activeCategory, setActiveCategory] = useState('relax');
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [savedContent, setSavedContent] = useState([]);
  const [currentAffirmationCard, setCurrentAffirmationCard] = useState(0);
  const [journalMood, setJournalMood] = useState('peaceful');

  const headerAffirmations = [
    "You are safe. You are healing. You are enough.",
    "This moment is a gift. You are exactly where you need to be.",
    "Your breath is your anchor. You are calm and centered.",
    "You deserve peace, love, and all good things.",
    "Every step forward is progress. You are brave and resilient."
  ];

  const affirmationCards = [
    "I am worthy of love and compassion",
    "My feelings are valid and temporary",
    "I choose peace in this moment",
    "I am growing stronger with each breath",
    "I trust in my ability to heal",
    "I am surrounded by infinite possibilities",
    "My inner wisdom guides me to peace",
    "I release what no longer serves me"
  ];

  const mediaContent = {
    relax: [
      {
        id: 1,
        title: "Ocean Waves - Deep Sleep",
        type: "Music",
        platform: "Spotify",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
        icon: Volume2,
        description: "8 hours of calming ocean sounds"
      },
      {
        id: 2,
        title: "Forest Rain Meditation",
        type: "Music",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=nDq6TstdEi8",
        icon: Play,
        description: "Gentle rainfall in the forest"
      },
      {
        id: 3,
        title: "Lo-fi Chill Beats",
        type: "Music",
        platform: "SoundCloud",
        url: "https://soundcloud.com/chilledcow",
        icon: Headphones,
        description: "Peaceful instrumental vibes"
      },
      {
        id: 4,
        title: "5-Minute Breathing Space",
        type: "Video",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=F3C6u1GiAF8",
        icon: Video,
        description: "Quick mindfulness break"
      }
    ]
    // Include reflect and grow content as needed
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation((prev) => (prev + 1) % headerAffirmations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveContent = (item) => {
    if (!savedContent.find(saved => saved.id === item.id)) {
      setSavedContent([...savedContent, item]);
    }
  };

  const shuffleAffirmation = () => {
    setCurrentAffirmationCard((prev) => (prev + 1) % affirmationCards.length);
  };

  const getMoodFeedback = (entry) => {
    if (entry.toLowerCase().includes('grateful') || entry.toLowerCase().includes('thankful')) {
      return "Your energy feels grateful today 💛";
    } else if (entry.toLowerCase().includes('calm') || entry.toLowerCase().includes('peace')) {
      return "You're radiating peaceful vibes 🌸";
    } else if (entry.toLowerCase().includes('hope') || entry.toLowerCase().includes('better')) {
      return "There's beautiful hope in your words 🌱";
    } else if (entry.length > 50) {
      return "Your reflection shows deep self-awareness 💜";
    } else {
      return "Every feeling is valid. You're doing great 💙";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Calm Zone</h1>
        <p className={styles.subtitle}>Your serene sanctuary for peace and healing</p>
        <div className={styles.affirmationBox}>
          {headerAffirmations.map((affirmation, index) => (
            <p
              key={index}
              className={`${styles.affirmation} ${index === currentAffirmation ? styles.visible : styles.hidden}`}
            >
              "{affirmation}"
            </p>
          ))}
        </div>
      </div>

      <div className={styles.tabs}>
        {['relax', 'reflect', 'grow'].map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? styles.activeTab : styles.tab}
            onClick={() => setActiveCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {mediaContent[activeCategory]?.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <Icon className={styles.icon} />
                <button onClick={() => handleSaveContent(item)} className={styles.saveButton}>
                  <Heart className={styles.saveIcon} />
                </button>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardMeta}>{item.type} • {item.platform}</span>
                <button className={styles.openButton} onClick={() => window.open(item.url, '_blank')}>
                  Open <ExternalLink className={styles.externalIcon} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.affirmationDeck}>
          <h3 className={styles.sectionTitle}>Daily Affirmation</h3>
          <div className={styles.affirmationCard}>
            "{affirmationCards[currentAffirmationCard]}"
          </div>
          <div className={styles.deckButtons}>
            <button onClick={shuffleAffirmation} className={styles.shuffleButton}>
              <Shuffle /> New
            </button>
            <button
              onClick={() => setSavedContent([...savedContent, { id: Date.now(), title: affirmationCards[currentAffirmationCard], type: 'Affirmation' }])}
              className={styles.saveButtonAlt}
            >
              <Save /> Save
            </button>
          </div>
        </div>

        <div className={styles.journalSection}>
          <h3 className={styles.sectionTitle}>Reflection Space</h3>
          <select value={journalMood} onChange={(e) => setJournalMood(e.target.value)} className={styles.selectMood}>
            <option value="peaceful">Peaceful</option>
            <option value="hopeful">Hopeful</option>
            <option value="grateful">Grateful</option>
            <option value="reflective">Reflective</option>
            <option value="calm">Calm</option>
          </select>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Share what's on your mind..."
            className={styles.journalEntry}
          />
          {journalEntry.length > 0 && (
            <div className={styles.moodFeedback}>{getMoodFeedback(journalEntry)}</div>
          )}
        </div>
      </div>

      {savedContent.length > 0 && (
        <div className={styles.savedCounter}>💾 {savedContent.length} saved</div>
      )}
    </div>
  );
};

export default CalmZone;



// import React from "react";
// import { Routes, Route, Outlet } from "react-router-dom";
// import LandingPage from "../calm/LandingPage";
// import CardLayout from "../calm/CardLayout";
// import AudioZone from "../calm/zones/audiozone/AudioZone";
// import BookZone from "../calm/zones/bookzone/BookZone";
// import VideoZone from "../calm/zones/videozone/VideoZone";
// import PodcastZone from "../calm/zones/podcastzone/PodcastZone";


// const CalmZone = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<LandingPage />} />
//       <Route path="explore" element={<CardLayout />} />
//       <Route path="audio" element={<AudioZone />} />
//       <Route path="book" element={<BookZone />} />
//       <Route path="video" element={<VideoZone />} />
//       <Route path="podcast" element={<PodcastZone />} />
//     </Routes>
//   );
// };

// export default CalmZone;
