// components/ArticlesGuides.jsx
import React, { useState } from 'react';
import styles from './ArticlesGuides.module.css';
import { FaBookOpen, FaSearch, FaLightbulb, FaHeart } from 'react-icons/fa'; // Ensure FaHeart is imported if used
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// IMPORTANT: Update this data to use 'path' matching your new internal routes
const articlesData = [
  {
    id: 1,
    title: "5 Effective Strategies for Stress Management",
    description: "Learn practical techniques to reduce stress in your daily life.",
    category: "Stress Management",
    path: "https://www.verywellmind.com/top-school-stress-relievers-for-students-3145179" // Changed from 'link' to 'path' for internal routing
  },
  {
    id: 2,
    title: "Building Self-Esteem: A Comprehensive Guide",
    description: "Steps to cultivate a stronger sense of self-worth.",
    category: "Self-Esteem",
    path: "/mentalhaccess/articles/building-self-esteem" // Internal path
  },
  {
    id: 3,
    title: "Dealing with Burnout: Signs, Prevention, and Recovery",
    description: "Recognize burnout and learn how to recover and prevent it.",
    category: "Dealing with Burnout",
    path: "/mentalhaccess/articles/dealing-with-burnout" // Internal path
  },
  {
    id: 4,
    title: "Understanding Anxiety: Types, Symptoms, and Coping",
    description: "An overview of anxiety disorders and effective coping mechanisms.",
    category: "Anxiety",
    path: "/mentalhaccess/articles/understanding-anxiety" // Internal path
  },
  {
    id: 5,
    title: "Mindfulness Exercises for Daily Calm",
    description: "Simple mindfulness practices to bring peace into your day.",
    category: "Stress Management",
    path: "/mentalhaccess/articles/mindfulness-exercises" // Internal path
  },
  {
    id: 6,
    title: "The Power of Positive Affirmations",
    description: "How positive self-talk can transform your mindset.",
    category: "Self-Esteem",
    path: "/mentalhaccess/articles/positive-affirmations" // Internal path
  }
];

function ArticlesGuides() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  // const [savedArticles, setSavedArticles] = useState([]);
  // const userId = auth.currentUser?.uid;

  const categories = ['All', 'Stress Management', 'Self-Esteem', 'Dealing with Burnout', 'Anxiety'];

  const filteredArticles = articlesData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // const toggleSaveArticle = async (articleId) => {
  //   if (!userId) {
  //     alert("Please log in to save articles.");
  //     return;
  //   }
  //   const userRef = doc(db, "users", userId);
  //   if (savedArticles.includes(articleId)) {
  //     await updateDoc(userRef, {
  //       savedArticles: arrayRemove(articleId)
  //     });
  //     setSavedArticles(savedArticles.filter(id => id !== articleId));
  //   } else {
  //     await updateDoc(userRef, {
  //       savedArticles: arrayUnion(articleId)
  //     });
  //     setSavedArticles([...savedArticles, articleId]);
  //   }
  // };

  return (
    <div>
      <h2><FaBookOpen /> Helpful Articles & Guides</h2>
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.categorySelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className={styles.articlesGrid}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div key={article.id} className={styles.articleCard}>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <div className={styles.articleMeta}>
                <span className={styles.categoryTag}><FaLightbulb /> {article.category}</span>
                {/* <button
                  className={`${styles.saveButton} ${savedArticles.includes(article.id) ? styles.saved : ''}`}
                  onClick={() => toggleSaveArticle(article.id)}
                  title="Save Article"
                >
                  <FaHeart />
                </button> */}
              </div>
              {/* CHANGE THIS: Use Link component for internal navigation */}
              {/* Remove target="_blank" and rel="noopener noreferrer" for internal links */}
              <Link to={article.path} className={styles.readButton}>Read More</Link>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No articles found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

export default ArticlesGuides;