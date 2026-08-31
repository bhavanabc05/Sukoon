import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./EmotionWheel.css";

const emotionData = [
  {
    name: "Sad",
    emoji: "😔",
    children: [
      {
        name: "Lonely",
        children: ["Isolated", "Alone", "Unwanted"],
      },
      {
        name: "Disappointed",
        children: ["Let down", "Discouraged", "Disheartened"],
      },
      {
        name: "Hurt",
        children: ["Wounded", "Rejected", "Betrayed"],
      },
    ],
  },

  {
    name: "Angry",
    emoji: "😠",
    children: [
      {
        name: "Frustrated",
        children: ["Irritated", "Annoyed", "Exasperated"],
      },
      {
        name: "Resentful",
        children: ["Bitter", "Aggrieved", "Displeased"],
      },
      {
        name: "Offended",
        children: ["Insulted", "Disrespected", "Provoked"],
      },
    ],
  },

  {
    name: "Fear",
    emoji: "😨",
    children: [
      {
        name: "Anxious",
        children: ["Worried", "Nervous", "Uneasy"],
      },
      {
        name: "Insecure",
        children: ["Uncertain", "Self-doubting", "Vulnerable"],
      },
      {
        name: "Overwhelmed",
        children: ["Panicked", "Helpless", "Threatened"],
      },
    ],
  },

  {
    name: "Joy",
    emoji: "😊",
    children: [
      {
        name: "Happy",
        children: ["Cheerful", "Pleased", "Delighted"],
      },
      {
        name: "Grateful",
        children: ["Thankful", "Appreciative", "Blessed"],
      },
      {
        name: "Hopeful",
        children: ["Optimistic", "Encouraged", "Confident"],
      },
    ],
  },

  {
    name: "Calm",
    emoji: "😌",
    children: [
      {
        name: "Peaceful",
        children: ["Relaxed", "Serene", "Tranquil"],
      },
      {
        name: "Content",
        children: ["Satisfied", "Comfortable", "At ease"],
      },
      {
        name: "Safe",
        children: ["Secure", "Protected", "Supported"],
      },
    ],
  },

  {
    name: "Disgust",
    emoji: "🤢",
    children: [
      {
        name: "Uncomfortable",
        children: ["Uneasy", "Disturbed", "Bothered"],
      },
      {
        name: "Disapproving",
        children: ["Critical", "Judgmental", "Dismissive"],
      },
      {
        name: "Repulsed",
        children: ["Revolted", "Nauseated", "Averse"],
      },
    ],
  },
];

const emotionColors = {
  Sad: "#dbeafe",
  Angry: "#fee2e2",
  Fear: "#fef3c7",
  Joy: "#dcfce7",
  Calm: "#e0e7ff",
  Disgust: "#f3e8ff",
};

function EmotionWheel({ onSelectionChange }) {
  const svgRef = useRef(null);
  const callbackRef = useRef(onSelectionChange);

  const [level, setLevel] = useState(1);
  const [primary, setPrimary] = useState(null);
  const [secondary, setSecondary] = useState(null);
  const [specific, setSpecific] = useState(null);

  useEffect(() => {
    callbackRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const getCurrentData = () => {
    if (level === 1) {
      return emotionData;
    }

    if (level === 2 && primary) {
      return primary.children;
    }

    if (level === 3 && secondary) {
      return secondary.children;
    }

    return [];
  };

  const getCurrentTitle = () => {
    if (level === 1) {
      return "Choose an emotion";
    }

    if (level === 2) {
      return primary?.name || "Choose a feeling";
    }

    return secondary?.name || "Choose precisely";
  };

  const getCurrentSubtitle = () => {
    if (level === 1) {
      return "Start here";
    }

    if (level === 2) {
      return "Explore deeper";
    }

    return "Choose precisely";
  };

  const handleSelection = (item) => {
    /*
     * LEVEL 1
     */
    if (level === 1) {
      setPrimary(item);
      setSecondary(null);
      setSpecific(null);
      setLevel(2);

      callbackRef.current({
        primaryEmotion: item.name.toLowerCase(),
        secondaryEmotion: "",
        specificEmotion: "",
      });

      return;
    }

    /*
     * LEVEL 2
     */
    if (level === 2) {
      setSecondary(item);
      setSpecific(null);
      setLevel(3);

      callbackRef.current({
        primaryEmotion: primary.name.toLowerCase(),
        secondaryEmotion: item.name.toLowerCase(),
        specificEmotion: "",
      });

      return;
    }

    /*
     * LEVEL 3
     *
     * Level 3 items are strings.
     */
    setSpecific(item);

    callbackRef.current({
      primaryEmotion: primary.name.toLowerCase(),
      secondaryEmotion: secondary.name.toLowerCase(),
      specificEmotion: item.toLowerCase(),
    });
  };

  const handleBack = () => {
    /*
     * Level 3 → Level 2
     */
    if (level === 3) {
      setSpecific(null);
      setLevel(2);

      callbackRef.current({
        primaryEmotion: primary.name.toLowerCase(),
        secondaryEmotion: "",
        specificEmotion: "",
      });

      return;
    }

    /*
     * Level 2 → Level 1
     */
    if (level === 2) {
      setPrimary(null);
      setSecondary(null);
      setSpecific(null);
      setLevel(1);

      callbackRef.current({
        primaryEmotion: "",
        secondaryEmotion: "",
        specificEmotion: "",
      });
    }
  };

  const handleReset = () => {
    setPrimary(null);
    setSecondary(null);
    setSpecific(null);
    setLevel(1);

    callbackRef.current({
      primaryEmotion: "",
      secondaryEmotion: "",
      specificEmotion: "",
    });
  };

  useEffect(() => {
    const svgElement = svgRef.current;

    if (!svgElement) {
      return;
    }

    const width = 650;
    const height = 650;
    const center = width / 2;

    const radius = 270;
    const innerRadius = 85;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    const wheel = svg
      .append("g")
      .attr("transform", `translate(${center}, ${center})`);

    /*
     * OUTER BACKGROUND
     */

    wheel
      .append("circle")
      .attr("r", radius + 8)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    /*
     * CENTER CIRCLE
     */

    const centerGroup = wheel.append("g").attr("class", "wheel-center");

    centerGroup
      .append("circle")
      .attr("r", innerRadius - 5)
      .attr("fill", "#ffffff")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2);

    centerGroup
      .append("text")
      .attr("class", "center-title")
      .attr("text-anchor", "middle")
      .attr("dy", "-6")
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("fill", "#1e293b")
      .text(getCurrentTitle());

    centerGroup
      .append("text")
      .attr("class", "center-subtitle")
      .attr("text-anchor", "middle")
      .attr("dy", "17")
      .attr("font-size", "11px")
      .attr("fill", "#64748b")
      .text(getCurrentSubtitle());

    /*
     * CURRENT LEVEL DATA
     */

    const data = getCurrentData();

    if (data.length === 0) {
      return;
    }

    /*
     * D3 PIE
     */

    const pie = d3
      .pie()
      .value(() => 1)
      .sort(null)
      .padAngle(0.025);

    const arcs = pie(data);

    /*
     * ARC
     */

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    /*
     * SECTOR GROUPS
     */

    const groups = wheel
      .selectAll(".emotion-sector")
      .data(arcs)
      .join("g")
      .attr("class", "emotion-sector")
      .style("cursor", "pointer");

    /*
     * SECTOR PATH
     */

    groups
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => {
        if (level === 1) {
          return emotionColors[d.data.name] || "#e2e8f0";
        }

        if (level === 2) {
          return emotionColors[primary?.name] || "#e0e7ff";
        }

        return "#dff6f0";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("opacity", (d) => {
        if (level === 3 && specific && specific !== d.data) {
          return 0.45;
        }

        return 1;
      })
      .on("mouseenter", function () {
        d3.select(this).transition().duration(150).attr("opacity", 0.7);
      })
      .on("mouseleave", function (event, d) {
        const isOtherSpecific = level === 3 && specific && specific !== d.data;

        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", isOtherSpecific ? 0.45 : 1);
      })
      .on("click", function (event, d) {
        event.stopPropagation();

        handleSelection(d.data);
      });

    /*
     * LABELS
     *
     * The important part:
     * Level 3 data is a STRING, so we use d.data.
     */

    groups
      .append("text")
      .attr("transform", (d) => {
        const angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI) - 90;

        const textRadius = (innerRadius + radius) / 2;

        const rotation = angle > 90 ? 180 : 0;

        return `
          rotate(${angle})
          translate(${textRadius}, 0)
          rotate(${rotation})
        `;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", level === 1 ? "15px" : "14px")
      .attr("font-weight", "600")
      .attr("fill", "#1e293b")
      .attr("pointer-events", "none")
      .style("display", "block")
      .style("visibility", "visible")
      .text((d) => {
        if (level === 1) {
          return `${d.data.emoji} ${d.data.name}`;
        }

        /*
         * Level 2
         */
        if (level === 2) {
          return d.data.name;
        }

        /*
         * Level 3
         */
        return d.data;
      });
  }, [level, primary, secondary, specific]);

  return (
    <div className="emotion-wheel">
      <div className="wheel-toolbar">
        {level > 1 && (
          <button type="button" className="wheel-back" onClick={handleBack}>
            ← Back
          </button>
        )}

        <div className="wheel-level">Level {level} of 3</div>

        <button type="button" className="wheel-reset" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="wheel-breadcrumb">
        {primary && <span>{primary.name}</span>}

        {secondary && (
          <>
            <span className="breadcrumb-arrow">→</span>

            <span>{secondary.name}</span>
          </>
        )}

        {specific && (
          <>
            <span className="breadcrumb-arrow">→</span>

            <strong>{specific}</strong>
          </>
        )}
      </div>

      <svg
        ref={svgRef}
        role="img"
        aria-label="Interactive emotional granularity wheel"
      />

      <p className="wheel-hint">
        {level === 1 && "Choose a broad emotion to begin."}

        {level === 2 && "Now choose a more specific feeling."}

        {level === 3 && "Choose the word that best describes your experience."}
      </p>
    </div>
  );
}

export default EmotionWheel;
