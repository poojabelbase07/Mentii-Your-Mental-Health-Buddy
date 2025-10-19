// components/UrgentHelpButton.jsx
import React from 'react';
import styles from './UrgentHelpButton.module.css';
import { FaAmbulance } from 'react-icons/fa';

function UrgentHelpButton({ scrollToHelplines }) {
  return (
    <button className={styles.floatingButton} onClick={scrollToHelplines}>
      <FaAmbulance /> Need urgent help?
    </button>
  );
}

export default UrgentHelpButton;