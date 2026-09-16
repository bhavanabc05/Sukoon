import { useState } from "react";
import EmotionWheel from "./EmotionWheel";
import { apiFetch } from "../utils/api";
import "./GuidedReflectionActivity.css";

const emotions = [
  { id: "sad", label: "Sad", icon: "😔" },
  { id: "angry", label: "Angry", icon: "😠" },
  { id: "anxious", label: "Anxious", icon: "😨" },
  { id: "happy", label: "Happy", icon: "😊" },
  { id: "calm", label: "Calm", icon: "😌" },
  { id: "overwhelmed", label: "Overwhelmed", icon: "🌊" },
  { id: "confused", label: "Confused", icon: "😕" },
  { id: "tired", label: "Tired", icon: "😴" },
];

const contexts = [
  { id: "work", label: "Work / Studies", icon: "📚" },
  { id: "relationships", label: "Relationships", icon: "🤝" },
  { id: "self", label: "Myself", icon: "🌱" },
  { id: "responsibilities", label: "Responsibilities", icon: "🧩" },
  { id: "health", label: "Health / Wellbeing", icon: "🌿" },
  { id: "unclear", label: "I'm not sure", icon: "🌫️" },
];

const needs = [
  { id: "calm", label: "To feel calmer", icon: "🌿" },
  { id: "space", label: "Some space", icon: "🕊️" },
  { id: "support", label: "Support", icon: "🤍" },
  { id: "rest", label: "Rest", icon: "🌙" },
  { id: "clarity", label: "Clarity", icon: "💡" },
  { id: "connection", label: "Connection", icon: "💬" },
];

const getActions = (emotion, context, need, intensity) => {
  const actions = [];

  if (need === "calm") {
    actions.push(
      {
        id: "quiet-pause",
        title: "Take a quiet pause",
        description:
          "Step away from the situation for a few minutes and take some slow breaths.",
        icon: "🌿",
      },
      {
        id: "release-tension",
        title: "Release some tension",
        description:
          "Relax your shoulders, unclench your jaw, and allow your body to soften.",
        icon: "🫶",
      },
    );
  }

  if (need === "space") {
    actions.push(
      {
        id: "create-distance",
        title: "Give yourself some distance",
        description:
          "If possible, step away from the situation before deciding what to do next.",
        icon: "🕊️",
      },
      {
        id: "quiet-moment",
        title: "Protect a quiet moment",
        description:
          "Put notifications aside and give yourself a few minutes without another demand.",
        icon: "🌙",
      },
    );
  }

  if (need === "support") {
    actions.push(
      {
        id: "reach-out",
        title: "Reach out to someone safe",
        description:
          "Send a simple message to someone you trust. You don't need to explain everything.",
        icon: "🤍",
      },
      {
        id: "allow-support",
        title: "Let yourself be supported",
        description:
          "Think of someone who helps you feel understood and consider reaching out.",
        icon: "🫂",
      },
    );
  }

  if (need === "rest") {
    actions.push(
      {
        id: "real-break",
        title: "Take a genuine break",
        description:
          "Give yourself permission to pause instead of immediately moving to the next task.",
        icon: "🌙",
      },
      {
        id: "gentle-activity",
        title: "Do one gentle thing",
        description:
          "Choose something simple and restorative, such as water, music, or a short walk.",
        icon: "🌱",
      },
    );
  }

  if (need === "clarity") {
    actions.push(
      {
        id: "write-it-down",
        title: "Put the situation into words",
        description:
          "Write down what happened, what you feel, and what you can actually control.",
        icon: "📝",
      },
      {
        id: "next-step",
        title: "Focus on the next step",
        description:
          "You don't need to solve everything now. Identify one thing you can do next.",
        icon: "🧭",
      },
    );
  }

  if (need === "connection") {
    actions.push(
      {
        id: "connect",
        title: "Connect with someone",
        description:
          "Have a small conversation with someone you feel comfortable being yourself around.",
        icon: "💬",
      },
      {
        id: "share-honestly",
        title: "Share honestly",
        description:
          "If it feels safe, tell someone that you're having a difficult moment and could use some company.",
        icon: "🤝",
      },
    );
  }

  if (context === "work" && intensity >= 7) {
    actions.push({
      id: "step-away-work",
      title: "Step away from the task",
      description:
        "If possible, take a short break before returning to work or studies.",
      icon: "☕",
    });
  }

  if (context === "relationships") {
    actions.push({
      id: "pause-response",
      title: "Pause before responding",
      description:
        "Give yourself time to understand what you feel before having a difficult conversation.",
      icon: "💭",
    });
  }

  if (emotion === "sad") {
    actions.push({
      id: "self-kindness",
      title: "Be gentle with yourself",
      description:
        "Try speaking to yourself with the same patience you would offer someone you care about.",
      icon: "🤍",
    });
  }

  if (emotion === "angry") {
    actions.push({
      id: "cooling-space",
      title: "Give yourself time to cool down",
      description:
        "Create some distance from the situation before choosing how you want to respond.",
      icon: "🌬️",
    });
  }

  if (emotion === "anxious") {
    actions.push({
      id: "grounding-pause",
      title: "Come back to the present",
      description:
        "Notice a few things around you and bring your attention back to what is happening right now.",
      icon: "🌿",
    });
  }

  if (emotion === "overwhelmed") {
    actions.push({
      id: "one-thing",
      title: "Choose just one thing",
      description:
        "Set everything else aside temporarily and focus only on the next manageable task.",
      icon: "🧩",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "gentle-pause",
      title: "Take a gentle pause",
      description:
        "Give yourself a few quiet minutes before deciding what you need next.",
      icon: "🌿",
    });
  }

  return actions.slice(0, 3);
};

function GuidedReflectionActivity({ intervention, onComplete }) {
  const [stage, setStage] = useState("emotion");

  const [emotion, setEmotion] = useState("");

  const [emotionalState, setEmotionalState] = useState({
    primaryEmotion: "",
    secondaryEmotion: "",
    specificEmotion: "",
    intensity: 5,
  });

  const [useGranularity, setUseGranularity] = useState(false);

  const [context, setContext] = useState("");
  const [identifiedNeed, setIdentifiedNeed] = useState("");
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [freeReflection, setFreeReflection] = useState("");

  const [saving, setSaving] = useState(false);

  const selectedEmotion =
    emotions.find((item) => item.id === emotion)?.label || "";

  const emotionIsReady = useGranularity
    ? Boolean(
        emotionalState.primaryEmotion &&
        emotionalState.secondaryEmotion &&
        emotionalState.specificEmotion,
      )
    : Boolean(emotion);

  const handleGranularityChange = (selection) => {
    setEmotionalState((previous) => ({
      ...previous,
      primaryEmotion: selection.primaryEmotion,
      secondaryEmotion: selection.secondaryEmotion,
      specificEmotion: selection.specificEmotion,
    }));
  };

  const continueFromEmotion = () => {
    if (!emotionIsReady) {
      return;
    }

    if (!useGranularity) {
      setEmotionalState((previous) => ({
        ...previous,
        primaryEmotion: emotion.toLowerCase(),
        secondaryEmotion: emotion.toLowerCase(),
        specificEmotion: emotion.toLowerCase(),
      }));
    }

    setStage("intensity");
  };

  const continueFromIntensity = () => {
    setStage("context");
  };

  const continueFromContext = () => {
    if (!context) {
      return;
    }

    setStage("need");
  };

  const continueFromNeed = () => {
    if (!identifiedNeed) {
      return;
    }

    const actionEmotion =
      emotionalState.specificEmotion || emotion.toLowerCase();

    const generatedActions = getActions(
      actionEmotion,
      context,
      identifiedNeed,
      emotionalState.intensity,
    );

    setActions(generatedActions);
    setStage("action");
  };

  const continueFromAction = () => {
    if (!selectedAction) {
      return;
    }

    setStage("reflection");
  };

  const saveReflection = async () => {
    if (!selectedAction || saving) {
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch("/api/guided-reflections", {
        method: "POST",
        body: JSON.stringify({
          interventionId: intervention._id,
          emotionalState,
          context,
          identifiedNeed,
          selectedAction,
          freeReflection,
        }),
      });

      if (!response) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || "Unable to save guided reflection.",
        );
      }

      setStage("complete");
    } catch (error) {
      console.error("Guided reflection save error:", error);

      alert(
        error.message || "Something went wrong while saving your reflection.",
      );
    } finally {
      setSaving(false);
    }
  };

  const completeIntervention = () => {
    onComplete(intervention);
  };

  const goBack = () => {
    const previousStages = {
      intensity: "emotion",
      context: "intensity",
      need: "context",
      action: "need",
      reflection: "action",
    };

    const previousStage = previousStages[stage];

    if (previousStage) {
      setStage(previousStage);
    }
  };

  const renderEmotionStage = () => (
    <div className="guided-reflection-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">🌿</span>

        <h2>How are you feeling right now?</h2>

        <p>
          There is no need to find the perfect word. Choose the feeling that
          feels closest to your experience.
        </p>
      </div>

      <div className="guided-reflection-emotion-grid">
        {emotions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`guided-reflection-emotion ${
              emotion === item.id && !useGranularity ? "selected" : ""
            }`}
            onClick={() => {
              setEmotion(item.id);
              setUseGranularity(false);
            }}
          >
            <span>{item.icon}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className="guided-reflection-deeper-option">
        <button
          type="button"
          className={`deeper-emotion-button ${
            useGranularity ? "selected" : ""
          }`}
          onClick={() => setUseGranularity(true)}
        >
          Explore the feeling more deeply →
        </button>

        <p>
          You can use Sukoon's emotion wheel if you want to find a more specific
          word.
        </p>
      </div>

      {useGranularity && (
        <div className="guided-reflection-wheel-wrapper">
          <EmotionWheel onSelectionChange={handleGranularityChange} />
        </div>
      )}

      {emotionIsReady && (
        <div className="selected-emotion-card">
          <span>You're noticing</span>

          <strong>
            {useGranularity ? emotionalState.specificEmotion : selectedEmotion}
          </strong>

          {useGranularity && (
            <p>
              {emotionalState.primaryEmotion} →{" "}
              {emotionalState.secondaryEmotion} →{" "}
              {emotionalState.specificEmotion}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        className="guided-reflection-primary-button"
        disabled={!emotionIsReady}
        onClick={continueFromEmotion}
      >
        Continue →
      </button>
    </div>
  );

  const renderIntensityStage = () => (
    <div className="guided-reflection-stage compact-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">🌡️</span>

        <h2>How strongly do you feel it?</h2>

        <p>
          Choose the number that feels closest to your experience right now.
        </p>
      </div>

      <div className="intensity-value">{emotionalState.intensity}</div>

      <input
        type="range"
        min="1"
        max="10"
        value={emotionalState.intensity}
        onChange={(event) =>
          setEmotionalState((previous) => ({
            ...previous,
            intensity: Number(event.target.value),
          }))
        }
        className="guided-reflection-range"
      />

      <div className="intensity-labels">
        <span>Very mild</span>
        <span>Very strong</span>
      </div>

      <button
        type="button"
        className="guided-reflection-primary-button"
        onClick={continueFromIntensity}
      >
        Continue →
      </button>
    </div>
  );

  const renderContextStage = () => (
    <div className="guided-reflection-stage compact-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">🔎</span>

        <h2>What does this feel connected to?</h2>

        <p>
          You don't need to know exactly why. Choose the area that feels
          closest.
        </p>
      </div>

      <div className="guided-reflection-option-grid">
        {contexts.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`guided-reflection-option ${
              context === item.id ? "selected" : ""
            }`}
            onClick={() => setContext(item.id)}
          >
            <span className="option-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="guided-reflection-primary-button"
        disabled={!context}
        onClick={continueFromContext}
      >
        Continue →
      </button>
    </div>
  );

  const renderNeedStage = () => (
    <div className="guided-reflection-stage compact-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">🤍</span>

        <h2>What do you need right now?</h2>

        <p>
          Instead of asking what you should do, start with what would actually
          support you.
        </p>
      </div>

      <div className="guided-reflection-option-grid">
        {needs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`guided-reflection-option ${
              identifiedNeed === item.id ? "selected" : ""
            }`}
            onClick={() => setIdentifiedNeed(item.id)}
          >
            <span className="option-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="guided-reflection-primary-button"
        disabled={!identifiedNeed}
        onClick={continueFromNeed}
      >
        Show me some options →
      </button>
    </div>
  );

  const renderActionStage = () => (
    <div className="guided-reflection-stage compact-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">🌱</span>

        <h2>What feels possible for you?</h2>

        <p>
          Based on what you shared, here are a few small options. Choose the one
          that feels most realistic right now.
        </p>
      </div>

      <div className="guided-reflection-action-list">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`guided-reflection-action ${
              selectedAction === action.title ? "selected" : ""
            }`}
            onClick={() => setSelectedAction(action.title)}
          >
            <span className="action-icon">{action.icon}</span>

            <span className="action-content">
              <strong>{action.title}</strong>
              <small>{action.description}</small>
            </span>

            <span className="action-check">
              {selectedAction === action.title ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="guided-reflection-primary-button"
        disabled={!selectedAction}
        onClick={continueFromAction}
      >
        Continue →
      </button>
    </div>
  );

  const renderReflectionStage = () => (
    <div className="guided-reflection-stage compact-stage">
      <div className="guided-reflection-intro">
        <span className="guided-reflection-icon">💭</span>

        <h2>Anything you'd like to put into words?</h2>

        <p>
          This is completely optional. Leave a thought here if there is
          something you want to remember.
        </p>
      </div>

      <textarea
        value={freeReflection}
        onChange={(event) => setFreeReflection(event.target.value)}
        placeholder="Write anything that feels worth remembering..."
        rows={7}
        className="guided-reflection-textarea"
      />

      <button
        type="button"
        className="guided-reflection-primary-button"
        disabled={saving}
        onClick={saveReflection}
      >
        {saving ? "Saving..." : "Finish reflection →"}
      </button>
    </div>
  );

  const renderCompleteStage = () => {
    const contextLabel =
      contexts.find((item) => item.id === context)?.label || context;

    const needLabel =
      needs.find((item) => item.id === identifiedNeed)?.label || identifiedNeed;

    const emotionLabel = useGranularity
      ? emotionalState.specificEmotion
      : selectedEmotion;

    return (
      <div className="guided-reflection-complete">
        <div className="completion-icon">🌱</div>

        <h2>You made space for yourself.</h2>

        <p className="completion-message">
          You noticed <strong>{emotionLabel}</strong> at an intensity of{" "}
          <strong>{emotionalState.intensity}/10</strong>.
        </p>

        <div className="reflection-summary">
          <div>
            <span>Connected to</span>
            <strong>{contextLabel}</strong>
          </div>

          <div>
            <span>You needed</span>
            <strong>{needLabel}</strong>
          </div>

          <div>
            <span>Your small step</span>
            <strong>{selectedAction}</strong>
          </div>
        </div>

        <p className="completion-closing">
          You don't have to solve everything at once. Noticing what you feel and
          choosing one supportive step can be enough for this moment.
        </p>

        <button
          type="button"
          className="guided-reflection-complete-button"
          onClick={completeIntervention}
        >
          Complete Reflection ✓
        </button>
      </div>
    );
  };

  const stages = [
    "emotion",
    "intensity",
    "context",
    "need",
    "action",
    "reflection",
  ];

  const currentStageIndex = stages.indexOf(stage);

  return (
    <div className="guided-reflection-page">
      <div className="guided-reflection-card">
        {stage !== "complete" && (
          <>
            <div className="guided-reflection-header">
              <span className="guided-reflection-type">Guided Reflection</span>

              <span className="guided-reflection-progress-text">
                Step {currentStageIndex + 1} of {stages.length}
              </span>
            </div>

            <div className="guided-reflection-progress">
              {stages.map((item, index) => (
                <div
                  key={item}
                  className={`guided-reflection-progress-segment ${
                    index <= currentStageIndex ? "active" : ""
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {stage === "emotion" && renderEmotionStage()}

        {stage === "intensity" && renderIntensityStage()}

        {stage === "context" && renderContextStage()}

        {stage === "need" && renderNeedStage()}

        {stage === "action" && renderActionStage()}

        {stage === "reflection" && renderReflectionStage()}

        {stage === "complete" && renderCompleteStage()}

        {stage !== "emotion" && stage !== "complete" && (
          <button
            type="button"
            className="guided-reflection-back-button"
            onClick={goBack}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default GuidedReflectionActivity;
