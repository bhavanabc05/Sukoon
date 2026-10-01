import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import "./VideoEmotion.css";

const VIDEO_EMOTION_API = "http://127.0.0.1:8002";

function VideoEmotion() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch((error) => {
        console.error("Live camera preview failed:", error);
      });
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const startCamera = async () => {
    try {
      setError("");
      setResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);

      setError(
        "Unable to access your camera. Please allow camera permission and try again.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const startRecording = async () => {
    try {
      setError("");
      setResult(null);

      if (!streamRef.current) {
        await startCamera();
      }

      const stream = streamRef.current;

      if (!stream) {
        throw new Error("Camera is not available.");
      }

      chunksRef.current = [];

      let options = {};

      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        options = {
          mimeType: "video/webm;codecs=vp8",
        };
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        options = {
          mimeType: "video/webm",
        };
      }

      const recorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });

        setVideoBlob(blob);

        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }

        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        stopCamera();
      };

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);

      setError(err.message || "Unable to start video recording.");
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

  const analyzeVideo = async () => {
    if (!videoBlob) {
      setError("Please record a video first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("file", videoBlob, "sukoon-video.webm");

      const response = await fetch(`${VIDEO_EMOTION_API}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Video analysis failed.");
        console.log("VIDEO API RESULT:", data);
      }

      const saveResponse = await apiFetch("/api/video-emotions", {
        method: "POST",
        body: JSON.stringify({
          emotion: data.emotion,
          confidence: data.confidence,
          probabilities: data.probabilities,
        }),
      });

      console.log("VIDEO SAVE RESPONSE STATUS:", saveResponse?.status);
      console.log("SENDING VIDEO RESULT TO BACKEND:", {
        emotion: data.emotion,
        confidence: data.confidence,
        probabilities: data.probabilities,
      });

      if (!saveResponse) {
        return;
      }

      if (!saveResponse.ok) {
        const saveError = await saveResponse.json();

        throw new Error(saveError.message || "Failed to save video emotion.");
      }

      setResult(data);
    } catch (err) {
      console.error("Video analysis error:", err);

      setError(
        err.message || "Something went wrong while analyzing the video.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetVideo = () => {
    if (isRecording) {
      stopRecording();
    }

    stopCamera();

    setVideoBlob(null);
    setResult(null);
    setError("");

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setVideoUrl("");
  };

  return (
    <div className="video-emotion-page">
      <div className="video-emotion-container">
        <div className="video-emotion-header">
          <span className="video-emotion-icon">🎥</span>

          <div>
            <h1>Facial Emotion Analysis</h1>

            <p>
              Use your camera and let Sukoon understand emotional expressions
              from your face.
            </p>
          </div>
        </div>

        <div className="video-record-card">
          <div className="camera-preview">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={(event) => {
                  event.currentTarget.play().catch((error) => {
                    console.error("Preview playback error:", error);
                  });
                }}
              />
            ) : (
              <div className="camera-placeholder">
                <span>📷</span>
                <p>Camera is ready when you are</p>
              </div>
            )}
          </div>

          <div className="record-status">
            {isRecording ? (
              <>
                <span className="recording-dot"></span>
                Recording facial expression...
              </>
            ) : (
              <>
                <span>🎥</span>
                Ready to record
              </>
            )}
          </div>

          <p className="recording-hint">
            Keep your face clearly visible and look toward the camera. Record
            for a few seconds.
          </p>

          <div className="video-buttons">
            {!cameraActive && !videoBlob && (
              <button className="camera-button" onClick={startCamera}>
                📷 Open Camera
              </button>
            )}

            {cameraActive && !isRecording && (
              <button className="record-button" onClick={startRecording}>
                🎥 Start Recording
              </button>
            )}

            {isRecording && (
              <button className="stop-button" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
          </div>

          {videoUrl && (
            <div className="video-preview">
              <p>Recording preview</p>

              <video controls src={videoUrl} />
            </div>
          )}

          {videoBlob && !isRecording && (
            <div className="analysis-actions">
              <button
                className="analyze-button"
                onClick={analyzeVideo}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "✨ Analyze My Expression"}
              </button>

              <button
                className="reset-button"
                onClick={resetVideo}
                disabled={loading}
              >
                Record Again
              </button>
            </div>
          )}

          {error && <div className="video-error">{error}</div>}
        </div>

        {result && (
          <div className="video-result-card">
            <div className="result-header">
              <span>🧠</span>

              <div>
                <h2>Facial Emotion Analysis</h2>

                <p>Sukoon analyzed the facial expressions in your video.</p>
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

            {result.probabilities && (
              <div className="probability-section">
                <span className="result-label">Emotion Probabilities</span>

                {Object.entries(result.probabilities).map(
                  ([emotion, probability]) => (
                    <div className="probability-row" key={emotion}>
                      <div className="probability-info">
                        <span>{emotion}</span>

                        <strong>{Math.round(probability * 100)}%</strong>
                      </div>

                      <div className="probability-track">
                        <div
                          className="probability-fill"
                          style={{
                            width: `${probability * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoEmotion;
