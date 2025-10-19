// components/Header.jsx
import React from 'react';
import styles from './Header.module.css';

function Header({ scrollToHelplines }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Mentii</div>
      <nav className={styles.nav}>
        <a href="#support-groups" className={styles.navLink}>Support Groups</a>
        <a href="#therapists" className={styles.navLink}>Therapists</a>
        <a href="#articles" className={styles.navLink}>Articles</a>
        <button onClick={scrollToHelplines} className={styles.urgentHelpButton}>
          Need urgent help?
        </button>
      </nav>
    </header>
  );
}

export default Header;