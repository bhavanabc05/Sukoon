import { useEffect, useMemo, useRef, useState } from "react";
import "./ProgressiveMuscleRelaxationActivity.css";

function ProgressiveMuscleRelaxationActivity({ intervention, onComplete }) {
  const stages = useMemo(
    () => [
      {
        id: "intro-breath",
        area: "Getting Started",
        phase: "breathe",
        label: "Settle into your space",
        instruction:
          "Take a slow, comfortable breath in. Notice your chest gently rise, then slowly let the breath go.",
        speech:
          "Take a slow, comfortable breath in. Notice your chest gently rise. Then slowly let the breath go. Allow yourself to settle into a comfortable position.",
      },

      {
        id: "feet-tense",
        area: "Feet",
        phase: "tense",
        label: "Tense your feet",
        instruction:
          "Curl your toes and gently tighten the muscles in your feet. Hold the tension comfortably.",
        speech:
          "Bring your attention down to your feet. Curl your toes and gently tighten the muscles in your feet. Hold that tension comfortably.",
      },
      {
        id: "feet-release",
        area: "Feet",
        phase: "release",
        label: "Release your feet",
        instruction:
          "Let the tension go completely. Notice the feeling of relaxation.",
        speech:
          "And now, let go. Allow your feet to become soft and relaxed. Notice the difference.",
      },

      {
        id: "calves-tense",
        area: "Lower Legs",
        phase: "tense",
        label: "Tense your calves",
        instruction:
          "Gently tighten your calf muscles. Hold the tension without straining.",
        speech:
          "Bring your attention to your lower legs. Gently tighten your calf muscles. Hold the tension without straining.",
      },
      {
        id: "calves-release",
        area: "Lower Legs",
        phase: "release",
        label: "Release your calves",
        instruction:
          "Release the tension and allow your lower legs to become loose.",
        speech:
          "Now release. Let the tension leave your lower legs. Allow your calves to become loose and relaxed.",
      },

      {
        id: "thighs-tense",
        area: "Upper Legs",
        phase: "tense",
        label: "Tense your thighs",
        instruction:
          "Gently squeeze your thighs together. Hold without straining.",
        speech:
          "Move your attention to your upper legs. Gently squeeze your thighs together. Hold the tension, but keep it comfortable.",
      },
      {
        id: "thighs-release",
        area: "Upper Legs",
        phase: "release",
        label: "Release your thighs",
        instruction:
          "Let your thighs soften and notice the tension leaving your muscles.",
        speech:
          "And release. Let your thighs soften. Notice the tension leaving your muscles.",
      },

      {
        id: "torso-tense",
        area: "Stomach & Chest",
        phase: "tense",
        label: "Tense your core",
        instruction:
          "Gently tighten your stomach and chest. Hold the tension comfortably.",
        speech:
          "Now bring your attention to your stomach and chest. Gently tighten these muscles. Hold the tension comfortably.",
      },
      {
        id: "torso-release",
        area: "Stomach & Chest",
        phase: "release",
        label: "Release your core",
        instruction:
          "Let your stomach and chest soften. Allow your torso to relax.",
        speech:
          "And let go. Allow your stomach and chest to soften. Feel your body becoming more comfortable.",
      },

      {
        id: "breathing",
        area: "Breathing",
        phase: "breathe",
        label: "Take a calming breath",
        instruction:
          "Breathe in gently, pause comfortably, and release the breath slowly.",
        speech:
          "Take another slow breath. Breathe in gently. Pause comfortably. Then release the breath slowly. Give yourself a moment to settle.",
      },

      {
        id: "back-tense",
        area: "Back",
        phase: "tense",
        label: "Tense your back",
        instruction:
          "Gently bring your shoulders together behind you. Hold comfortably.",
        speech:
          "Bring your attention to your back. Gently bring your shoulders together behind you. Hold that comfortable tension.",
      },
      {
        id: "back-release",
        area: "Back",
        phase: "release",
        label: "Release your back",
        instruction:
          "Let your shoulders fall naturally and allow your back to relax.",
        speech:
          "Now release. Let your shoulders fall naturally. Allow the muscles in your back to settle and relax.",
      },

      {
        id: "arms-tense",
        area: "Arms & Shoulders",
        phase: "tense",
        label: "Tense your arms",
        instruction:
          "Make gentle fists and tighten your arms toward your shoulders.",
        speech:
          "Move your attention to your arms and shoulders. Make gentle fists and slowly tighten your arms toward your shoulders. Hold.",
      },
      {
        id: "arms-release",
        area: "Arms & Shoulders",
        phase: "release",
        label: "Release your arms",
        instruction:
          "Unclench your hands and let your arms and shoulders become loose.",
        speech:
          "And release. Unclench your hands. Let your arms and shoulders become loose and heavy.",
      },

      {
        id: "face-tense",
        area: "Neck & Face",
        phase: "tense",
        label: "Gently tense your face",
        instruction:
          "Gently tighten the muscles around your eyes, mouth, and neck.",
        speech:
          "Bring your attention to your neck and face. Gently tighten the muscles around your eyes, mouth, and neck. Keep the tension comfortable.",
      },
      {
        id: "face-release",
        area: "Neck & Face",
        phase: "release",
        label: "Release your face",
        instruction: "Let your jaw, face, and neck soften completely.",
        speech:
          "And release. Let your jaw soften. Allow your face and neck to become completely relaxed.",
      },

      {
        id: "whole-body-tense",
        area: "Whole Body",
        phase: "tense",
        label: "Tense your whole body",
        instruction:
          "Gently bring your whole body into tension without straining.",
        speech:
          "For the final tension, gently bring your whole body into tension. Your feet, legs, stomach, chest, arms, shoulders, neck, and face. Hold gently. Do not strain.",
      },
      {
        id: "whole-body-release",
        area: "Whole Body",
        phase: "release",
        label: "Let everything go",
        instruction:
          "Release everything. Allow your whole body to become soft and relaxed.",
        speech:
          "And now, let everything go. Allow your whole body to become soft and relaxed. Notice the difference between holding tension and letting it go.",
      },

      {
        id: "finish",
        area: "Finishing",
        phase: "finish",
        label: "Return gently",
        instruction:
          "Move your arms and legs gently. Stretch if you would like, and open your eyes when you are ready.",
        speech:
          "Take your time returning to the room. Slowly move your arms and legs. Stretch gently if you would like. When you feel ready, open your eyes.",
      },
    ],
    [],
  );

  const [stage, setStage] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const audioEnabledRef = useRef(true);
  const speechStartedRef = useRef(false);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  /*
   * Speak one stage.
   *
   * IMPORTANT:
   * The next stage is NOT started by a timer.
   * It starts when this utterance finishes.
   *
   * This keeps the visible instruction and voice synchronized.
   */
  const speakStage = (stageData, index) => {
    if (!audioEnabledRef.current || !("speechSynthesis" in window)) {
      setIsSpeaking(false);

      setTimeout(() => {
        if (index < stages.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          setStage("conclusion");
        }
      }, 1200);

      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(stageData.speech);

    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      /*
       * Small pause after the spoken instruction.
       * This gives the user a moment before the next instruction.
       */
      setTimeout(() => {
        if (index < stages.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          setStage("conclusion");
        }
      }, 1200);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);

      setTimeout(() => {
        if (index < stages.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          setStage("conclusion");
        }
      }, 1000);
    };

    speechStartedRef.current = true;

    window.speechSynthesis.speak(utterance);
  };

  /*
   * Start the actual exercise.
   */
  useEffect(() => {
    if (stage !== "exercise") {
      return;
    }

    const current = stages[currentIndex];

    if (!current) {
      return;
    }

    speakStage(current, currentIndex);

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stage, currentIndex, stages]);

  /*
   * Completion audio.
   */
  useEffect(() => {
    if (stage !== "conclusion") {
      return;
    }

    if (!audioEnabled || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      "You have completed the progressive muscle relaxation exercise. Take a quiet moment to notice how your body feels now. Move gently and continue when you feel ready.",
    );

    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }, [stage, audioEnabled]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const beginExercise = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    speechStartedRef.current = false;
    setCurrentIndex(0);
    setStage("exercise");
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(false);
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
    }
  };

  const currentStage = stages[currentIndex];

  /*
   * INTRO
   */
  if (stage === "intro") {
    return (
      <div className="pmr-card">
        <div className="pmr-intro-icon">🧘</div>

        <span className="pmr-eyebrow">GUIDED RELAXATION</span>

        <h1>{intervention.title}</h1>

        <p className="pmr-intro-subtitle">
          A gentle guided exercise to help you notice tension and release it,
          one area at a time.
        </p>

        <div className="pmr-info-grid">
          <div>
            <span>🧘</span>
            <strong>Full body</strong>
            <small>guided sequence</small>
          </div>

          <div>
            <span>🗣️</span>
            <strong>Voice guided</strong>
            <small>one step at a time</small>
          </div>

          <div>
            <span>🌿</span>
            <strong>Gentle pace</strong>
            <small>follow your body</small>
          </div>
        </div>

        <div className="pmr-safety-box">
          <strong>Before you begin</strong>

          <p>
            Find a comfortable position. Gently tense each area without causing
            pain or strain. Skip any area that feels uncomfortable or injured.
          </p>
        </div>

        <button className="pmr-primary-button" onClick={beginExercise}>
          Begin Relaxation
          <span>→</span>
        </button>

        <button className="pmr-audio-button" onClick={toggleAudio}>
          {audioEnabled ? "🔊 Audio guidance on" : "🔇 Audio guidance off"}
        </button>
      </div>
    );
  }

  /*
   * EXERCISE
   */
  if (stage === "exercise") {
    const progress = ((currentIndex + 1) / stages.length) * 100;

    return (
      <div className="pmr-card pmr-exercise-card">
        <div className="pmr-exercise-header">
          <div>
            <span className="pmr-eyebrow">PROGRESSIVE RELAXATION</span>

            <h1>{currentStage.label}</h1>
          </div>

          <div className="pmr-step-counter">
            {currentIndex + 1}/{stages.length}
          </div>
        </div>

        <div className="pmr-progress-track">
          <div
            className="pmr-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="pmr-area-badge">{currentStage.area}</div>

        <div className="pmr-simple-visual">
          <div className={`pmr-circle ${currentStage.phase}`}>
            {currentStage.phase === "tense" && "Tense"}
            {currentStage.phase === "release" && "Release"}
            {currentStage.phase === "breathe" && "Breathe"}
            {currentStage.phase === "finish" && "Rest"}
          </div>
        </div>

        <div className={`pmr-phase ${currentStage.phase}`}>
          {isSpeaking
            ? "LISTEN"
            : currentStage.phase === "tense"
              ? "TENSE GENTLY"
              : currentStage.phase === "release"
                ? "RELEASE"
                : currentStage.phase === "breathe"
                  ? "BREATHE"
                  : "RETURN GENTLY"}
        </div>

        <p className="pmr-instruction">{currentStage.instruction}</p>

        <div className="pmr-sync-message">
          {isSpeaking
            ? "🔊 Follow the voice"
            : "Take a moment before continuing"}
        </div>

        <div className="pmr-bottom-row">
          <button className="pmr-audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio on" : "🔇 Audio off"}
          </button>

          <span className="pmr-time-text">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>
    );
  }

  /*
   * CONCLUSION
   */
  if (stage === "conclusion") {
    return (
      <div className="pmr-card pmr-completion-card">
        <div className="pmr-completion-icon">🌿</div>

        <span className="pmr-eyebrow">SESSION COMPLETE</span>

        <h1>You've made space to relax</h1>

        <p className="pmr-completion-subtitle">
          Take a quiet moment before returning to whatever comes next.
        </p>

        <div className="pmr-reflection-box">
          <strong>Notice the difference</strong>

          <p>
            How does your body feel now compared with when you started? There is
            no right answer — simply notice.
          </p>
        </div>

        <p className="pmr-return-text">
          Move your arms and legs gently. Stretch if you would like, and
          continue when you feel ready.
        </p>

        <button className="pmr-primary-button" onClick={onComplete}>
          Complete Intervention
          <span>✓</span>
        </button>

        <button className="pmr-audio-button" onClick={toggleAudio}>
          {audioEnabled ? "🔊 Audio guidance on" : "🔇 Audio guidance off"}
        </button>
      </div>
    );
  }

  return null;
}

export default ProgressiveMuscleRelaxationActivity;
