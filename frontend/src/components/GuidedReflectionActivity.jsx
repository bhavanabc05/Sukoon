import { useState } from "react";
import "./GuidedReflectionActivity.css";

const steps = [
  {
    number: 1,
    title: "Pause & notice",
    subtitle: "Take a moment to check in with yourself.",
  },
  {
    number: 2,
    title: "Name what you're feeling",
    subtitle: "What emotion feels most noticeable right now?",
  },
  {
    number: 3,
    title: "Explore the feeling",
    subtitle: "What might have contributed to this feeling?",
  },
  {
    number: 4,
    title: "Identify what you need",
    subtitle: "What would support you in this moment?",
  },
  {
    number: 5,
    title: "Choose one small step",
    subtitle: "What is one kind thing you can do for yourself?",
  },
];

function GuidedReflectionActivity({ intervention, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [reflection, setReflection] = useState({
    noticed: "",
    emotion: "",
    trigger: "",
    need: "",
    action: "",
  });

  const updateReflection = (field, value) => {
    setReflection((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);
    }
  };

  const handleComplete = () => {
    onComplete(intervention);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="reflection-step">
            <div className="reflection-icon">🌿</div>

            <h2>Pause for a moment</h2>

            <p className="reflection-prompt">
              Take a slow breath and notice what is happening inside you. There
              is nothing you need to fix right now.
            </p>

            <textarea
              value={reflection.noticed}
              onChange={(e) => updateReflection("noticed", e.target.value)}
              placeholder="What are you noticing about yourself right now?"
              rows={5}
            />
          </div>
        );

      case 2:
        return (
          <div className="reflection-step">
            <div className="reflection-icon">💭</div>

            <h2>Name the feeling</h2>

            <p className="reflection-prompt">
              If you had to put a word to what you're feeling right now, what
              would it be?
            </p>

            <div className="emotion-options">
              {[
                "Calm",
                "Happy",
                "Sad",
                "Anxious",
                "Angry",
                "Overwhelmed",
                "Lonely",
                "Tired",
                "Confused",
              ].map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  className={`emotion-option ${
                    reflection.emotion === emotion ? "selected" : ""
                  }`}
                  onClick={() => updateReflection("emotion", emotion)}
                >
                  {emotion}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={
                [
                  "Calm",
                  "Happy",
                  "Sad",
                  "Anxious",
                  "Angry",
                  "Overwhelmed",
                  "Lonely",
                  "Tired",
                  "Confused",
                ].includes(reflection.emotion)
                  ? ""
                  : reflection.emotion
              }
              onChange={(e) => updateReflection("emotion", e.target.value)}
              placeholder="Or describe it in your own words..."
              className="reflection-input"
            />
          </div>
        );

      case 3:
        return (
          <div className="reflection-step">
            <div className="reflection-icon">🔎</div>

            <h2>Explore the feeling</h2>

            <p className="reflection-prompt">
              Think gently about what may have contributed to how you're
              feeling. You don't need to find a perfect explanation.
            </p>

            <textarea
              value={reflection.trigger}
              onChange={(e) => updateReflection("trigger", e.target.value)}
              placeholder="What happened, changed, or came to mind?"
              rows={6}
            />
          </div>
        );

      case 4:
        return (
          <div className="reflection-step">
            <div className="reflection-icon">🤍</div>

            <h2>What do you need right now?</h2>

            <p className="reflection-prompt">
              Choose whatever feels most supportive in this moment.
            </p>

            <div className="need-options">
              {[
                "Rest",
                "Reassurance",
                "Some space",
                "Connection",
                "A break",
                "To be heard",
                "Something else",
              ].map((need) => (
                <button
                  key={need}
                  type="button"
                  className={`need-option ${
                    reflection.need === need ? "selected" : ""
                  }`}
                  onClick={() => updateReflection("need", need)}
                >
                  {need}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="reflection-step">
            <div className="reflection-icon">🌱</div>

            <h2>Choose one small step</h2>

            <p className="reflection-prompt">
              What is one small, realistic thing you can do to support yourself
              after this reflection?
            </p>

            <textarea
              value={reflection.action}
              onChange={(e) => updateReflection("action", e.target.value)}
              placeholder="For example: take a 10-minute break, call someone I trust, drink some water..."
              rows={5}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="guided-reflection-page">
      <div className="guided-reflection-card">
        <div className="reflection-header">
          <span className="reflection-type">Guided Reflection</span>

          <span className="reflection-progress-text">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        <div className="reflection-progress">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`progress-segment ${
                step.number <= currentStep ? "active" : ""
              }`}
            />
          ))}
        </div>

        <div className="reflection-step-info">
          <span>Step {currentStep}</span>
          <h1>{steps[currentStep - 1].title}</h1>
          <p>{steps[currentStep - 1].subtitle}</p>
        </div>

        {renderStep()}

        <div className="reflection-navigation">
          {currentStep > 1 ? (
            <button
              type="button"
              className="reflection-back-button"
              onClick={previousStep}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              className="reflection-next-button"
              onClick={nextStep}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="reflection-complete-button"
              onClick={handleComplete}
            >
              Complete Reflection ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuidedReflectionActivity;
