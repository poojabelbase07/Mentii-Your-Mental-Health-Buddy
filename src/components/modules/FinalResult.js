// src/components/modules/FinalResult.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './FinalResult.module.css';
import * as tf from '@tensorflow/tfjs';

// Helper to format module names
const getModuleName = (moduleId) => {
  const names = {
    sentimentAnalysis: 'Emotional Intelligence',
    cbt: 'Cognitive Flexibility (Journal)',
    colorPsychology: 'Creative Expression',
    finalAnalysis: 'Final Comprehensive Analysis'
  };
  return names[moduleId] || moduleId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const FinalResult = () => {
  const { currentUser, userProfile, saveAssessmentResult, getUserAssessments, getJournalEntries } = useAuth();
  const navigate = useNavigate();

  const reportRef = useRef(); // Ref for the content to be converted to PDF

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Stores the processed, validated data from all modules, ready for NN
  const [allAssessmentsData, setAllAssessmentsData] = useState(null);
  // Stores the aggregated results before NN (for display purposes)
  const [originalCombinedResults, setOriginalCombinedResults] = useState(null);
  // Stores the final output from the neural network
  const [neuralNetworkOutput, setNeuralNetworkOutput] = useState(null);
  const [isNNProcessing, setIsNNProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalAnalysisSaved, setFinalAnalysisSaved] = useState(false);

  // State to track if detailed data is fetched and validated for NN
  const [isNNInputReady, setIsNNInputReady] = useState(false);

  // Mappings for numerical encoding (must be consistent with potential training)
  const dominantEmotionMap = {
    'very_positive': 5, 'positive': 4, 'neutral': 3, 'negative': 2, 'very_negative': 1, default: 3
  };
  const dominantColorMap = {
    'Red': 0, 'Blue': 1, 'Green': 2, 'Yellow': 3, 'Purple': 4, 'Orange': 5, 'Pink': 6, 'Brown': 7, 'Black': 8, 'White': 9, default: 0
  };

  /**
   * Derives a single numerical score from CBT journal entries.
   * This is a heuristic and can be refined based on actual CBT success metrics.
   * A higher score indicates better engagement/effectiveness.
   * @param {Array} journalEntries - Array of CBT journal entry objects.
   * @returns {number} Derived CBT journal score (0-100).
   */
  const deriveCBTJournalScore = useCallback((journalEntries) => {
    if (!journalEntries || journalEntries.length === 0) {
      return 0; // No entries, no score
    }

    let totalScore = 0;
    journalEntries.forEach(entry => {
      let entryScore = 0;
      // Assign points for presence of key CBT elements
      if (entry.situation) entryScore += 20;
      if (entry.emotions && entry.emotions.length > 0) entryScore += 20;
      if (entry.automaticThoughts) entryScore += 20;
      if (entry.evidenceFor || entry.evidenceAgainst) entryScore += 20; // Points for reflection
      if (entry.alternativeThought) entryScore += 20; // Crucial for reframing

      // Max 100 per entry, but average across all entries
      totalScore += entryScore;
    });

    const averageEntryScore = totalScore / journalEntries.length;

    // Add a bonus for consistency/volume of entries (e.g., max 20 points for 4+ entries)
    const entryVolumeBonus = Math.min(journalEntries.length * 5, 20);

    // Ensure score is within 0-100 range
    return Math.min(100, Math.round(averageEntryScore * 0.8 + entryVolumeBonus * 0.2)); // Weighted average
  }, []);

  /**
   * Prepares and normalizes input data for the neural network.
   * Provides fallbacks for missing data to prevent NN errors.
   * @param {Object} sentimentData - Processed sentiment analysis data.
   * @param {Object} colorData - Processed color psychology data.
   * @param {Object} cbtData - Processed CBT journal data (contains score).
   * @returns {Object} Contains `inputArray` (normalized tensor input) and `originalInputs`.
   */
  const prepareNNInput = useCallback((sentimentData, colorData, cbtData) => {
    // Use nullish coalescing (??) to provide default values if data is missing/null/undefined
    const sentimentScore = sentimentData?.overallScore ?? 50; // Default to 50 if missing
    const dominantEmotion = sentimentData?.dominantEmotion || sentimentData?.overallSentiment || 'neutral'; // Fallback to 'neutral'
    const moodScore = colorData?.moodScore ?? 50; // Default to 50 if missing
    const dominantColor = colorData?.dominantColor ?? 'Red'; // Default to 'Red' if missing
    const cbtJournalScore = cbtData?.score ?? 50; // Default to 50 if missing

    // Normalize inputs to a 0-1 range for the neural network
    const sentimentScoreNormalized = sentimentScore / 100; // 0-100 scale
    const moodScoreNormalized = moodScore / 100;       // 0-100 scale
    const cbtJournalScoreNormalized = cbtJournalScore / 100; // 0-100 scale

    // Encode dominant emotion (1-5 scale) and normalize
    const dominantEmotionEncoded = (dominantEmotionMap[dominantEmotion.toLowerCase()] ?? dominantEmotionMap.default);
    const dominantEmotionNormalized = (dominantEmotionEncoded - 1) / (Object.keys(dominantEmotionMap).length - 2); // (value - min) / (max - min) excluding 'default'

    // Encode dominant color (0-9 scale) and normalize
    const dominantColorEncoded = (dominantColorMap[dominantColor] !== undefined ? dominantColorMap[dominantColor] : dominantColorMap.default);
    const dominantColorNormalized = dominantColorEncoded / (Object.keys(dominantColorMap).length - 2); // (value - min) / (max - min) excluding 'default'

    const inputs = [
      sentimentScoreNormalized,
      dominantEmotionNormalized,
      moodScoreNormalized,
      dominantColorNormalized,
      cbtJournalScoreNormalized
    ];

    // Critical: Check for NaN in the final input array before passing to TensorFlow.js
    if (inputs.some(isNaN)) {
      console.error("NaN detected in NN input array:", inputs, { sentimentScore, dominantEmotion, moodScore, dominantColor, cbtJournalScore });
      throw new Error("Invalid data encountered while preparing NN input (NaN). Ensure all source data is valid or has proper fallbacks.");
    }

    console.log("NN Inputs Prepared:", {
      sentimentScore, dominantEmotion, moodScore, dominantColor, cbtJournalScore,
      normalized_inputs: inputs
    });

    return {
      inputArray: inputs,
      originalInputs: { sentimentScore, dominantEmotion, moodScore, dominantColor, cbtJournalScore }
    };
  }, [dominantColorMap, dominantEmotionMap]);

  /**
   * Creates a simple sequential neural network model and loads hardcoded weights.
   * This simulates a pre-trained model for consistent predictions with varied outputs.
   * For a real application, you would load a model from a saved path.
   * @param {number} inputShape - The number of input features.
   * @returns {tf.LayersModel} A TensorFlow.js model with more nuanced hardcoded weights.
   */
  const createNNModel = useCallback((inputShape) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [inputShape], units: 8, activation: 'relu', name: 'layer1' }));
    model.add(tf.layers.dense({ units: 4, activation: 'relu', name: 'layer2' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid', name: 'output_layer' }));

    // More complex hardcoded weights to simulate a trained model with varied but consistent results.
    // These weights are arbitrary and for demonstration only, designed to produce a wider range of scores.
    const dummyWeights = [
      // Layer 1 weights (inputShape x 8 units)
      tf.tensor2d([
        [ 0.15, -0.05,  0.25,  0.10, -0.12,  0.30, -0.08,  0.18],
        [-0.03,  0.18,  0.07,  0.22,  0.05, -0.10,  0.28,  0.01],
        [ 0.20, -0.10,  0.02,  0.17,  0.28,  0.06, -0.15,  0.23],
        [-0.07,  0.25, -0.18,  0.04,  0.11,  0.20,  0.03, -0.09],
        [ 0.10,  0.08,  0.14, -0.06,  0.21, -0.02,  0.13,  0.26]
      ], [inputShape, 8]),
      // Layer 1 biases (8 units)
      tf.tensor1d([0.01, -0.02, 0.03, 0.01, -0.01, 0.02, -0.01, 0.03]),

      // Layer 2 weights (8 units x 4 units)
      tf.tensor2d([
        [ 0.10, -0.05,  0.15,  0.08],
        [-0.02,  0.12,  0.03,  0.18],
        [ 0.07, -0.08,  0.10,  0.05],
        [ 0.14,  0.01, -0.03,  0.09],
        [-0.04,  0.06,  0.11, -0.01],
        [ 0.09, -0.07,  0.02,  0.16],
        [ 0.03,  0.13, -0.09,  0.07],
        [ 0.11, -0.01,  0.12, -0.06]
      ], [8, 4]),
      // Layer 2 biases (4 units)
      tf.tensor1d([0.01, 0.005, -0.01, 0.015]),

      // Output layer weights (4 units x 1 unit)
      tf.tensor2d([
        [0.20],
        [0.15],
        [-0.10],
        [0.25]
      ], [4, 1]),
      // Output layer biases (1 unit)
      tf.tensor1d([0.5]) // Bias to push output closer to mid-range before sigmoid
    ];

    model.setWeights(dummyWeights);
    console.log("NN Model Created & Compiled with inputShape:", inputShape, "and nuanced dummy weights loaded.");
    return model;
  }, []);

  /**
   * Runs the neural network analysis using the prepared input data.
   * @param {Object} sentimentData - Processed sentiment analysis data.
   * @param {Object} colorData - Processed color psychology data.
   * @param {Object} cbtData - Processed CBT journal data.
   * @returns {Object|null} The neural network output data or null if an error occurs.
   */
  const runNeuralNetworkAnalysis = useCallback(async (sentimentData, colorData, cbtData) => {
    setIsNNProcessing(true);
    setNeuralNetworkOutput(null); // Reset previous output
    try {
      if (!sentimentData || !colorData || !cbtData) {
        throw new Error("Assessment data is incomplete for comprehensive analysis. Cannot run Neural Network.");
      }

      const INPUT_SHAPE = 5; // Number of input features for the NN
      const { inputArray, originalInputs } = prepareNNInput(sentimentData, colorData, cbtData);

      const model = createNNModel(INPUT_SHAPE); // Model with hardcoded weights
      const inputTensor = tf.tensor2d([inputArray]);
      const prediction = model.predict(inputTensor);
      const outputScore = (await prediction.data())[0]; // Get the single output value (0-1)

      let summary = '';
      let recommendations = [];
      let wellnessLevel = '';

      // Interpret the NN output score (0-1)
      if (outputScore >= 0.75) {
        summary = "Your mental well-being is exceptionally strong and resilient. You have excellent emotional regulation and cognitive flexibility.";
        recommendations = ["Continue with your highly effective self-care practices.", "Explore advanced mindfulness or meditation techniques.", "Consider sharing your strategies with others to inspire them.", "Set new personal growth goals that align with your elevated well-being."];
        wellnessLevel = 'Excellent';
      } else if (outputScore >= 0.5) {
        summary = "Your mental well-being is generally healthy and balanced. You manage stress well, but there are opportunities for further growth.";
        recommendations = ["Engage in consistent self-care activities you enjoy.", "Refine your coping mechanisms for occasional stressors.", "Regularly practice cognitive reframing from your CBT journal.", "Explore new hobbies or activities that foster creative expression."];
        wellnessLevel = 'Good';
      } else if (outputScore >= 0.25) {
        summary = "Your mental well-being shows areas that could benefit from more focused attention and support. You may be experiencing moderate challenges.";
        recommendations = ["Prioritize stress reduction through deep breathing, meditation, or light exercise.", "Actively work on identifying and challenging negative automatic thoughts in your CBT journal.", "Seek support from trusted friends, family, or consider professional guidance.", "Ensure adequate sleep and nutrition for improved energy levels."];
        wellnessLevel = 'Fair';
      } else {
        summary = "Your mental well-being requires immediate and significant attention. You are likely experiencing considerable distress.";
        recommendations = ["It is highly recommended to seek professional mental health support immediately.", "Focus on basic self-care: adequate rest, simple healthy meals, and gentle movement.", "Limit exposure to stressors and create a supportive environment.", "Engage in activities that provide temporary comfort or distraction, then revisit coping strategies."];
        wellnessLevel = 'Needs Attention';
      }

      // Prepare the data structure to save and display
      const nnOutputData = {
        overallScore: outputScore, // Raw NN output (0-1)
        summary: summary,
        recommendations: recommendations,
        holisticWellnessScoreNN: Math.round(outputScore * 100), // Scaled to 0-100 for display
        inputsUsed: originalInputs, // Show what inputs went into the NN
        modelDetails: "Simulated Pre-trained MLP (TensorFlow.js, 2 hidden layers, 5 inputs)",
        processedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(), // For consistency
        wellnessLevel: wellnessLevel,
        keyInsights: [
          `Overall Wellness Score (NN): ${Math.round(outputScore * 100)}/100 (${wellnessLevel})`,
          `Emotional Tendency: ${originalInputs.dominantEmotion}`,
          `Cognitive Flexibility (Journaling): ${originalInputs.cbtJournalScore}/100`,
          `Subconscious Mood Indicator (Color): ${originalInputs.moodScore}/100`
        ],
      };
      setNeuralNetworkOutput(nnOutputData);
      setFinalAnalysisSaved(false); // Reset save status

      tf.dispose([inputTensor, prediction, model]); // Clean up TensorFlow.js tensors and model

      return nnOutputData; // Return the result for saving
    } catch (err) {
      console.error("Error running Neural Network analysis:", err);
      setError(err.message || "Failed to perform comprehensive analysis. Please ensure all modules are completed and contain valid data.");
      setNeuralNetworkOutput(null);
      return null;
    } finally {
      setIsNNProcessing(false);
    }
  }, [prepareNNInput, createNNModel]);

  /**
   * Effect to fetch individual module data when user or profile changes,
   * and determine if all necessary data is ready for NN processing.
   */
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchAndProcessAllData = async () => {
      setLoading(true);
      setError('');
      setIsNNInputReady(false); // Reset NN readiness until data is verified

      try {
        // Fetch all assessments and journal entries concurrently
        const [assessments, journalEntries] = await Promise.all([
          getUserAssessments(),
          getJournalEntries()
        ]);

        // Process Sentiment Analysis Data
        const sentimentData = assessments?.sentimentAnalysis || assessments?.sentiment || null;
        const saDataValid = sentimentData &&
                            (sentimentData.overallScore !== undefined || sentimentData.score !== undefined) &&
                            (sentimentData.dominantEmotion || sentimentData.overallSentiment);

        // Process Color Psychology Data
        const colorData = assessments?.colorPsychology || null;
        const cpDataValid = colorData &&
                            (colorData.moodScore !== undefined || colorData.score !== undefined) &&
                            colorData.dominantColor;

        // Process CBT Journal Data (derive a single score)
        const cbtJournalScore = deriveCBTJournalScore(journalEntries);
        const cbtDataForNN = {
          score: cbtJournalScore,
          entryCount: journalEntries.length,
          completedAt: journalEntries.length > 0 && journalEntries[0].timestamp
                          ? new Date(journalEntries[0].timestamp).toISOString()
                          : null
        };
        const cbtDataValid = cbtDataForNN.score !== undefined && cbtDataForNN.entryCount > 0;

        const combinedProcessedData = {
          sentimentAnalysis: saDataValid ? sentimentData : null,
          cbt: cbtDataValid ? cbtDataForNN : null,
          colorPsychology: cpDataValid ? colorData : null,
          finalAnalysis: assessments?.finalAnalysis || null // Existing final analysis, if any
        };

        setAllAssessmentsData(combinedProcessedData);

        // Determine if all required data pieces are valid and present for NN
        if (saDataValid && cbtDataValid && cpDataValid) {
          setIsNNInputReady(true);
          setError(''); // Clear any previous errors
        } else {
          let missingInfo = [];
          if (!saDataValid) missingInfo.push(getModuleName('sentimentAnalysis'));
          if (!cbtDataValid) missingInfo.push(getModuleName('cbt') + (journalEntries.length === 0 ? ' (no entries)' : ' (incomplete data)'));
          if (!cpDataValid) missingInfo.push(getModuleName('colorPsychology'));

          setError(`Please complete all modules to unlock your comprehensive analysis. Missing data for: ${missingInfo.join(', ')}.`);
          setIsNNInputReady(false);
        }

      } catch (err) {
        console.error('Error loading detailed assessments for final result:', err);
        setError(err.message || 'Failed to load detailed assessment data. Please try again.');
        setIsNNInputReady(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessAllData();
  }, [currentUser, userProfile, getUserAssessments, getJournalEntries, deriveCBTJournalScore, navigate]);


  /**
   * Effect to trigger neural network analysis once all input data is ready
   * and the analysis hasn't been run yet.
   */
  useEffect(() => {
    // Run only if data is ready, NN isn't already processing, and no output exists yet
    if (isNNInputReady && allAssessmentsData && !isNNProcessing && !neuralNetworkOutput) {
      const { sentimentAnalysis, colorPsychology, cbt } = allAssessmentsData;
      // Double check that all necessary objects exist after processing
      if (sentimentAnalysis && colorPsychology && cbt) {
        runNeuralNetworkAnalysis(sentimentAnalysis, colorPsychology, cbt);
      } else {
        // This case indicates an internal logic error if isNNInputReady is true but data is null
        setError("Internal error: Data marked ready but objects are null. Please contact support.");
      }
    }
  }, [isNNInputReady, allAssessmentsData, isNNProcessing, neuralNetworkOutput, runNeuralNetworkAnalysis]);


  /**
   * Generates a combined overview of insights from individual modules.
   * This is separate from the NN output, providing a pre-NN summary.
   * @param {Object} assessments - Object containing sentimentAnalysis, cbt, colorPsychology data.
   * @returns {Object} Combined insights.
   */
  const generateOriginalCombinedResults = useCallback((assessments) => {
    const sentimental = assessments.sentimentAnalysis || {};
    const cbt = assessments.cbt || {}; // cbt here is the derived cbtDataForNN
    const color = assessments.colorPsychology || {};

    const scores = [
      sentimental.overallScore ?? sentimental.score ?? 0, // sentiment analysis score
      cbt.score ?? 0, // derived cbt score
      color.moodScore ?? color.score ?? 0 // color psychology mood score
    ].map(s => Number(s)).filter(s => !isNaN(s)); // Ensure numbers and filter out NaN

    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const personalityInsights = combinePersonalityInsights(sentimental, cbt, color);
    const recommendations = generateComprehensiveRecommendations(sentimental, cbt, color, overallScore);
    const wellnessProfile = createWellnessProfile({
        sentimentAnalysis: sentimental,
        cbt: cbt,
        colorPsychology: color
    }, overallScore);

    return {
      overallScore,
      personalityInsights,
      recommendations,
      wellnessProfile,
      individualResults: { sentimental, cbt, color },
      generatedAt: new Date().toISOString()
    };
  }, []); // No external dependencies, functions are pure

    const combinePersonalityInsights = (sentimental, cbt, color) => {
        const insights = [];
        if (sentimental.dominantEmotion) insights.push(`Your dominant emotional state is often perceived as ${sentimental.dominantEmotion}.`);
        else if (sentimental.overallSentiment) insights.push(`Your overall emotional sentiment tends to be ${sentimental.overallSentiment}.`);
        
        if (cbt.entryCount > 0) {
        insights.push(`With ${cbt.entryCount} CBT journal entries, you're actively working on cognitive flexibility.`);
        if(cbt.score !== undefined) insights.push(`Your engagement with CBT principles is reflected in a derived score of ${cbt.score}/100.`);
        } else {
        insights.push("Engaging with CBT journaling can help build cognitive flexibility.");
        }

        if (color.overallProfile) insights.push(`Your color psychology profile suggests: ${color.overallProfile}.`);
        else if (color.dominantColor) insights.push(`Your dominant color preference is ${color.dominantColor}, often associated with its typical meanings.`);

        if (insights.length === 0) insights.push("Completing all modules provides a multi-faceted view of your psychological inclinations.");
        return insights;
    };

    const generateComprehensiveRecommendations = (sentimental, cbt, color, overallScore) => {
        const recommendations = { immediate: [], longTerm: [], lifestyle: [] };
        
        if (overallScore < 40) recommendations.immediate.push("Consider discussing your results with a mental health professional for deeper insights.");
        else if (overallScore < 70) recommendations.immediate.push("Focus on incorporating stress-reduction and mindfulness techniques into your daily routine.");
        else recommendations.immediate.push("Continue to nurture your mental well-being and explore new avenues for personal growth.");

        if (sentimental.recommendations && Array.isArray(sentimental.recommendations)) {
        recommendations.lifestyle.push(...sentimental.recommendations.slice(0,1));
        } else if (sentimental.overallSentiment === 'negative' || sentimental.overallSentiment === 'very_negative') {
            recommendations.immediate.push("Address negative sentiment patterns by challenging unhelpful thoughts.");
        }
        
        if (cbt.entryCount > 0) {
        recommendations.longTerm.push("Regularly use CBT journaling to identify and reframe negative thought patterns effectively.");
        } else {
        recommendations.longTerm.push("Start a CBT journal to enhance your cognitive flexibility and emotional regulation skills.");
        }

        if (color.recommendations && Array.isArray(color.recommendations)) {
        recommendations.lifestyle.push(...color.recommendations.slice(0,1));
        } else if (color.moodScore < 50) {
            recommendations.lifestyle.push(`Explore using colors like ${color.dominantColor || 'Green or Blue'} to positively influence your mood.`);
        }

        if(recommendations.immediate.length === 0) recommendations.immediate.push("Explore self-help resources based on your assessment insights.");
        if(recommendations.longTerm.length === 0) recommendations.longTerm.push("Set small, actionable goals for personal development based on your insights.");
        if(recommendations.lifestyle.length === 0) recommendations.lifestyle.push("Maintain a balanced diet, regular physical activity, and adequate sleep for overall well-being.");
        
        return recommendations;
    };
    
    const createWellnessProfile = (assessments, overallScore) => {
        const profile = {
        overallWellness: getWellnessLevel(overallScore),
        strengths: [],
        areasForGrowth: [],
        };
        
        const saScore = assessments.sentimentAnalysis?.overallScore ?? assessments.sentimentAnalysis?.score;
        if (saScore >= 70) profile.strengths.push(getModuleName('sentimentAnalysis'));
        else if (saScore < 50) profile.areasForGrowth.push(getModuleName('sentimentAnalysis'));

        const cpScore = assessments.colorPsychology?.moodScore ?? assessments.colorPsychology?.score;
        if (cpScore >= 70) profile.strengths.push(getModuleName('colorPsychology'));
        else if (cpScore < 50) profile.areasForGrowth.push(getModuleName('colorPsychology'));
        
        const cbtScore = assessments.cbt?.score; // This is the derived score
        if (cbtScore >= 70) profile.strengths.push(getModuleName('cbt'));
        else if (cbtScore < 50 && assessments.cbt?.entryCount > 0) profile.areasForGrowth.push(getModuleName('cbt'));
        else if (assessments.cbt?.entryCount === 0) profile.areasForGrowth.push(`${getModuleName('cbt')} (start journaling)`);


        if (profile.strengths.length === 0) profile.strengths.push("Commitment to self-awareness by completing these modules.");
        if (profile.areasForGrowth.length === 0) profile.areasForGrowth.push("Opportunity for continuous self-reflection and growth.");
        return profile;
    };

  const getWellnessLevel = (score) => {
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Fair';
      return 'Needs Attention';
  };

  const getScoreColor = (score) => {
    let numericScore = parseFloat(score);
    if (isNaN(numericScore)) return '#6b7280'; // Default for non-numeric

    if (score <= 1 && score >= 0) { // Normalized score (0-1), convert to 0-100 for color logic
        numericScore = score * 100;
    }
    if (numericScore >= 80) return '#22c55e'; // Green
    if (numericScore >= 60) return '#84cc16'; // Light Green
    if (numericScore >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };


  /**
   * Handles saving the final neural network analysis result to Firebase.
   * @returns {Promise<void>}
   */
  const handleSaveFinalAnalysis = async () => {
    if (!neuralNetworkOutput || !allAssessmentsData) {
      setError("Cannot save: Neural network output or assessment data is missing.");
      return;
    }
    setIsSaving(true);
    setError('');

    try {
      // Use the holisticWellnessScoreNN (0-100) for the primary score
      const finalAssessmentDataToSave = {
        neuralNetworkAnalysis: neuralNetworkOutput, // Save the full NN output
        overallScore: neuralNetworkOutput.holisticWellnessScoreNN, // For consistency in general assessment tracking
        summary: neuralNetworkOutput.summary,
        recommendations: neuralNetworkOutput.recommendations,
        wellnessLevel: neuralNetworkOutput.wellnessLevel,
        inputsUsed: neuralNetworkOutput.inputsUsed,
        processedAt: neuralNetworkOutput.processedAt,
        completedAt: new Date().toISOString(), // Mark when this final analysis was generated/saved
        moduleType: 'finalAnalysis'
      };

      // This summaryData goes into userProfile.moduleProgress.finalAnalysis.summary
      const finalSummaryForProfile = {
        score: neuralNetworkOutput.holisticWellnessScoreNN, // The 0-100 NN score
        primaryResult: neuralNetworkOutput.summary, // The textual summary from NN
        overallWellnessLevel: neuralNetworkOutput.wellnessLevel,
        // Include individual module scores for quick glance in profile if desired
        sentimentScore: allAssessmentsData.sentimentAnalysis?.overallScore || allAssessmentsData.sentimentAnalysis?.score,
        cbtScore: allAssessmentsData.cbt?.score,
        colorMoodScore: allAssessmentsData.colorPsychology?.moodScore || allAssessmentsData.colorPsychology?.score,
      };

      await saveAssessmentResult('finalAnalysis', finalAssessmentDataToSave, finalSummaryForProfile);
      setFinalAnalysisSaved(true);
      alert('Comprehensive analysis saved successfully!');

    } catch (e) {
      console.error('Error saving final analysis:', e);
      setError(`Failed to save final analysis: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Generates and downloads a PDF report of the final analysis.
   * Requires html2pdf.js to be loaded (e.g., via CDN in public/index.html).
   */

const handleDownloadReport = () => {
  const element = reportRef.current;

  if (!element || !neuralNetworkOutput) {
    alert('Cannot generate report: Final analysis data is not available or the report content is not rendered.');
    return;
  }

  console.log("Generating PDF from reportRef...", element);

  // Add print-friendly class to hide canvas/spinner etc. during rendering
  element.classList.add('print-friendly');

  const opt = {
    margin: 10,
    filename: `mental_health_report_${currentUser?.uid || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (element) => {
        const tag = element.tagName?.toLowerCase();
        const isCanvasOrVideo = tag === 'canvas' || tag === 'video';
        const isZeroSize = element.offsetWidth === 0 || element.offsetHeight === 0;
        return isCanvasOrVideo || isZeroSize;
      }
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  window.html2pdf().set(opt).from(element).save()
    .then(() => {
      element.classList.remove('print-friendly');
      console.log("✅ PDF generated successfully.");
    })
    .catch((err) => {
      element.classList.remove('print-friendly');
      console.error("❌ PDF generation failed:", err);
      alert("PDF download failed. Please try again.");
    });
};


  const handleRetakeAssessment = () => {
    // Instead of a simple confirm, perhaps a custom modal would be better
    if (window.confirm('This will take you to the dashboard. To update your comprehensive results, please revisit and retake individual modules from the dashboard.')) {
      navigate('/dashboard');
    }
  };

  // --- JSX Rendering ---
  if (loading) {
    return (
      <div className={styles.finalResultContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading comprehensive analysis data...</p>
      </div>
    );
  }

  // If there's an error message (e.g., modules not complete, data fetch error)
  if (error && !neuralNetworkOutput) {
    return (
      <div className={styles.finalResultContainer}>
        <h1 className={styles.header}>Comprehensive Mental Health Report</h1>
        <p className={styles.errorMessage}>⚠️ {error}</p>
        <div className={styles.resultsActions}>
            <button onClick={() => navigate('/dashboard')} className={styles.retakeButton}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  // If NN processing is ongoing
  if (isNNProcessing) {
    return (
        <div className={styles.finalResultContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>🧠 Performing comprehensive analysis using Neural Network...</p>
        </div>
      );
  }

  // Display results if NN output is available
  return (
    <div className={styles.finalResultContainer}>
      <h1 className={styles.header}>Your Comprehensive Mental Health Report</h1>
      {error && neuralNetworkOutput && <p className={`${styles.errorMessage} ${styles.inlineError}`}>Note: {error}</p>} {/* For minor errors post NN output */}

      {/* The content that will be converted to PDF */}
      <div ref={reportRef} className={styles.pdfContentWrapper}> 
        {neuralNetworkOutput ? (
          <section className={styles.overallResult}>
            <h2>Overall Well-being Analysis (AI Enhanced)</h2>
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreValue} style={{ color: getScoreColor(neuralNetworkOutput.overallScore) }}>
                {(neuralNetworkOutput.overallScore * 100).toFixed(0)}
              </span>
              <span className={styles.scoreMax}>/100</span>
            </div>
            <p className={styles.summaryText}>{neuralNetworkOutput.summary}</p>
            {neuralNetworkOutput.recommendations && neuralNetworkOutput.recommendations.length > 0 && (
              <div className={styles.recommendations}>
                <h3>Personalized Recommendations:</h3>
                <ul className={styles.recommendationsList}>
                  {neuralNetworkOutput.recommendations.map((rec, index) => (
                    <li key={index}>
                      <span>💡</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {neuralNetworkOutput.keyInsights && neuralNetworkOutput.keyInsights.length > 0 && (
              <div className={styles.keyInsightsSection}>
                  <h4>Key Insights from Analysis:</h4>
                  <ul className={styles.keyInsightsList}>
                  {neuralNetworkOutput.keyInsights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                  ))}
                  </ul>
              </div>
            )}
            {/* The save button is outside the PDF content as it's an action */}
            {/* <button
              onClick={handleSaveFinalAnalysis}
              className={styles.saveButton}
              disabled={isSaving || finalAnalysisSaved}
            >
              {isSaving ? 'Saving...' : (finalAnalysisSaved ? '✅ Analysis Saved!' : 'Save This Analysis')}
            </button> */}
          </section>
        ) : (
          <p>Waiting for all module data to be processed and analyzed...</p>
        )}

        {/* Display original combined results (non-NN) if available */}
        {allAssessmentsData && ( // Show this section once all raw data is fetched
          <>
            <hr className={styles.sectionDivider} />
            <section className={styles.insightsSection}>
              <h2>Module-Derived Personality Insights</h2>
              <div className={styles.insightsList}>
                {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.personalityInsights) &&
                  generateOriginalCombinedResults(allAssessmentsData).personalityInsights.map((insight, index) => (
                    <div key={index} className={styles.insightItem}>
                      <span className={styles.insightIcon}>🧠</span>
                      <p>{insight}</p>
                    </div>
                ))}
              </div>
            </section>

            <section className={styles.wellnessSection}>
              <h2>Module-Derived Wellness Profile</h2>
              <div className={styles.wellnessGrid}>
                {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.wellnessProfile?.strengths) &&
                  generateOriginalCombinedResults(allAssessmentsData).wellnessProfile.strengths.length > 0 && (
                    <div className={`${styles.wellnessCard} ${styles.strengths}`}>
                      <h3>🌟 Strengths</h3>
                      <ul>
                        {generateOriginalCombinedResults(allAssessmentsData).wellnessProfile.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                )}
                {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.wellnessProfile?.areasForGrowth) &&
                  generateOriginalCombinedResults(allAssessmentsData).wellnessProfile.areasForGrowth.length > 0 && (
                    <div className={`${styles.wellnessCard} ${styles.growth}`}>
                      <h3>🌱 Areas for Growth</h3>
                      <ul>
                        {generateOriginalCombinedResults(allAssessmentsData).wellnessProfile.areasForGrowth.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>
              <p className={styles.moduleScore} style={{marginTop: '10px'}}>
                  Combined Module Average Score: <strong style={{color: getScoreColor(generateOriginalCombinedResults(allAssessmentsData).overallScore)}}>{generateOriginalCombinedResults(allAssessmentsData).overallScore}/100</strong>
              </p>
            </section>

            <section className={styles.recommendationsSection}>
              <h2>Module-Derived Recommendations</h2>
              <div className={styles.recommendationsGrid}>
                <div className={styles.recommendationCard}>
                  <h3>🎯 Immediate Actions</h3>
                  <ul>
                    {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.recommendations?.immediate) &&
                      generateOriginalCombinedResults(allAssessmentsData).recommendations.immediate.map((r, i) => <li key={i}>{r}</li>)
                    }
                  </ul>
                </div>
                <div className={styles.recommendationCard}>
                  <h3>📈 Long-term Goals</h3>
                  <ul>
                    {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.recommendations?.longTerm) &&
                      generateOriginalCombinedResults(allAssessmentsData).recommendations.longTerm.map((r, i) => <li key={i}>{r}</li>)
                    }
                  </ul>
                </div>
                <div className={styles.recommendationCard}>
                  <h3>🎨 Lifestyle Changes</h3>
                  <ul>
                    {Array.isArray(generateOriginalCombinedResults(allAssessmentsData)?.recommendations?.lifestyle) &&
                      generateOriginalCombinedResults(allAssessmentsData).recommendations.lifestyle.map((r, i) => <li key={i}>{r}</li>)
                    }
                  </ul>
                </div>
              </div>
            </section>
          </>
        )}


        {allAssessmentsData && ( // Display summary only if data was loaded
          <>
              <hr className={styles.sectionDivider} />
              <section className={styles.modulesSummary}>
              <h2>Individual Module Data Snapshot</h2>
              <p className={styles.moduleDescription}>This is a summary of the data used for the comprehensive analysis.</p>
              <div className={styles.modulesGrid}>
              {Object.entries(allAssessmentsData).map(([key, moduleData]) => {
                  if (!moduleData || key === 'finalAnalysis') return null; // Skip if no data or if it's a previous finalAnalysis

                  let scoreDisplay = "N/A";
                  let scoreForColor = 0.5; // Default for color calculation
                  let isComplete = false;

                  if (key === 'sentimentAnalysis' && moduleData.overallScore !== undefined) {
                      scoreDisplay = `${Number(moduleData.overallScore).toFixed(0)}/100 (Overall Score)`;
                      scoreForColor = Number(moduleData.overallScore) / 100;
                      isComplete = true;
                  } else if (key === 'cbt' && moduleData.score !== undefined) {
                      scoreDisplay = `${Number(moduleData.score).toFixed(0)}/100 (Derived Journal Score), ${moduleData.entryCount} entries`;
                      scoreForColor = Number(moduleData.score) / 100;
                      isComplete = moduleData.entryCount > 0;
                  } else if (key === 'colorPsychology' && moduleData.moodScore !== undefined) {
                      scoreDisplay = `${Number(moduleData.moodScore).toFixed(0)}/100 (Mood Score)`;
                      scoreForColor = Number(moduleData.moodScore) / 100;
                      isComplete = true;
                  }
                  
                  return (
                  <div className={styles.moduleCard} key={key}>
                      <h3>{getModuleName(key)}</h3>
                      <div className={styles.moduleScore} style={{ color: getScoreColor(scoreForColor * 100) }}>
                      {scoreDisplay}
                      </div>
                      <p className={styles.moduleStatus}>
                      {isComplete ? '✅ Data Utilized' : '⚠️ Data Incomplete/Not Utilized'}
                      </p>
                      {key === 'sentimentAnalysis' && <p>Emotion: {moduleData.dominantEmotion || moduleData.overallSentiment || 'N/A'}</p>}
                      {key === 'colorPsychology' && <p>Dominant Color: {moduleData.dominantColor || 'N/A'}</p>}
                  </div>
                  );
              })}
              </div>
          </section>
          </>
        )}
      </div> {/* End of pdfContentWrapper */}

      <div className={styles.resultsActions}>
        <button onClick={handleDownloadReport} className={styles.downloadButton} disabled={!neuralNetworkOutput}>📄 Download Full Report (PDF)</button>
        <button
          onClick={handleSaveFinalAnalysis}
          className={styles.saveButton}
          disabled={isSaving || finalAnalysisSaved || !neuralNetworkOutput}
        >
          {isSaving ? 'Saving...' : (finalAnalysisSaved ? '✅ Analysis Saved!' : 'Save This Analysis')}
        </button>
        <button onClick={handleRetakeAssessment} className={styles.retakeButton}>🔄 Go to Dashboard</button>
      </div>
    </div>
  );
};

export default FinalResult;
