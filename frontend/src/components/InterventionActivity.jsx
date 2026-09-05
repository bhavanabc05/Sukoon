import { useEffect, useRef, useState } from "react";
import "../pages/Interventions.css";

function InterventionActivity({ intervention, onComplete }) {
  // Box breathing sequence
  // Inhale -> Hold -> Exhale -> Hold
  const phases = ["Inhale", "Hold", "Exhale", "Hold"];

  const totalCycles = 4;
  const secondsPerPhase = 4;
  const phasesPerCycle = phases.length;

  const secondsPerCycle = secondsPerPhase * phasesPerCycle;

  const totalExerciseSeconds = totalCycles * secondsPerCycle;

  const [stage, setStage] = useState("intro");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const intervalRef = useRef(null);
  const introTimerRef = useRef(null);
  const audioEnabledRef = useRef(true);

  // --------------------------------------------------
  // KEEP AUDIO REF IN SYNC
  // --------------------------------------------------

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  // --------------------------------------------------
  // SPEAK FUNCTION
  // --------------------------------------------------

  const speakNow = (text) => {
    if (!audioEnabledRef.current || !("speechSynthesis" in window)) {
      return;
    }

    // Stop any previous phase announcement
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  // --------------------------------------------------
  // INTRO
  // --------------------------------------------------

  const beginExercise = () => {
    setElapsedSeconds(0);

    // Move to starting screen immediately
    setStage("starting");

    // Clear any previous speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioEnabledRef.current) {
      speakNow(
        "Welcome to Box Breathing. Find a comfortable position and relax your shoulders. We will gently breathe in, hold, breathe out, and hold again. Follow the rhythm at your own comfortable pace. Let's begin.",
      );
    }

    /*
      Give the introduction time to finish before
      starting the 4-second breathing phases.
    */
    introTimerRef.current = setTimeout(() => {
      setStage("exercise");
    }, 9000);
  };

  // --------------------------------------------------
  // CURRENT PHASE
  // --------------------------------------------------

  const phaseIndex =
    Math.floor(elapsedSeconds / secondsPerPhase) % phasesPerCycle;

  const currentPhase = phases[phaseIndex];

  const secondsIntoPhase = elapsedSeconds % secondsPerPhase;

  /*
    0 seconds -> 4
    1 second  -> 3
    2 seconds -> 2
    3 seconds -> 1
  */
  const displayedSeconds = secondsPerPhase - secondsIntoPhase;

  const currentCycle = Math.floor(elapsedSeconds / secondsPerCycle) + 1;

  // --------------------------------------------------
  // EXERCISE TIMER
  // --------------------------------------------------

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

          return totalExerciseSeconds - 1;
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [stage, totalExerciseSeconds]);

  // --------------------------------------------------
  // PHASE AUDIO
  // --------------------------------------------------

  useEffect(() => {
    if (stage !== "exercise" || !audioEnabled) {
      return;
    }

    /*
      Only announce the phase.

      Visual timer handles:
      4 -> 3 -> 2 -> 1

      Audio handles:
      Inhale
      Hold
      Exhale
      Hold

      This avoids the browser speech-synthesis
      problem where individual numbers get cut off.
    */

    if (secondsIntoPhase === 0) {
      speakNow(currentPhase);
    }
  }, [elapsedSeconds, stage, audioEnabled, secondsIntoPhase, currentPhase]);

  // --------------------------------------------------
  // CONCLUSION AUDIO
  // --------------------------------------------------

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
      "Well done. You have completed all four breathing cycles. Take a slow, natural breath and notice how your body feels. You have given yourself a moment to pause and reset. Carry this calm with you as you continue your day.",
    );

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }, [stage, audioEnabled]);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(introTimerRef.current);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --------------------------------------------------
  // AUDIO TOGGLE
  // --------------------------------------------------

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

  // --------------------------------------------------
  // INTRO SCREEN
  // --------------------------------------------------

  if (stage === "intro") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <div className="activity-welcome">
          <div className="welcome-icon">🌿</div>

          <h2>Let's take a moment</h2>

          <p>
            Find a comfortable position, relax your shoulders, and follow the
            guided breathing rhythm.
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

  // --------------------------------------------------
  // STARTING SCREEN
  // --------------------------------------------------

  if (stage === "starting") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <div className="activity-welcome">
          <div className="welcome-icon">🌿</div>

          <h2>Get ready...</h2>

          <p>Settle into a comfortable position.</p>

          <p>Your guided breathing exercise will begin shortly.</p>
        </div>

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // EXERCISE SCREEN
  // --------------------------------------------------

  if (stage === "exercise") {
    return (
      <div className="intervention-activity-card">
        <h1>{intervention.title}</h1>

        <p className="intervention-description">
          Follow the rhythm and breathe at a comfortable pace.
        </p>

        <div className="cycle-info">
          Cycle {currentCycle} of {totalCycles}
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

        <div className="audio-control">
          <button className="audio-button" onClick={toggleAudio}>
            {audioEnabled ? "🔊 Audio Guide: On" : "🔇 Audio Guide: Off"}
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CONCLUSION SCREEN
  // --------------------------------------------------

  if (stage === "conclusion") {
    return (
      <div className="intervention-activity-card">
        <div className="completion-icon">🌿</div>

        <h1>Well done</h1>

        <p className="intervention-description">
          You have completed all four breathing cycles.
        </p>

        <p>Take a moment to notice your breathing and how your body feels.</p>

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

export default InterventionActivity;
