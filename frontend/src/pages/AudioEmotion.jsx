import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import "./AudioEmotion.css";

const AUDIO_EMOTION_API = "http://127.0.0.1:8001";

function AudioEmotion() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError("");
      setResult(null);
      setAudioBlob(null);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      audioChunksRef.current = [];

      let options = {};

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = {
          mimeType: "audio/webm;codecs=opus",
        };
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = {
          mimeType: "audio/webm",
        };
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);

      setError(
        "Unable to access your microphone. Please allow microphone permission and try again.",
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async () => {
    if (!audioBlob) {
      setError("Please record your voice first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("file", audioBlob, "sukoon-recording.webm");

      const response = await fetch(`${AUDIO_EMOTION_API}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Audio analysis failed.");
      }

      const saveResponse = await apiFetch("/api/audio-emotions", {
        method: "POST",
        body: JSON.stringify({
          transcript: data.transcript,
          emotion: data.emotion,
          confidence: data.confidence,
        }),
      });

      if (!saveResponse) {
        return;
      }

      if (!saveResponse.ok) {
        const saveError = await saveResponse.json();

        throw new Error(saveError.message || "Failed to save audio emotion.");
      }

      setResult(data);
    } catch (err) {
      console.error("Audio analysis error:", err);

      setError(
        err.message || "Something went wrong while analyzing the audio.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }

    setAudioBlob(null);
    setResult(null);
    setError("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
  };

  return (
    <div className="audio-emotion-page">
      <div className="audio-emotion-container">
        <div className="audio-emotion-header">
          <span className="audio-emotion-icon">🎙️</span>

          <div>
            <h1>Voice Emotion Analysis</h1>

            <p>
              Record your voice and let Sukoon understand the emotion behind
              your words.
            </p>
          </div>
        </div>

        <div className="audio-record-card">
          <div className="record-status">
            {isRecording ? (
              <>
                <span className="recording-dot"></span>
                Recording...
              </>
            ) : (
              <>
                <span className="microphone-symbol">🎤</span>
                Ready to record
              </>
            )}
          </div>

          <p className="recording-hint">
            Speak naturally for a few seconds. You can describe how your day is
            going or how you feel.
          </p>

          <div className="record-buttons">
            {!isRecording ? (
              <button className="record-button" onClick={startRecording}>
                🎙️ Start Recording
              </button>
            ) : (
              <button className="stop-button" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="audio-preview">
              <p>Recording preview</p>

              <audio controls src={audioUrl} />
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="analysis-actions">
              <button
                className="analyze-button"
                onClick={analyzeAudio}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "✨ Analyze My Voice"}
              </button>

              <button
                className="reset-button"
                onClick={resetRecording}
                disabled={loading}
              >
                Record Again
              </button>
            </div>
          )}

          {error && <div className="audio-error">{error}</div>}
        </div>

        {result && (
          <div className="audio-result-card">
            <div className="result-header">
              <span>🧠</span>

              <div>
                <h2>Emotion Analysis</h2>
                <p>Sukoon analyzed your voice and speech.</p>
              </div>
            </div>

            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Detected Emotion</span>

                <span className="emotion-value">{result.emotion}</span>
              </div>

              <div className="result-item">
                <span className="result-label">Confidence</span>

                <span className="confidence-value">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="transcript-section">
              <span className="result-label">Transcript</span>

              <div className="transcript-box">
                {result.transcript || "No speech detected."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioEmotion;
