// MentalHealthResourcesPage.jsx
import React from 'react';
import styles from './MentalHealthResourcesPage.module.css'; // Main page styles
import Header from '../cmzone/Header'; // For the sticky header
import SupportGroups from '../cmzone/SupportGroups';
import EmergencyHelplines from '../cmzone/EmergencyHelplines';
import Therapists from '../cmzone/Therapists';
import ArticlesGuides from '../cmzone/ArticlesGuides';
import UrgentHelpButton from '../cmzone/UrgentHelpButton'; // For the floating button
import Footer from '@/components/layout/Footer';

function MentalHealthResourcesPage() {
  const emergencyHelplinesRef = React.useRef(null); // Ref for scrolling

  const scrollToHelplines = () => {
    emergencyHelplinesRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  

  return (
    <div>
    <div className={styles.pageContainer}>
      <Header scrollToHelplines={scrollToHelplines} /> {/* Pass down scroll function */}
      <h1 className={styles.pageTitle}>Mental Health Resources</h1>
      <p className={styles.pageDescription}>
        Find trusted support, emergency contacts, and professional help to navigate your mental health journey.
      </p>

    
      <section className={styles.section}>
        <SupportGroups />
      </section>
      

      <section className={styles.section} ref={emergencyHelplinesRef}>
        <EmergencyHelplines />
      </section>

      <section className={styles.section}>
        <Therapists />
      </section>

      <section className={styles.section}>
        <ArticlesGuides  />
      </section>

      <UrgentHelpButton scrollToHelplines={scrollToHelplines} />
    </div>
    <Footer/>
    </div>
  );
}

export default MentalHealthResourcesPage;