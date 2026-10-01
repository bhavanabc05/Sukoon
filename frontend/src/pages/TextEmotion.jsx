import { useState } from "react";
import { apiFetch } from "../utils/api";
import "./TextEmotion.css";

const TEXT_EMOTION_API = "http://127.0.0.1:8000";

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

      const saveResponse = await apiFetch("/api/text-emotions", {
        method: "POST",
        body: JSON.stringify({
          text: data.text,
          cleanedText: data.cleaned_text,
          emotion: data.emotion,
          confidence: data.confidence,
          probabilities: data.probabilities,
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

      setResult(data);
    } catch (error) {
      console.error("Text emotion analysis error:", error);

      setError(
        "Unable to connect to the Text Emotion service. Make sure the Text Emotion API is running.",
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

          <div className="detected-emotion-card">
            <div className="detected-emotion-icon">💭</div>

            <div>
              <p className="result-label">DETECTED EMOTION</p>

              <h3>{result.emotion}</h3>

              <p className="confidence-text">
                Confidence:{" "}
                <strong>{(result.confidence * 100).toFixed(2)}%</strong>
              </p>
            </div>
          </div>

          {/* Submitted text */}
          <div className="submitted-text">
            <p className="result-label">YOUR TEXT</p>

            <p>"{result.text}"</p>
          </div>

          {/* Probabilities */}
          <div className="probabilities-section">
            <div className="probabilities-heading">
              <div>
                <h3>Emotion Distribution</h3>

                <p>
                  How the model distributed probability across the available
                  emotions.
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
                        <span>{emotion}</span>

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
