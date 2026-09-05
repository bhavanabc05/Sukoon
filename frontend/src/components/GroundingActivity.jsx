import { useEffect, useRef, useState } from "react";
import "../pages/Interventions.css";

function GroundingActivity({ intervention, onComplete }) {
  const steps = [
    {
      number: 5,
      sense: "See",
      instruction: "Look around you and identify five things you can see.",
      placeholder: "Example: a window, a chair, my laptop...",
    },
    {
      number: 4,
      sense: "Feel",
      instruction: "Notice four things you can physically feel.",
      placeholder: "Example: my feet on the floor, the chair beneath me...",
    },
    {
      number: 3,
      sense: "Hear",
      instruction: "Listen carefully and identify three sounds you can hear.",
      placeholder: "Example: the fan, people talking, birds outside...",
    },
    {
      number: 2,
      sense: "Smell",
      instruction: "Notice two things you can smell.",
      placeholder: "Example: coffee, fresh air...",
    },
    {
      number: 1,
      sense: "Taste",
      instruction: "Notice one thing you can taste.",
      placeholder: "Example: the taste of water...",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef(null);

  const step = steps[currentStep];

  // --------------------------------------------------
  // CHECK VOICE SUPPORT
  // --------------------------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setAnswer((previous) => {
        if (!previous.trim()) {
          return transcript;
        }

        return `${previous} ${transcript}`;
      });

      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access in your browser.",
        );
      } else if (event.error === "no-speech") {
        setVoiceError("No speech was detected. Please try speaking again.");
      } else {
        setVoiceError("Voice input could not be started. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // --------------------------------------------------
  // VOICE INPUT
  // --------------------------------------------------

  const handleVoiceInput = () => {
    setVoiceError("");

    if (!voiceSupported) {
      setVoiceError(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }

    if (!recognitionRef.current) {
      setVoiceError("Voice input is unavailable. Please try again.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Could not start speech recognition:", error);

      setVoiceError("Could not start the microphone. Please try again.");
    }
  };

  // --------------------------------------------------
  // NEXT STEP
  // --------------------------------------------------

  const handleNext = () => {
    if (!answer.trim()) {
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const updatedAnswers = [
      ...answers,
      {
        sense: step.sense,
        response: answer.trim(),
      },
    ];

    setAnswers(updatedAnswers);
    setAnswer("");
    setVoiceError("");

    if (currentStep === steps.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentStep((previous) => previous + 1);
  };

  // --------------------------------------------------
  // BACK
  // --------------------------------------------------

  const handleBack = () => {
    if (currentStep === 0) {
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const previousAnswer = answers[currentStep - 1];

    setAnswer(previousAnswer?.response || "");

    setAnswers(answers.slice(0, currentStep - 1));

    setCurrentStep((previous) => previous - 1);

    setVoiceError("");
  };

  // --------------------------------------------------
  // COMPLETION SCREEN
  // --------------------------------------------------

  if (completed) {
    return (
      <div className="intervention-activity-card">
        <div className="completion-icon">🌿</div>

        <h1>Grounding complete</h1>

        <p className="intervention-description">
          Well done. You took a moment to bring your attention back to the
          present.
        </p>

        <div className="grounding-summary">
          <h2>Your observations</h2>

          {answers.map((item, index) => (
            <div className="grounding-summary-item" key={index}>
              <strong>
                {steps[index].number} things to {item.sense.toLowerCase()}
              </strong>

              <p>{item.response}</p>
            </div>
          ))}
        </div>

        <button className="complete-button" onClick={onComplete}>
          Complete Intervention
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // EXERCISE SCREEN
  // --------------------------------------------------

  return (
    <div className="intervention-activity-card">
      <h1>{intervention.title}</h1>

      <p className="intervention-description">
        Take your time. There are no right or wrong answers.
      </p>

      <div className="grounding-progress">
        Step {currentStep + 1} of {steps.length}
      </div>

      <div className="grounding-number">{step.number}</div>

      <h2>Things you can {step.sense.toLowerCase()}</h2>

      <p className="grounding-instruction">{step.instruction}</p>

      {/* -------------------------------------------- */}
      {/* TEXT INPUT */}
      {/* -------------------------------------------- */}

      <textarea
        className="grounding-input"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder={step.placeholder}
        rows={4}
      />

      {/* -------------------------------------------- */}
      {/* VOICE INPUT */}
      {/* -------------------------------------------- */}

      <div className="grounding-voice">
        <button
          type="button"
          className={`voice-button ${
            isListening ? "voice-button-listening" : ""
          }`}
          onClick={handleVoiceInput}
        >
          {isListening ? "🔴 Listening..." : "🎙️ Speak Instead"}
        </button>

        <p className="voice-helper">
          {isListening
            ? "Speak your observation clearly..."
            : "Prefer speaking? Your response will be converted into editable text."}
        </p>

        {!voiceSupported && (
          <p className="voice-warning">
            Voice recognition is not available in this browser. Try Google
            Chrome or Microsoft Edge.
          </p>
        )}

        {voiceError && <p className="voice-error">{voiceError}</p>}
      </div>

      {/* -------------------------------------------- */}
      {/* NAVIGATION */}
      {/* -------------------------------------------- */}

      <div className="grounding-buttons">
        <button
          className="intervention-back-button"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          ← Back
        </button>

        <button
          className="complete-button"
          onClick={handleNext}
          disabled={!answer.trim()}
        >
          {currentStep === steps.length - 1 ? "Finish Exercise" : "Next →"}
        </button>
      </div>

      <div className="audio-control">
        <p className="grounding-helper">Focus on what you notice around you.</p>
      </div>
    </div>
  );
}

export default GroundingActivity;
