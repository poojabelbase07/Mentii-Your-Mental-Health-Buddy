// components/Therapists.jsx
import React from 'react';
import styles from './Therapists.module.css';
import { FaUserMd, FaMapMarkerAlt, FaGlobe, FaCalendarAlt, FaEnvelope, FaHeart, FaPhoneAlt } from 'react-icons/fa'; // Icons
// Import Firebase for bookmarking (conceptual)
// import { auth, db } from '../firebaseConfig';
// import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const therapistsData = [
  {
    id: 1,
    name: "Ms. Vasudha Vishwas",
    specialty: "Counselling Psychologist",
    location: "Nashik, India",
    contact: "https://www.practo.com/nashik/therapist/vasudha-vishwas-psychologist?practice_id=1375198&specialization=Individual%20therapy&referrer=doctor_listing&page_uid=cc4a72af-7622-4bb0-aa81-258b85fdeff4&category_name=service&category_id=101825",
    picture: "https://via.placeholder.com/100/7bbcd0/FFFFFF?text=AS", // Placeholder image
    expertise: ["CBT", "Trauma Therapy", "Adolescent Counseling"],
    availability: "Online & In-person",
    calendlyLink: "https://www.practo.com/nashik/therapist/vasudha-vishwas-psychologist?practice_id=1375198&specialization=Individual%20therapy&referrer=doctor_listing&page_uid=cc4a72af-7622-4bb0-aa81-258b85fdeff4&category_name=service&category_id=101825"
  },
  {
    id: 2,
    name: "Dr. Hemant Sonanis",
    specialty: "Psychiatrist",
    location: "Nashik, India",
    picture: "https://via.placeholder.com/100/2c5364/FFFFFF?text=RG",
    expertise: ["Mindfulness-Based Therapy", "Stress Management", "Anxiety"],
    availability: "Online",
    calendlyLink: "https://www.practo.com/nashik/doctor/hemant-sonanis-psychiatrist-1?practice_id=884170&specialization=Individual%20therapy&referrer=doctor_listing&page_uid=cc4a72af-7622-4bb0-aa81-258b85fdeff4&category_name=service&category_id=101825"
  },
  {
    id: 3,
    name: "Dr. Nakul Vanjari",
    specialty: "Neuropsychiatrist,Psychiatrist",
    location: "Nashik, India",
    picture: "https://via.placeholder.com/100/4a7d96/FFFFFF?text=SJ",
    expertise: ["Addiction Psychiatrist","Psychotherapist"],
    availability: "In-person",
    calendlyLink: "https://www.practo.com/nashik/therapist/nakul-vanjari-psychiatrist?practice_id=1053504&specialization=Individual%20therapy&referrer=doctor_listing&page_uid=cc4a72af-7622-4bb0-aa81-258b85fdeff4&category_name=service&category_id=101825"
  },
  
];

function Therapists() {
  // const [bookmarkedTherapists, setBookmarkedTherapists] = useState([]);
  // Assuming a user is logged in for bookmarking
  // const userId = auth.currentUser?.uid;

  // const toggleBookmark = async (therapistId) => {
  //   if (!userId) {
  //     alert("Please log in to bookmark therapists.");
  //     return;
  //   }
  //   const userRef = doc(db, "users", userId);
  //   if (bookmarkedTherapists.includes(therapistId)) {
  //     await updateDoc(userRef, {
  //       bookmarkedTherapists: arrayRemove(therapistId)
  //     });
  //     setBookmarkedTherapists(bookmarkedTherapists.filter(id => id !== therapistId));
  //   } else {
  //     await updateDoc(userRef, {
  //       bookmarkedTherapists: arrayUnion(therapistId)
  //     });
  //     setBookmarkedTherapists([...bookmarkedTherapists, therapistId]);
  //   }
  // };

  return (
    <div>
      <h2><FaUserMd /> Therapists & Mental Health Professionals</h2>
      <div className={styles.therapistGrid}>
        {therapistsData.map(therapist => (
          <div key={therapist.id} className={styles.therapistCard}>
            <div className={styles.profileHeader}>
              {therapist.picture && (
                <img src={therapist.picture} alt={therapist.name} className={styles.profilePicture} />
              )}
              <div className={styles.profileInfo}>
                <h3>{therapist.name}</h3>
                <p className={styles.specialty}>{therapist.specialty}</p>
              </div>
              {/* <button
                className={`${styles.bookmarkButton} ${bookmarkedTherapists.includes(therapist.id) ? styles.bookmarked : ''}`}
                onClick={() => toggleBookmark(therapist.id)}
                title="Bookmark Therapist"
              >
                <FaHeart />
              </button> */}
            </div>
            <div className={styles.details}>
              <p><FaMapMarkerAlt /> {therapist.location}</p>
              <p><FaGlobe /> {therapist.availability}</p>
              <div className={styles.expertiseTags}>
                {therapist.expertise.map(area => (
                  <span key={area} className={styles.expertiseTag}>{area}</span>
                ))}
              </div>
            </div>
            <div className={styles.contactActions}>
              {therapist.calendlyLink ? (
                <a href={therapist.calendlyLink} target="_blank" rel="noopener noreferrer" className={styles.bookButton}>
                  <FaCalendarAlt /> Book Session
                </a>
              ) : (
                <a href={`mailto:${therapist.contact}`} className={styles.contactButton}>
                  <FaEnvelope /> Contact
                </a>
              )}
              {/* Fallback to phone if no Calendly or email */
              !therapist.calendlyLink && !therapist.contact && therapist.phone && (
                <a href={`tel:${therapist.phone}`} className={styles.contactButton}>
                    <FaPhoneAlt /> Call
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Therapists;