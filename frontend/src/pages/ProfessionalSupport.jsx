import { useState } from "react";
import "./ProfessionalSupport.css";

const SUPPORT_OPTIONS = [
  {
    id: "telemanas",
    category: "Immediate Support",
    icon: "📞",
    title: "Tele-MANAS",
    subtitle: "24×7 mental health support",
    description:
      "A Government of India tele-mental health service that provides access to trained counsellors and mental health professionals.",
    details: [
      "Available 24×7",
      "Available across India",
      "Support is available in multiple languages",
      "Can provide counselling and connect callers to further care",
    ],
    phone: "14416",
    alternatePhone: "1800-89-14416",
    actionLabel: "Call 14416",
  },
  {
    id: "emergency",
    category: "Emergency",
    icon: "🆘",
    title: "Emergency Support",
    subtitle: "For immediate danger or emergencies",
    description:
      "If you or someone around you is in immediate danger or needs urgent emergency assistance, contact India's emergency response service.",
    details: [
      "Police assistance",
      "Medical emergency support",
      "Fire and rescue services",
      "Available across India",
    ],
    phone: "112",
    actionLabel: "Call 112",
  },
  {
    id: "counselling",
    category: "Professional Care",
    icon: "🧠",
    title: "Mental Health Counselling",
    subtitle: "Talk with a trained professional",
    description:
      "A counsellor or psychologist can provide a confidential space to discuss emotional difficulties, stress, work pressure, relationships, or other concerns.",
    details: [
      "Useful for ongoing emotional concerns",
      "Can support coping and wellbeing",
      "Can help identify when additional care may be useful",
    ],
  },
  {
    id: "psychologist",
    category: "Professional Care",
    icon: "🌿",
    title: "Psychological Support",
    subtitle: "Support for emotional and behavioural concerns",
    description:
      "A psychologist can help with assessment, coping strategies, emotional difficulties, and structured psychological interventions.",
    details: [
      "Suitable for recurring emotional difficulties",
      "Can provide structured psychological support",
      "May recommend additional professional care when appropriate",
    ],
  },
  {
    id: "psychiatry",
    category: "Professional Care",
    icon: "🩺",
    title: "Psychiatric Care",
    subtitle: "Medical mental health support",
    description:
      "A psychiatrist is a medical doctor who can assess mental health conditions and provide medical treatment when clinically appropriate.",
    details: [
      "Medical assessment",
      "Treatment planning",
      "Medication when clinically appropriate",
      "Can coordinate with other mental health professionals",
    ],
  },
  {
    id: "workplace",
    category: "Workplace Support",
    icon: "🏢",
    title: "Workplace Support",
    subtitle: "Support through your organization",
    description:
      "If your workplace provides counselling, an employee assistance programme, occupational health service, or another wellbeing service, you may be able to access support through your organization.",
    details: [
      "Check with HR or occupational health",
      "Ask whether an employee assistance programme is available",
      "Look for confidential workplace counselling options",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Immediate Support",
  "Professional Care",
  "Workplace Support",
];

function ProfessionalSupport() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filteredOptions =
    activeCategory === "All"
      ? SUPPORT_OPTIONS
      : SUPPORT_OPTIONS.filter((option) => option.category === activeCategory);

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const callSupport = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="professional-support-page">
      {/* HEADER */}
      <section className="professional-hero">
        <div className="professional-hero-icon">🤝</div>

        <div>
          <p className="professional-eyebrow">PROFESSIONAL SUPPORT</p>

          <h1>Support is available when you need it.</h1>

          <p>
            Sukoon can help you notice patterns in your wellbeing, but
            professional support can provide personalised care when you need
            more help.
          </p>
        </div>
      </section>

      {/* EMERGENCY NOTICE */}
      <section className="support-notice">
        <div className="support-notice-icon">💚</div>

        <div>
          <strong>If you are in immediate danger</strong>

          <p>
            Please contact emergency services or reach out to a trusted person
            who can stay with you. Do not rely on Sukoon for emergency care.
          </p>
        </div>

        <button
          type="button"
          className="emergency-button"
          onClick={() => callSupport("112")}
        >
          Call 112
        </button>
      </section>

      {/* FILTERS */}
      <section className="support-directory">
        <div className="support-heading">
          <div>
            <p className="professional-eyebrow">FIND SUPPORT</p>

            <h2>Choose the kind of support you need</h2>

            <p>Explore options based on the type of help you're looking for.</p>
          </div>
        </div>

        <div className="support-filters">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`support-filter ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="support-grid">
          {filteredOptions.map((option) => {
            const isExpanded = expandedId === option.id;

            return (
              <article
                className={`support-card ${
                  option.category === "Emergency" ? "emergency-card" : ""
                }`}
                key={option.id}
              >
                <div className="support-card-top">
                  <div className="support-card-icon">{option.icon}</div>

                  <span className="support-category">{option.category}</span>
                </div>

                <h3>{option.title}</h3>

                <p className="support-subtitle">{option.subtitle}</p>

                <p className="support-description">{option.description}</p>

                <button
                  type="button"
                  className="details-button"
                  onClick={() => toggleExpanded(option.id)}
                >
                  {isExpanded ? "Show less" : "Learn more"}
                  <span>{isExpanded ? "↑" : "↓"}</span>
                </button>

                {isExpanded && (
                  <div className="support-details">
                    <ul>
                      {option.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {option.phone && (
                  <div className="support-contact">
                    <div>
                      <span>Available by phone</span>

                      <strong>{option.phone}</strong>

                      {option.alternatePhone && (
                        <small>Also: {option.alternatePhone}</small>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => callSupport(option.phone)}
                    >
                      {option.actionLabel}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* WORKPLACE NOTE */}
      <section className="workplace-support-note">
        <div className="workplace-note-icon">🏥</div>

        <div>
          <p className="professional-eyebrow">FOR HEALTHCARE PROFESSIONALS</p>

          <h2>Your wellbeing matters outside the shift too.</h2>

          <p>
            If your workplace provides occupational health, employee assistance,
            counselling, or another staff wellbeing service, consider reaching
            out through your organization.
          </p>
        </div>
      </section>

      {/* FOOTNOTE */}
      <section className="support-footer-note">
        <span>🌱</span>

        <p>
          Sukoon is a wellbeing support platform. Its tools are intended to
          support self-awareness and wellbeing and do not replace diagnosis,
          treatment, or emergency professional care.
        </p>
      </section>
    </div>
  );
}

export default ProfessionalSupport;
