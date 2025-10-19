import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// ================================================================
// Drawing Activity Storage
// ================================================================

export const saveDrawing = async (userId, canvasDataURL, title = 'Untitled Drawing') => {
  try {
    // Convert canvas data URL to blob
    const response = await fetch(canvasDataURL);
    const blob = await response.blob();
    
    // Upload image to Firebase Storage
    const imageRef = ref(storage, `drawings/${userId}/${Date.now()}.png`);
    const snapshot = await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    // Save drawing metadata to Firestore
    const drawingDoc = await addDoc(collection(db, 'drawings'), {
      userId,
      title,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: drawingDoc.id, imageUrl };
  } catch (error) {
    console.error('Error saving drawing:', error);
    throw error;
  }
};

export const getUserDrawings = async (userId) => {
  try {
    const q = query(
      collection(db, 'drawings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching drawings:', error);
    throw error;
  }
};

export const deleteDrawing = async (drawingId) => {
  try {
    await deleteDoc(doc(db, 'drawings', drawingId));
  } catch (error) {
    console.error('Error deleting drawing:', error);
    throw error;
  }
};

// ================================================================
// Sudoku Game Storage
// ================================================================

export const saveSudokuProgress = async (userId, boardState, isComplete = false) => {
  try {
    const sudokuDoc = await addDoc(collection(db, 'sudoku_games'), {
      userId,
      boardState,
      isComplete,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeSpent: 0 // You can track this
    });
    
    return sudokuDoc.id;
  } catch (error) {
    console.error('Error saving Sudoku progress:', error);
    throw error;
  }
};

export const updateSudokuProgress = async (gameId, boardState, isComplete = false, timeSpent = 0) => {
  try {
    const gameRef = doc(db, 'sudoku_games', gameId);
    await updateDoc(gameRef, {
      boardState,
      isComplete,
      timeSpent,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating Sudoku progress:', error);
    throw error;
  }
};

export const getUserSudokuGames = async (userId) => {
  try {
    const q = query(
      collection(db, 'sudoku_games'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching Sudoku games:', error);
    throw error;
  }
};

// ================================================================
// Word Search Game Storage
// ================================================================

export const saveWordSearchProgress = async (userId, grid, words, foundWords, isComplete = false) => {
  try {
    const gameDoc = await addDoc(collection(db, 'word_search_games'), {
      userId,
      grid,
      words,
      foundWords,
      isComplete,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return gameDoc.id;
  } catch (error) {
    console.error('Error saving Word Search progress:', error);
    throw error;
  }
};

export const updateWordSearchProgress = async (gameId, foundWords, isComplete = false) => {
  try {
    const gameRef = doc(db, 'word_search_games', gameId);
    await updateDoc(gameRef, {
      foundWords,
      isComplete,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating Word Search progress:', error);
    throw error;
  }
};

// ================================================================
// Crossword Game Storage
// ================================================================

export const saveCrosswordProgress = async (userId, puzzleState, isComplete = false) => {
  try {
    const gameDoc = await addDoc(collection(db, 'crossword_games'), {
      userId,
      puzzleState,
      isComplete,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return gameDoc.id;
  } catch (error) {
    console.error('Error saving Crossword progress:', error);
    throw error;
  }
};

export const updateCrosswordProgress = async (gameId, puzzleState, isComplete = false) => {
  try {
    const gameRef = doc(db, 'crossword_games', gameId);
    await updateDoc(gameRef, {
      puzzleState,
      isComplete,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating Crossword progress:', error);
    throw error;
  }
};

// ================================================================
// Journal Entries Storage
// ================================================================

export const saveJournalEntry = async (userId, prompt, entry, mood = null) => {
  try {
    const entryDoc = await addDoc(collection(db, 'journal_entries'), {
      userId,
      prompt,
      entry,
      mood,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return entryDoc.id;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entryId, entry, mood = null) => {
  try {
    const entryRef = doc(db, 'journal_entries', entryId);
    await updateDoc(entryRef, {
      entry,
      mood,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const getUserJournalEntries = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId) => {
  try {
    await deleteDoc(doc(db, 'journal_entries', entryId));
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// ================================================================
// User Activity Statistics
// ================================================================

export const updateUserActivityStats = async (userId, activityType, data = {}) => {
  try {
    const statsDoc = await addDoc(collection(db, 'user_activity_stats'), {
      userId,
      activityType, // 'drawing', 'sudoku', 'word_search', 'crossword', 'journaling'
      ...data,
      timestamp: serverTimestamp()
    });
    
    return statsDoc.id;
  } catch (error) {
    console.error('Error updating activity stats:', error);
    throw error;
  }
};

export const getUserActivityStats = async (userId, activityType = null) => {
  try {
    let q;
    if (activityType) {
      q = query(
        collection(db, 'user_activity_stats'),
        where('userId', '==', userId),
        where('activityType', '==', activityType),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, 'user_activity_stats'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    throw error;
  }
};