import { useState } from "react";
import "./SomaticBodyMap.css";

const BODY_AREAS = [
  {
    id: "head",
    label: "Head",
    description: "Head, forehead or face",
  },
  {
    id: "shoulders",
    label: "Shoulders",
    description: "Shoulders and upper shoulder area",
  },
  {
    id: "chest",
    label: "Chest",
    description: "Chest or upper torso",
  },
  {
    id: "stomach",
    label: "Stomach",
    description: "Stomach or abdominal area",
  },
  {
    id: "left-arm",
    label: "Left Arm",
    description: "Left arm",
  },
  {
    id: "right-arm",
    label: "Right Arm",
    description: "Right arm",
  },
  {
    id: "left-leg",
    label: "Left Leg",
    description: "Left leg",
  },
  {
    id: "right-leg",
    label: "Right Leg",
    description: "Right leg",
  },
];

const SENSATIONS = [
  "Tension",
  "Tightness",
  "Heaviness",
  "Pressure",
  "Pain",
  "Restlessness",
  "Tingling",
  "Numbness",
  "Warmth",
  "Other",
];

function SomaticBodyMap({ onChange }) {
  const [selectedAreas, setSelectedAreas] = useState({});

  const notifyParent = (updated) => {
    if (onChange) {
      onChange(Object.values(updated));
    }
  };

  const toggleArea = (area) => {
    setSelectedAreas((previous) => {
      const updated = { ...previous };

      if (updated[area.id]) {
        delete updated[area.id];
      } else {
        updated[area.id] = {
          bodyArea: area.id,
          stressLevel: 5,
          sensation: "Tension",
        };
      }

      notifyParent(updated);

      return updated;
    });
  };

  const updateArea = (areaId, changes) => {
    setSelectedAreas((previous) => {
      const updated = {
        ...previous,
        [areaId]: {
          ...previous[areaId],
          ...changes,
        },
      };

      notifyParent(updated);

      return updated;
    });
  };

  const removeArea = (areaId) => {
    setSelectedAreas((previous) => {
      const updated = { ...previous };
      delete updated[areaId];

      notifyParent(updated);

      return updated;
    });
  };

  const isSelected = (areaId) => Boolean(selectedAreas[areaId]);

  const getAreaData = (areaId) => BODY_AREAS.find((area) => area.id === areaId);

  return (
    <div className="somatic-map-container">
      <div className="somatic-map-layout">
        {/* BODY MAP */}

        <div className="body-map-column">
          <div className="body-map-card">
            <div className="body-map-instruction">
              <span className="instruction-dot" />

              <span>Click a body area to mark where you feel stress.</span>
            </div>

            <div className="body-map-wrapper">
              <svg
                viewBox="0 0 360 650"
                className="somatic-body-map"
                role="img"
                aria-label="Interactive somatic stress body map"
              >
                {/* Head */}

                <g
                  className={`body-region ${
                    isSelected("head") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("head"))}
                >
                  <circle cx="180" cy="72" r="42" />

                  <text x="180" y="78" textAnchor="middle">
                    Head
                  </text>
                </g>

                {/* Neck */}

                <rect
                  x="160"
                  y="110"
                  width="40"
                  height="35"
                  rx="12"
                  className="body-neutral"
                />

                {/* Shoulders */}

                <g
                  className={`body-region ${
                    isSelected("shoulders") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("shoulders"))}
                >
                  <path d="M90 145 Q180 125 270 145 L255 215 Q180 230 105 215 Z" />

                  <text x="180" y="180" textAnchor="middle">
                    Shoulders
                  </text>
                </g>

                {/* Chest */}

                <g
                  className={`body-region ${
                    isSelected("chest") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("chest"))}
                >
                  <path d="M108 210 Q180 195 252 210 L245 310 Q180 325 115 310 Z" />

                  <text x="180" y="265" textAnchor="middle">
                    Chest
                  </text>
                </g>

                {/* Stomach */}

                <g
                  className={`body-region ${
                    isSelected("stomach") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("stomach"))}
                >
                  <path d="M115 308 Q180 320 245 308 L238 405 Q180 420 122 405 Z" />

                  <text x="180" y="365" textAnchor="middle">
                    Stomach
                  </text>
                </g>

                {/* Left arm */}

                <g
                  className={`body-region ${
                    isSelected("left-arm") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("left-arm"))}
                >
                  <path d="M92 155 Q65 165 55 200 L35 335 Q32 355 50 362 Q67 365 75 345 L105 220 Z" />

                  <text
                    x="63"
                    y="275"
                    textAnchor="middle"
                    transform="rotate(-82 63 275)"
                  >
                    Left Arm
                  </text>
                </g>

                {/* Right arm */}

                <g
                  className={`body-region ${
                    isSelected("right-arm") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("right-arm"))}
                >
                  <path d="M268 155 Q295 165 305 200 L325 335 Q328 355 310 362 Q293 365 285 345 L255 220 Z" />

                  <text
                    x="297"
                    y="275"
                    textAnchor="middle"
                    transform="rotate(82 297 275)"
                  >
                    Right Arm
                  </text>
                </g>

                {/* Left leg */}

                <g
                  className={`body-region ${
                    isSelected("left-leg") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("left-leg"))}
                >
                  <path d="M122 405 Q150 415 177 410 L174 585 Q172 610 145 610 Q120 610 120 585 Z" />

                  <text
                    x="147"
                    y="505"
                    textAnchor="middle"
                    transform="rotate(-90 147 505)"
                  >
                    Left Leg
                  </text>
                </g>

                {/* Right leg */}

                <g
                  className={`body-region ${
                    isSelected("right-leg") ? "selected" : ""
                  }`}
                  onClick={() => toggleArea(getAreaData("right-leg"))}
                >
                  <path d="M183 410 Q210 415 238 405 L240 585 Q240 610 215 610 Q188 610 186 585 Z" />

                  <text
                    x="213"
                    y="505"
                    textAnchor="middle"
                    transform="rotate(90 213 505)"
                  >
                    Right Leg
                  </text>
                </g>
              </svg>

              <div className="body-map-legend">
                <span>
                  <i className="legend-dot unselected" />
                  Not selected
                </span>

                <span>
                  <i className="legend-dot selected" />
                  Stress area
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTED AREAS */}

        <div className="somatic-selections">
          <div className="selection-title-row">
            <div>
              <h3>Your body signals</h3>

              <p>Describe what you're noticing.</p>
            </div>

            <span className="selection-count">
              {Object.keys(selectedAreas).length}
            </span>
          </div>

          {Object.keys(selectedAreas).length === 0 ? (
            <div className="empty-selection">
              <div className="empty-icon">🧍</div>

              <strong>No areas selected</strong>

              <p>
                Select an area on the body map to record a physical sensation.
              </p>
            </div>
          ) : (
            <div className="selection-list">
              {Object.values(selectedAreas).map((area) => {
                const areaInfo = getAreaData(area.bodyArea);

                return (
                  <div className="somatic-selection" key={area.bodyArea}>
                    <div className="selection-header">
                      <div>
                        <strong>{areaInfo.label}</strong>

                        <small>{areaInfo.description}</small>
                      </div>

                      <button
                        type="button"
                        className="remove-area"
                        onClick={() => removeArea(area.bodyArea)}
                        aria-label={`Remove ${areaInfo.label}`}
                      >
                        ×
                      </button>
                    </div>

                    <label>Sensation</label>

                    <select
                      value={area.sensation}
                      onChange={(event) =>
                        updateArea(area.bodyArea, {
                          sensation: event.target.value,
                        })
                      }
                    >
                      {SENSATIONS.map((sensation) => (
                        <option key={sensation} value={sensation}>
                          {sensation}
                        </option>
                      ))}
                    </select>

                    <div className="stress-heading">
                      <label>Stress intensity</label>

                      <strong>{area.stressLevel}/10</strong>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={area.stressLevel}
                      onChange={(event) =>
                        updateArea(area.bodyArea, {
                          stressLevel: Number(event.target.value),
                        })
                      }
                    />

                    <div className="stress-labels">
                      <span>Mild</span>
                      <span>Strong</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SomaticBodyMap;
