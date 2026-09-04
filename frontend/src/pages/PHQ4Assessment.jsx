import { useEffect, useState } from "react";
import "./PHQ4Assessment.css";
import PHQ4TrendChart from "../components/PHQ4TrendChart";

const questions = [
  {
    id: 1,
    text: "Feeling nervous, anxious, or on edge",
    category: "Anxiety",
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying",
    category: "Anxiety",
  },
  {
    id: 3,
    text: "Little interest or pleasure in doing things",
    category: "Depression",
  },
  {
    id: 4,
    text: "Feeling down, depressed, or hopeless",
    category: "Depression",
  },
];

const options = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

function PHQ4Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null]);

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  // Fetch PHQ-4 history when page loads
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setHistoryLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/phq4", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load PHQ-4 history.");
        }

        setHistory(data.assessments || []);
      } catch (error) {
        console.error("PHQ-4 history error:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleAnswer = (value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = value;

    setAnswers(updatedAnswers);
    setError("");
  };

  const submitAssessment = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/phq4", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          responses: answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save PHQ-4 assessment.");
      }

      const savedResult = {
        anxietyScore: data.assessment.anxietyScore,
        depressionScore: data.assessment.depressionScore,
        score: data.assessment.score,
        interpretation: data.assessment.interpretation,
      };

      setResults(savedResult);
      setShowResults(true);

      // Add the newly completed assessment to history
      setHistory((previousHistory) => [data.assessment, ...previousHistory]);
    } catch (error) {
      console.error("PHQ-4 submission error:", error);

      setError(
        error.message || "Something went wrong while saving your assessment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTakeAgain = () => {
    setAnswers([null, null, null, null]);
    setCurrentQuestion(0);
    setShowResults(false);
    setResults(null);
    setError("");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatInterpretation = (interpretation) => {
    if (interpretation === "normal") {
      return "Normal / None";
    }

    return (
      interpretation.charAt(0).toUpperCase() +
      interpretation.slice(1) +
      " distress"
    );
  };

  /*
   * RESULT SCREEN
   */
  if (showResults && results) {
    return (
      <div className="phq4-page">
        <div className="phq4-card phq4-results">
          <div className="phq4-header">
            <span className="phq4-badge">PHQ-4</span>

            <h1>Your PHQ-4 Results</h1>

            <p>Here is a summary of your responses over the past 2 weeks.</p>
          </div>

          <div className="phq4-total-score">
            <span>Overall Score</span>

            <strong>
              {results.score}
              <small>/12</small>
            </strong>

            <p>{formatInterpretation(results.interpretation)}</p>
          </div>

          <div className="phq4-subscale-grid">
            <div className="phq4-score-box">
              <span className="score-label">Anxiety</span>

              <strong>
                {results.anxietyScore}
                <small>/6</small>
              </strong>

              <p>
                {results.anxietyScore >= 3
                  ? "Possible anxiety symptoms"
                  : "Below anxiety screening threshold"}
              </p>
            </div>

            <div className="phq4-score-box">
              <span className="score-label">Depression</span>

              <strong>
                {results.depressionScore}
                <small>/6</small>
              </strong>

              <p>
                {results.depressionScore >= 3
                  ? "Possible depressive symptoms"
                  : "Below depression screening threshold"}
              </p>
            </div>
          </div>

          <div className="phq4-interpretation">
            <h2>What this means</h2>

            <p>
              Your PHQ-4 score falls within the{" "}
              <strong>
                {results.interpretation === "normal"
                  ? "normal / none"
                  : `${results.interpretation} distress`}
              </strong>{" "}
              range based on this screening questionnaire.
            </p>

            <p>
              A score of 3 or higher on either the anxiety or depression
              subscale suggests possible symptoms that may benefit from further
              evaluation.
            </p>
          </div>

          <div className="phq4-disclaimer">
            This questionnaire is a screening tool and is not a medical
            diagnosis. If you are concerned about how you are feeling, consider
            speaking with a qualified healthcare professional.
          </div>

          <button
            type="button"
            className="next-button phq4-finish-button"
            onClick={handleTakeAgain}
          >
            Take Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ASSESSMENT SCREEN
   */
  return (
    <div className="phq4-page">
      <div className="phq4-content">
        <div className="phq4-card">
          <div className="phq4-header">
            <span className="phq4-badge">PHQ-4</span>

            <h1>PHQ-4 Assessment</h1>

            <p>
              A brief screening questionnaire to help you reflect on symptoms of
              anxiety and depression.
            </p>

            <p className="phq4-timeframe">
              Over the last <strong>2 weeks</strong>, how often have you been
              bothered by the following problems?
            </p>
          </div>

          <div className="phq4-progress">
            <div className="progress-info">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>

              <span>
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="phq4-question">
            <span className="question-category">{question.category}</span>

            <h2>{question.text}</h2>

            <div className="phq4-options">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`phq4-option ${
                    selectedAnswer === option.value ? "selected" : ""
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <span className="option-number">{option.value}</span>

                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="phq4-error">{error}</div>}

          <div className="phq4-navigation">
            <button
              type="button"
              className="previous-button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || loading}
            >
              ← Previous
            </button>

            <button
              type="button"
              className="next-button"
              onClick={handleNext}
              disabled={selectedAnswer === null || loading}
            >
              {loading
                ? "Saving..."
                : currentQuestion === questions.length - 1
                  ? "View Results"
                  : "Next →"}
            </button>
          </div>

          <p className="phq4-disclaimer">
            This questionnaire is a screening tool and is not a medical
            diagnosis.
          </p>
        </div>

        <PHQ4TrendChart assessments={history} />

        {history.length > 0 && (
          <div className="phq4-latest">
            <div className="latest-header">
              <h2>Latest Assessment</h2>

              <p>Your most recent PHQ-4 screening result.</p>
            </div>

            <div className="latest-main">
              <div>
                <span>Overall Score</span>

                <strong>
                  {history[0].score}
                  <small>/12</small>
                </strong>
              </div>

              <div className="latest-interpretation">
                {formatInterpretation(history[0].interpretation)}
              </div>
            </div>

            <div className="latest-subscores">
              <div>
                <span>Anxiety</span>
                <strong>{history[0].anxietyScore}/6</strong>
              </div>

              <div>
                <span>Depression</span>
                <strong>{history[0].depressionScore}/6</strong>
              </div>
            </div>

            {history.length >= 2 && (
              <div className="latest-change">
                {history[0].score < history[1].score ? (
                  <>
                    ↓ {history[1].score - history[0].score} points
                    <span>Lower than your previous assessment</span>
                  </>
                ) : history[0].score > history[1].score ? (
                  <>
                    ↑ {history[0].score - history[1].score} points
                    <span>Higher than your previous assessment</span>
                  </>
                ) : (
                  <>
                    → No change
                    <span>Same score as your previous assessment</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        <div className="phq4-history">
          <div className="history-header">
            <h2>Previous Assessments</h2>

            <p>
              Your past PHQ-4 results are kept here so you can track changes
              over time.
            </p>
          </div>

          {historyLoading ? (
            <div className="history-message">
              Loading your assessment history...
            </div>
          ) : history.length === 0 ? (
            <div className="history-message">
              <strong>No previous assessments yet.</strong>

              <p>
                Complete your first PHQ-4 assessment to start tracking your
                wellbeing over time.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((assessment) => (
                <div className="history-card" key={assessment._id}>
                  <div className="history-card-header">
                    <span>{formatDate(assessment.completedAt)}</span>

                    <span className="history-score">{assessment.score}/12</span>
                  </div>

                  <div className="history-interpretation">
                    {formatInterpretation(assessment.interpretation)}
                  </div>

                  <div className="history-subscores">
                    <div>
                      <span>Anxiety</span>
                      <strong>{assessment.anxietyScore}/6</strong>
                    </div>

                    <div>
                      <span>Depression</span>
                      <strong>{assessment.depressionScore}/6</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PHQ4Assessment;
