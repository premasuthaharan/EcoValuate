import { inputStyle, ACCENT_COLOR } from "../constants";

export default function PlanInputs({ budget, years, priority, errors, onBudgetChange, onYearsChange, onPriorityChange, onGenerate, loading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Input row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px" }}>
          <input
            style={{
              ...inputStyle,
              fontSize: 15,
              padding: "12px 36px 12px 14px",
              background: "rgba(255,255,255,0.85)",
              borderColor: errors.budget ? "#c0392b" : undefined,
            }}
            type="number"
            placeholder="Budget ($)"
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
          />
          {budget && (
            <button style={clearBtnStyle} onClick={() => onBudgetChange("")} aria-label="Clear budget">✕</button>
          )}
          {errors.budget && <span style={errorStyle}>{errors.budget}</span>}
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px" }}>
          <input
            style={{
              ...inputStyle,
              fontSize: 15,
              padding: "12px 36px 12px 14px",
              background: "rgba(255,255,255,0.85)",
              borderColor: errors.years ? "#c0392b" : undefined,
            }}
            type="number"
            placeholder="Years"
            value={years}
            onChange={(e) => onYearsChange(e.target.value)}
          />
          {years && (
            <button style={clearBtnStyle} onClick={() => onYearsChange("")} aria-label="Clear years">✕</button>
          )}
          {errors.years && <span style={errorStyle}>{errors.years}</span>}
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px" }}>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            style={{
              ...inputStyle,
              fontSize: 15,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.85)",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              borderColor: errors.priority ? "#c0392b" : undefined,
              color: priority ? "rgb(51,51,51)" : "rgb(118,118,118)",
            }}
          >
            <option value="" disabled>Plan Type</option>
            <option value="fastest payback">Fastest payback</option>
            <option value="max co2 reduction">Max CO2 reduction</option>
            <option value="balanced">Balanced</option>
          </select>
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none", fontSize: 11, color: "#555",
          }}>▾</span>
          {errors.priority && <span style={errorStyle}>{errors.priority}</span>}
        </div>
      </div>

      {/* Centered button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            ...generateBtnStyle,
            background: loading ? "rgba(89,58,42,0.6)" : ACCENT_COLOR,
            cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          {loading && (
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.35)",
              borderTopColor: "#fff",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          )}
          {loading ? "Generating..." : "Generate Plan"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const clearBtnStyle = {
  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
  background: "#555", border: "none", borderRadius: "50%",
  width: 18, height: 18, fontSize: 11, color: "#fff", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
};

const errorStyle = {
  display: "inline-block",
  fontSize: 12,
  color: "#c0392b",
  background: "rgba(255,235,235,0.92)",
  border: "1px solid #c0392b",
  borderRadius: 99,
  padding: "2px 10px",
};

const generateBtnStyle = {
  padding: "13px 36px", background: ACCENT_COLOR, color: "#fff",
  border: "none", borderRadius: 28, fontWeight: 600, fontSize: 16,
  cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
};
