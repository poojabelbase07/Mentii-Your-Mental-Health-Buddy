// src/pages/ArticleDetailPage.jsx
// You might put this in a 'pages' or 'components/modules' folder, e.g., src/pages/ArticleDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../styles/ArticleDetailPage.module.css'; // Create this CSS module

// --- Mock Data for Demonstration ---
// In a real application, you'd fetch this from a database (e.g., Firebase Firestore)
const articlesContent = {
  "stress-management-strategies": {
    title: "5 Effective Strategies for Stress Management",
    category: "Stress Management",
    fullContent: `
      <p>Stress is a natural part of life, but chronic stress can negatively impact your mental and physical health. Learning effective strategies to manage it is crucial for well-being.</p>
      <h3>1. Practice Mindfulness and Meditation</h3>
      <p>Mindfulness involves focusing on the present moment. Even a few minutes of meditation or deep breathing exercises daily can reduce stress levels. Apps like Calm or Headspace can guide you.</p>
      <h3>2. Regular Physical Activity</h3>
      <p>Exercise is a powerful stress reliever. It helps produce endorphins, which have mood-boosting effects. Aim for at least 30 minutes of moderate activity most days of the week.</p>
      <h3>3. Prioritize Sleep</h3>
      <p>Lack of sleep can exacerbate stress. Ensure you're getting 7-9 hours of quality sleep per night. Establish a regular sleep schedule and create a relaxing bedtime routine.</p>
      <h3>4. Healthy Diet</h3>
      <p>What you eat can affect your mood and energy levels. Opt for a balanced diet rich in fruits, vegetables, and whole grains. Limit caffeine and processed foods, which can worsen anxiety.</p>
      <h3>5. Connect with Others</h3>
      <p>Social support is vital. Spend time with loved ones, talk about your feelings, or join a support group. Feeling connected can significantly reduce feelings of isolation and stress.</p>
      <p>Remember, managing stress is an ongoing process. Be patient with yourself and seek professional help if stress becomes overwhelming.</p>
    `,
    relatedArticles: ["building-self-esteem", "mindfulness-exercises"]
  },
  "building-self-esteem": {
    title: "Building Self-Esteem: A Comprehensive Guide",
    category: "Self-Esteem",
    fullContent: `
      <p>Self-esteem is your overall opinion of yourself – how you feel about your abilities and limitations. High self-esteem isn't about being arrogant; it's about having a realistic, appreciative opinion of yourself.</p>
      <h3>1. Identify and Challenge Negative Thoughts</h3>
      <p>Our thoughts profoundly impact our self-esteem. When you catch yourself thinking negatively about yourself, challenge those thoughts. Ask if they are truly accurate or just a habit.</p>
      <h3>2. Focus on Your Strengths</h3>
      <p>Make a list of your positive qualities and accomplishments. Acknowledge your talents and successes, no matter how small they seem. Regularly remind yourself of what you're good at.</p>
      <h3>3. Set Realistic Goals</h3>
      <p>Achieving goals can boost your self-esteem. Start with small, attainable goals and gradually work your way up. Celebrate each success along the way.</p>
      <h3>4. Practice Self-Compassion</h3>
      <p>Treat yourself with the same kindness and understanding you would offer a good friend. Avoid self-criticism and forgive yourself for mistakes.</p>
      <h3>5. Engage in Activities You Enjoy</h3>
      <p>Doing things you love can make you feel more capable and connected. Hobbies, creative pursuits, or learning new skills can significantly improve your self-perception.</p>
      <p>Building self-esteem takes time and effort. Be persistent, celebrate small victories, and consider professional guidance if you struggle significantly.</p>
    `,
    relatedArticles: ["positive-affirmations", "understanding-anxiety"]
  },
  "positive-affirmations": {
    title: "The Power of Positive Affirmations",
    category: "Self-Esteem",
    fullContent: "<p>Positive affirmations are positive statements that can help you challenge and overcome self-sabotaging and negative thoughts. When you repeat them often and believe in them, you can start to make positive changes.</p><p>For example, instead of 'I'm not good enough,' try 'I am capable and strong.' Consistent practice can rewire your brain.</p>",
    relatedArticles: ["building-self-esteem"]
  },
  "understanding-anxiety": {
    title: "Understanding Anxiety: Types, Symptoms, and Coping",
    category: "Anxiety",
    fullContent: "<p>Anxiety is a feeling of unease, such as worry or fear, that can be mild or severe. Everyone experiences feelings of anxiety at some point in their life. However, for some, anxiety can become persistent and overwhelming.</p><p>Common symptoms include restlessness, difficulty concentrating, irritability, muscle tension, and sleep disturbances. Coping strategies include deep breathing, exercise, and seeking professional help.</p>",
    relatedArticles: ["stress-management-strategies"]
  }
  // Add more articles as needed
};
// --- End Mock Data ---

function ArticleDetailPage() {
  const { articleSlug } = useParams(); // Get the dynamic part of the URL (e.g., 'stress-management-strategies')
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // In a real app, you would fetch this from Firebase Firestore:
    // const fetchArticle = async () => {
    //   const docRef = doc(db, "articles", articleSlug); // Assuming a 'articles' collection
    //   const docSnap = await getDoc(docRef);
    //   if (docSnap.exists()) {
    //     setArticle(docSnap.data());
    //   } else {
    //     setArticle(null); // Article not found
    //   }
    //   setLoading(false);
    // };
    // fetchArticle();

    // For now, use mock data
    const fetchedArticle = articlesContent[articleSlug];
    if (fetchedArticle) {
      setArticle(fetchedArticle);
    } else {
      setArticle(null);
    }
    setLoading(false);
  }, [articleSlug]); // Re-fetch if the slug changes

  if (loading) {
    return <div className={styles.loading}>Loading article...</div>;
  }

  if (!article) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>Article Not Found</h1>
        <p className={styles.notFoundMessage}>The article you are looking for does not exist or has been moved.</p>
        <Link to="/mentalhaccess" className={styles.backButton}>Back to Resources</Link>
      </div>
    );
  }

  return (
    <div className={styles.articleDetailContainer}>
      <Link to="/mentalhaccess" className={styles.backButton}>&larr; Back to Resources</Link>
      <h1 className={styles.articleTitle}>{article.title}</h1>
      <p className={styles.articleCategory}>Category: {article.category}</p>
      {/* dangerouslySetInnerHTML is used here because fullContent is HTML string */}
      <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: article.fullContent }} />

      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className={styles.relatedArticles}>
          <h2>Related Articles</h2>
          <ul>
            {article.relatedArticles.map(slug => {
              const related = articlesContent[slug]; // Get data for related article
              return related ? (
                <li key={slug}>
                  <Link to={`/mentalhaccess/articles/${slug}`}>{related.title}</Link>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ArticleDetailPage;