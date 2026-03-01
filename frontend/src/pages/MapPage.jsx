import { useState } from "react";
import { BG_URL4, ACCENT_COLOR } from "../constants";

function buildTimeline(plan) {
  if (!plan?.selected_actions?.length) return [];
  const currentYear = new Date().getFullYear();
  const horizon = plan.time_horizon_years ?? 1;
  const actions = plan.selected_actions;
  const seqKgPerYear = plan.tree_sequestration_kg_per_year ?? 22;
  const perYear = Math.ceil(actions.length / horizon);
  const blocks = [];
  for (let y = 0; y < horizon; y++) {
    const slice = actions.slice(y * perYear, (y + 1) * perYear);
    if (!slice.length) break;
    blocks.push({
      year: currentYear + y,
      steps: slice.map((a, i) => ({
        id: `${y}-${i}`,
        text: a.action,
        co2: a.annual_co2_reduction,
        trees: a.annual_co2_reduction / seqKgPerYear,
      })),
    });
  }
  return blocks;
}

function YearCard({ block, checked, onToggle }) {
  const total = block.steps.length;
  const done  = block.steps.filter(s => checked.has(s.id)).length;

  return (
    <div style={{
      width: "100%",
      background: "rgba(255,255,255,0.82)",
      borderRadius: 20,
      boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
      border: "1px solid rgba(0,0,0,0.07)",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px 14px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <span style={{
          fontWeight: 800, fontSize: 22, color: ACCENT_COLOR,
          fontFamily: "var(--font-ui)", letterSpacing: "-0.01em",
        }}>{block.year}</span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "#888",
          fontFamily: "var(--font-ui)",
        }}>{done > 0 ? `${done} removed` : `${total} action${total !== 1 ? "s" : ""}`}</span>
      </div>

      {/* Action rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {block.steps.map((step, i) => {
          const isChecked = checked.has(step.id);
          return (
            <div
              key={step.id}
              onClick={() => onToggle(step.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 24px",
                borderBottom: i < block.steps.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
                background: isChecked ? "rgba(180,60,60,0.04)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              {/* Action text */}
              <span style={{
                fontSize: 14, fontWeight: 500,
                color: isChecked ? "rgba(0,0,0,0.3)" : "#222",
                fontFamily: "var(--font-ui)",
                textDecoration: isChecked ? "line-through" : "none",
                transition: "all 0.2s",
                lineHeight: 1.4,
              }}>{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MapPage({ planData, onBack, onGraph }) {
  const [checked, setChecked] = useState(new Set());
  const [backHover, setBackHover] = useState(false);
  const [graphHover, setGraphHover] = useState(false);

  const toggle = (id) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const timeline = buildTimeline(planData);
  const allSteps = timeline.flatMap(b => b.steps);

  const removedCO2      = allSteps.filter(s => checked.has(s.id)).reduce((sum, s) => sum + s.co2,   0);
  const removedTrees    = allSteps.filter(s => checked.has(s.id)).reduce((sum, s) => sum + s.trees, 0);
  const totalCO2        = Math.max(0, (planData?.cumulative_estimated_co2_reduction ?? 0) - removedCO2);
  const equivalentTrees = Math.max(0, (planData?.equivalent_trees ?? 0) - removedTrees);

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
          position: "absolute", top: 15, left: 15, zIndex: 20,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>

      {/* Sticky summary bubble */}
      {planData && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10,
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          borderRadius: 99,
          border: "1px solid rgba(0,0,0,0.07)",
          padding: "10px 28px",
          display: "flex", gap: 24, flexWrap: "nowrap", alignItems: "center",
          fontSize: 14, color: "#444",
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          whiteSpace: "nowrap",
        }}>
          <span><b style={{ color: ACCENT_COLOR }}>${planData.budget_usd?.toLocaleString()}</b> budget</span>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
          <span><b style={{ color: ACCENT_COLOR }}>{planData.time_horizon_years}</b> yr{planData.time_horizon_years !== 1 ? "s" : ""}</span>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
          <span><b style={{ color: ACCENT_COLOR }}>{Math.round(totalCO2).toLocaleString()} kg</b> CO₂</span>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
          <span><b style={{ color: ACCENT_COLOR }}>{equivalentTrees.toFixed(1)}</b> trees</span>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        overflowY: "auto",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 60px",
        boxSizing: "border-box",
        gap: 16,
      }}>
        <h2 style={{ margin: "0 0 8px", color: "#111", fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em" }}>
          Your Plan
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, width: "100%", maxWidth: 1000,
        }}>
          {timeline.map(block => (
            <YearCard
              key={block.year}
              block={block}
              checked={checked}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* Trees equivalent */}
        <div style={{
          marginTop: 8,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
          borderRadius: 99,
          padding: "14px 28px",
          fontSize: 15, fontWeight: 700,
          color: "#333",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          equivalent to <span style={{ fontSize: 20, color: ACCENT_COLOR }}>{equivalentTrees.toFixed(1)}</span> trees planted
        </div>

        {/* View graphs button */}
        <button
          onClick={onGraph}
          onMouseEnter={() => setGraphHover(true)}
          onMouseLeave={() => setGraphHover(false)}
          style={{
            padding: "13px 36px", paddingLeft: 32,
            background: ACCENT_COLOR, color: "#fff",
            border: "none", borderRadius: 28,
            fontWeight: 600, fontSize: 16, cursor: "pointer",
            fontFamily: "var(--font-ui)",
            transition: "background 0.2s, box-shadow 0.2s",
            whiteSpace: "nowrap",
            boxShadow: graphHover ? "0 6px 20px rgba(0,0,0,0.22)" : "none",
          }}
        >
          View Graphs
        </button>
      </div>
    </div>
  );
}
