// components/EmergencyHelplines.jsx
import React from 'react';
import styles from './EmergencyHelplines.module.css';
import { FaPhoneAlt, FaComments, FaExclamationTriangle } from 'react-icons/fa';

const helplinesData = [
  {
    country: "India",
    helplines: [
      { name: "iCall", number: "022-25521111", description: "Tata Institute of Social Sciences (TISS) helpline.", type: "call" },
      { name: "Snehi Foundation", number: "1800-121-1200", description: "24/7 suicide prevention helpline.", type: "call" },
      { name: "Vandrevala Foundation", number: "+91-9999666555", description: "Round-the-clock mental health support.", type: "call" },
      { name: "Kiran Helpline (Govt. of India)", number: "1800-599-0019", description: "Toll-free mental health rehabilitation helpline.", type: "call" },
      { name: "AASRA", number: "+91-9820466726", description: "24/7 helpline for suicide prevention and mental health.", type: "call" },
      { name: "YourDost (Chat/Call)", link: "https://yourdost.com/", description: "Online emotional wellness platform.", type: "chat" }
    ]
  },
  {
    country: "USA",
    helplines: [
      { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 confidential support.", type: "call" },
      { name: "Crisis Text Line", number: "741741", description: "Text HOME to 741741 from anywhere in the US.", type: "text" },
      { name: "NAMI Helpline", number: "1-800-950-NAMI (6264)", description: "National Alliance on Mental Illness helpline.", type: "call" }
    ]
  },
  {
    country: "UK",
    helplines: [
      { name: "Samaritans", number: "116 123", description: "Available 24 hours a day, 365 days a year.", type: "call" },
      { name: "Mind Infoline", number: "0300 123 3393", description: "Information and signposting service.", type: "call" }
    ]
  }
];

function EmergencyHelplines() {
  // A more sophisticated app might detect user's location and prioritize relevant helplines
  // For this design, we'll just list them all.
  const preferredCountry = "India"; // Example: Could be dynamic based on user settings/IP

  return (
    <div>
      <h2><FaExclamationTriangle /> Emergency & Helpline Numbers</h2>
      <p className={styles.urgentMessage}>
        If you are in immediate danger or feel you might harm yourself or others, please call your local emergency services immediately.
      </p>

      {helplinesData.map(countryData => (
        <div key={countryData.country} className={styles.countryBlock}>
          <h3 className={styles.countryHeading}>{countryData.country} Helplines</h3>
          <div className={styles.helplinesGrid}>
            {countryData.helplines.map(helpline => (
              <div key={helpline.name} className={styles.helplineCard}>
                <h4>{helpline.name}</h4>
                <p>{helpline.description}</p>
                <div className={styles.helplineActions}>
                  {helpline.type === 'call' && (
                    <a href={`tel:${helpline.number}`} className={styles.callButton}>
                      <FaPhoneAlt /> Call Now: {helpline.number}
                    </a>
                  )}
                  {helpline.type === 'text' && (
                    <a href={`sms:${helpline.number}`} className={styles.textButton}>
                      <FaComments /> Text Now: {helpline.number}
                    </a>
                  )}
                  {helpline.type === 'chat' && helpline.link && (
                    <a href={helpline.link} target="_blank" rel="noopener noreferrer" className={styles.chatButton}>
                      <FaComments /> Chat Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmergencyHelplines;