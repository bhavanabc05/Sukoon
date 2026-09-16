import { useEffect, useRef, useState } from "react";
import "../pages/Interventions.css";

function MindfulBreathingActivity({ intervention, onComplete }) {
  const totalCycles = 5;
  const inhaleSeconds = 4;
  const exhaleSeconds = 6;

  const secondsPerCycle = inhaleSeconds + exhaleSeconds;

  const totalExerciseSeconds = totalCycles * secondsPerCycle;

  const [stage, setStage] = useState("intro");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const intervalRef = useRef(null);
  const introTimerRef = useRef(null);
  const audioEnabledRef = useRef(true);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const speakNow = (text) => {
    if (!audioEnabledRef.current || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const beginExercise = () => {
    setElapsedSeconds(0);
    setStage("starting");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioEnabledRef.current) {
      speakNow(
        "Welcome to Mindful Breathing. Find a comfortable position and relax your shoulders. There is no need to force your breath. We will gently breathe in for four seconds and breathe out for six seconds. Bring your attention to the feeling of each breath. Let's begin.",
      );
    }

    introTimerRef.current = setTimeout(() => {
      setStage("exercise");
    }, 9000);
  };

  /*
   * Calculate the current phase entirely from elapsed time.
   * This makes elapsedSeconds the single source of truth.
   */

  const cycleNumber = Math.floor(elapsedSeconds / secondsPerCycle) + 1;

  const secondsIntoCycle = elapsedSeconds % secondsPerCycle;

  const currentPhase = secondsIntoCycle < inhaleSeconds ? "Inhale" : "Exhale";

  const secondsIntoPhase =
    currentPhase === "Inhale"
      ? secondsIntoCycle
      : secondsIntoCycle - inhaleSeconds;

  const phaseDuration =
    currentPhase === "Inhale" ? inhaleSeconds : exhaleSeconds;

  const displayedSeconds = phaseDuration - secondsIntoPhase;

  /*
   * Exercise timer
   */

  useEffect(() => {
    if (stage !== "exercise") {
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((previous) => {
        const next = previous + 1;

        if (next >= totalExerciseSeconds) {
          clearInterval(intervalRef.current);

          setStage("conclusion");

          return totalExerciseSeconds;
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [stage, totalExerciseSeconds]);

  /*
   * Audio follows the same elapsed-time calculation
   * as the visual phase.
   */

  useEffect(() => {
    if (stage !== "exercise" || !audioEnabled) {
      return;
    }

    if (secondsIntoPhase === 0) {
      if (currentPhase === "Inhale") {
        speakNow("Breathe in gently.");
      } else {
        speakNow("Breathe out slowly.");
      }
    }
  }, [elapsedSeconds, stage, audioEnabled, secondsIntoPhase, currentPhase]);

  /*
   * Completion audio
   */

  useEffect(() => {
    if (stage !== "conclusion") {
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (!audioEnabled) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "Well done. You have completed all five mindful breathing cycles. Let your breathing return to its natural rhythm. Notice how your body feels now. You have given yourself a moment to pause and reset. Carry this awareness with you as you continue your day.",
    );

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }, [stage, audioEnabled]);

  /*
   * Cleanup
   */

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(introTimerRef.current);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioEnabled) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
    }
  };

  /*
   * INTRO
   */

  if (stage === "intro") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <div className="activity-welcome">
          <div className="welcome-icon">🌿</div>

          <h2>Come back to your breath</h2>

          <p>
            Take a few quiet moments to notice your breathing without trying to
            change it.
          </p>

          <p>
            You will gently breathe in and slowly breathe out while keeping your
            attention on the present moment.
          </p>
        </div>

        <button className="complete-button" onClick={beginExercise}>
          ▶ Begin Exercise
        </button>

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * STARTING
   */

  if (stage === "starting") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <div className="activity-welcome">
          <div className="welcome-icon">🌿</div>

          <h2>Get comfortable...</h2>

          <p>Relax your shoulders and let your breathing settle naturally.</p>

          <p>Your mindful breathing exercise will begin shortly.</p>
        </div>

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * EXERCISE
   */

  if (stage === "exercise") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <p className="intervention-description">
          Notice the movement and sensation of each breath.
        </p>

        <div className="cycle-info">
          Cycle {cycleNumber} of {totalCycles}
        </div>

        <div className="breathing-area">
          <div className={`breathing-circle ${currentPhase.toLowerCase()}`}>
            <div className="breathing-content">
              <div className="breathing-phase">{currentPhase}</div>

              <div className="breathing-timer">{displayedSeconds}</div>
            </div>
          </div>
        </div>

        <p className="breathing-count-text">
          {currentPhase}: {displayedSeconds} seconds
        </p>

        <p className="grounding-helper">
          Notice the air moving in and out. There is nothing you need to force.
        </p>

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * CONCLUSION
   */

  if (stage === "conclusion") {
    return (
      <div className="intervention-activity-card">
        <div className="completion-icon">🌿</div>

        <h1>Mindful breathing complete</h1>

        <p className="intervention-description">
          You completed all five breathing cycles.
        </p>

        <p>
          Let your breathing return to its natural rhythm. Take a moment to
          notice how your body feels.
        </p>

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>

        <button className="complete-button" onClick={onComplete}>
          Complete Intervention
        </button>
      </div>
    );
  }

  return null;
}

export default MindfulBreathingActivity;
