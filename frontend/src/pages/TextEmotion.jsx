import { useState } from "react";
import { apiFetch } from "../utils/api";
import "./TextEmotion.css";

const TEXT_EMOTION_API = "http://127.0.0.1:8000";

function formatLanguage(language) {
  const languages = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    ml: "Malayalam",
    bn: "Bengali",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    ur: "Urdu",
  };

  return languages[language] || (language ? language.toUpperCase() : "Unknown");
}

function formatEmotion(emotion) {
  if (!emotion) return "—";

  return emotion
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TextEmotion() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      // --------------------------------------------
      // 1. Analyze using Python ML + Groq API
      // --------------------------------------------

      const response = await fetch(`${TEXT_EMOTION_API}/predict-emotion`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Text emotion API returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // --------------------------------------------
      // 2. Save complete analysis to Node backend
      // --------------------------------------------

      const saveResponse = await apiFetch("/api/text-emotions", {
        method: "POST",

        body: JSON.stringify({
          text: data.text,

          cleanedText: data.cleaned_text,

          language: data.language,

          emotion: data.emotion,

          confidence: data.confidence,

          probabilities: data.probabilities,

          mlEmotion: data.ml_emotion,

          mlConfidence: data.ml_confidence,

          llmEmotion: data.llm_emotion,

          llmConfidence: data.llm_confidence,

          llmReason: data.llm_reason,

          llmUsed: data.llm_used,
        }),
      });

      if (!saveResponse) {
        return;
      }

      if (!saveResponse.ok) {
        const saveData = await saveResponse.json();

        throw new Error(
          saveData.message || "Unable to save text emotion result.",
        );
      }

      // --------------------------------------------
      // 3. Display result
      // --------------------------------------------

      setResult(data);
    } catch (error) {
      console.error("Text emotion analysis error:", error);

      setError(
        error.message || "Unable to connect to the Text Emotion service.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-emotion-page">
      {/* Header */}

      <section className="text-emotion-header">
        <div>
          <p className="text-emotion-eyebrow">UNDERSTAND</p>

          <h1>Text Emotion</h1>

          <p>
            Put your thoughts into words and explore the emotion expressed in
            your text.
          </p>
        </div>
      </section>

      {/* Input */}

      <section className="text-emotion-card">
        <div className="card-heading">
          <div>
            <h2>What would you like to express?</h2>

            <p>Write a sentence or a few lines about how you're feeling.</p>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Example: I feel really happy today..."
          rows={7}
        />

        <div className="text-emotion-actions">
          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Emotion"}
          </button>

          {text && !loading && (
            <button
              className="clear-button"
              onClick={() => {
                setText("");
                setResult(null);
                setError("");
              }}
            >
              Clear
            </button>
          )}
        </div>

        {error && <div className="text-emotion-error">⚠️ {error}</div>}
      </section>

      {/* Result */}

      {result && (
        <section className="text-emotion-result">
          <div className="result-header">
            <div>
              <p className="text-emotion-eyebrow">ANALYSIS RESULT</p>

              <h2>Your Text Emotion</h2>
            </div>
          </div>

          {/* Final emotion */}

          <div className="detected-emotion-card">
            <div className="detected-emotion-icon">💭</div>

            <div>
              <p className="result-label">FINAL DETECTED EMOTION</p>

              <h3>{formatEmotion(result.emotion)}</h3>

              <p className="confidence-text">
                Confidence:{" "}
                <strong>{(result.confidence * 100).toFixed(2)}%</strong>
              </p>
            </div>
          </div>

          {/* Analysis metadata */}

          <div className="text-analysis-meta">
            <div>
              <span>LANGUAGE</span>

              <strong>{formatLanguage(result.language)}</strong>
            </div>

            <div>
              <span>ANALYSIS</span>

              <strong>{result.llm_used ? "ML + Groq LLM" : "ML Model"}</strong>
            </div>
          </div>

          {/* LLM refinement */}

          {result.llm_used && result.llm_reason && (
            <div className="llm-refinement-card">
              <div className="llm-refinement-icon">✨</div>

              <div>
                <p className="result-label">CONTEXTUAL REFINEMENT</p>

                <h3>Sukoon considered the context</h3>

                <p>{result.llm_reason}</p>
              </div>
            </div>
          )}

          {/* Model comparison */}

          {result.llm_used && (
            <div className="model-comparison-section">
              <div className="probabilities-heading">
                <div>
                  <h3>How the result was refined</h3>

                  <p>
                    The trained ML model first generated an emotion prediction.
                    Groq then considered the full context before producing the
                    final result.
                  </p>
                </div>
              </div>

              <div className="model-comparison-grid">
                <div className="model-result-card">
                  <span className="model-result-label">INITIAL ML MODEL</span>

                  <strong>{formatEmotion(result.ml_emotion)}</strong>

                  <p>Confidence: {(result.ml_confidence * 100).toFixed(2)}%</p>
                </div>

                <div className="model-result-arrow">→</div>

                <div className="model-result-card llm-result-card">
                  <span className="model-result-label">GROQ REFINEMENT</span>

                  <strong>{formatEmotion(result.llm_emotion)}</strong>

                  <p>Confidence: {(result.llm_confidence * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Submitted text */}

          <div className="submitted-text">
            <p className="result-label">YOUR TEXT</p>

            <p>"{result.text}"</p>
          </div>

          {/* ML probabilities */}

          <div className="probabilities-section">
            <div className="probabilities-heading">
              <div>
                <h3>ML Emotion Distribution</h3>

                <p>
                  Probability distribution produced by the trained emotion model
                  before contextual refinement.
                </p>
              </div>
            </div>

            <div className="probability-list">
              {Object.entries(result.probabilities || {})
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, probability]) => {
                  const percentage = probability * 100;

                  return (
                    <div className="probability-item" key={emotion}>
                      <div className="probability-top">
                        <span>{formatEmotion(emotion)}</span>

                        <strong>{percentage.toFixed(2)}%</strong>
                      </div>

                      <div className="probability-bar">
                        <div
                          className="probability-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default TextEmotion;
