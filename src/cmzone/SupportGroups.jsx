// components/SupportGroups.jsx
import React, { useState } from 'react';
import styles from './SupportGroups.module.css';
import { FaUsers, FaTag } from 'react-icons/fa'; // Icons

const supportGroupsData = [
  {
    id: 1,
    name: "Anxiety Warriors Online",
    description: "A safe space for sharing experiences and coping strategies for anxiety.",
    topics: ["Anxiety", "Online", "Adults"],
    link: "https://discord.com/invite/v53KMTvS",
    contact: ""
  },
  {
    id: 2,
    name: "Depression & Hope (Local - Nashik)",
    description: "In-person meetings for those managing depression in Nashik.",
    topics: ["Depression", "Local", "Adults"],
    link: "",
    contact: "https://discord.com/invite/v53KMTvS"
  },
  {
    id: 3,
    name: "Rainbow Support Network (LGBTQ+)",
    description: "Support and community for LGBTQ+ individuals facing mental health challenges.",
    topics: ["LGBTQ+", "Online", "Youth", "Adults"],
    link: "https://discord.com/invite/v53KMTvS",
    contact: ""
  },
  {
    id: 4,
    name: "Grief & Healing Circle",
    description: "Compassionate support for navigating loss and grief.",
    topics: ["Grief", "Online", "Adults"],
    link: "https://discord.com/invite/v53KMTvS",
    contact: ""
  },
  
  {
    id: 6,
    name: "Youth Minds Matter (Online)",
    description: "Peer support for young people dealing with mental health concerns.",
    topics: ["Youth", "Online", "Anxiety", "Depression"],
    link: "https://discord.com/invite/v53KMTvS",
    contact: ""
  },
  {
    id: 7,
    name: "Women's Wellness Collective",
    description: "Empowering support group for women focusing on mental and emotional well-being.",
    topics: ["Women", "Online", "Stress Management"],
    link: "https://discord.com/channels/1357630751767662602/1357630752308854896",
    contact: ""
  },
  {
    id: 8,
    name: "Trauma Survivors' Space",
    description: "A supportive environment for individuals healing from trauma.",
    topics: ["Trauma Recovery", "Online", "Adults"],
    link: "https://discord.com/channels/1357630751767662602/1357630752308854896",
    contact: ""
  }
];

function SupportGroups() {
  const [filterTopic, setFilterTopic] = useState('All');

  const topics = ['All', 'Youth', 'Women', 'Trauma Recovery', 'Anxiety', 'Depression', 'LGBTQ+', 'Grief', 'Addiction', 'Online', 'Local', 'Stress Management'];

  const filteredGroups = supportGroupsData.filter(group =>
    filterTopic === 'All' || group.topics.includes(filterTopic)
  );

  return (
    <div>
      <h2><FaUsers /> Mental Health Support Groups</h2>
      <div className={styles.filterContainer}>
        <label htmlFor="topicFilter">Filter by Topic:</label>
        <select
          id="topicFilter"
          className={styles.filterSelect}
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
        >
          {topics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className={styles.groupsGrid}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div key={group.id} className={styles.groupCard}>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className={styles.topicTags}>
                {group.topics.map(topic => (
                  <span key={topic} className={styles.tag}><FaTag /> {topic}</span>
                ))}
              </div>
              <div className={styles.contactInfo}>
                {group.link && (
                  <a href={group.link} target="_blank" rel="noopener noreferrer" className={styles.joinButton}>Join Now</a>
                )}
                {group.contact && (
                  <a href={`mailto:${group.contact}`} className={styles.contactButton}>Contact Us</a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No support groups found for the selected filter.</p>
        )}
      </div>
    </div>
  );
}

export default SupportGroups;