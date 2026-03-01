import { useState } from "react";
import { BG_URL4, TIMELINE, TREES_PER_STEP, ACCENT_COLOR } from "../constants";

function YearBubble({ year }) {
  return (
    <div style={{
      width: 100, height: 100, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, #a0683a, ${ACCENT_COLOR})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: 22,
      fontFamily: "var(--font-ui)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
      border: "3px solid rgba(255,255,255,0.25)",
      flexShrink: 0,
    }}>{year}</div>
  );
}

function StepBubble({ step, checked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(step.id)}
      style={{
        width: 110, height: 110, borderRadius: "50%",
        background: checked ? "rgba(150,150,150,0.5)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        border: checked ? "2px solid rgba(120,120,120,0.3)" : "2px solid rgba(255,255,255,0.5)",
        boxShadow: checked ? "none" : "0 4px 20px rgba(0,0,0,0.08)",
        transition: "all 0.25s ease",
        padding: 14,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      <div style={{
        fontSize: 11.5, lineHeight: 1.4,
        color: checked ? "rgba(60,60,60,0.45)" : "#333",
        fontWeight: 600,
        fontFamily: "var(--font-ui)",
        textDecoration: checked ? "line-through" : "none",
      }}>{step.text}</div>
    </div>
  );
}

export default function TimelinePage({ onBack }) {
  const [checked, setChecked] = useState(new Set());
  const [backHover, setBackHover] = useState(false);

  const toggle = (id) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const treesSaved = checked.size * TREES_PER_STEP;

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL4})`,
      backgroundSize: "cover", backgroundPosition: "center 80%",
      overflow: "hidden",
      fontFamily: "var(--font-ui)",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(1px)",
        maskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <button
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          position: "absolute", top: 15, left: 15, zIndex: 10,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>

      {/* Scrollable content */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        overflowY: "auto",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "72px 20px 60px",
        boxSizing: "border-box",
        gap: 20,
      }}>
        <h2 style={{ margin: "0 0 8px", color: "#111", fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em" }}>
          Your Plan
        </h2>

        {TIMELINE.map((block) => (
          <div key={block.year} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <YearBubble year={block.year} />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
              {block.steps.map(step => (
                <StepBubble key={step.id} step={step} checked={checked.has(step.id)} onToggle={toggle} />
              ))}
            </div>
          </div>
        ))}

        {/* Trees saved bubble */}
        <div style={{
          marginTop: 8,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
          borderRadius: 99,
          padding: "16px 32px",
          fontSize: 16, fontWeight: 700,
          color: "#333",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}>
          you would save <span style={{ fontSize: 22, color: ACCENT_COLOR }}>{treesSaved}</span> trees
        </div>

        {/* View graphs button */}
        <button
          onClick={() => alert("Graphs coming soon!")}
          style={{
            padding: "13px 36px", paddingLeft: 32,
            background: ACCENT_COLOR, color: "#fff",
            border: "none", borderRadius: 28,
            fontWeight: 600, fontSize: 16, cursor: "pointer",
            fontFamily: "var(--font-ui)",
            transition: "background 0.2s", whiteSpace: "nowrap",
          }}
        >
          View Graphs
        </button>
      </div>
    </div>
  );
}
