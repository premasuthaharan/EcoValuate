const getTrackColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
};

// How close (in score units) the thumb label must be to an end before hiding it
const HIDE_THRESHOLD = 8;

export default function ScoreSlider({ animatedScore, score }) {
  const trackColor = getTrackColor(animatedScore);
  const thumbPct = Math.min(Math.max(animatedScore, 1), 99);
  const finalScore = score ?? animatedScore;
  const hideZero = finalScore < HIDE_THRESHOLD;
  const hideHundred = finalScore > 100 - HIDE_THRESHOLD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Track */}
      <div style={{
        position: "relative",
        height: 10,
        background: "rgba(0,0,0,0.18)",
        borderRadius: 99,
      }}>
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${animatedScore}%`,
          background: trackColor,
          borderRadius: 99,
          transition: "width 0.05s linear, background 0.4s ease",
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute",
          left: `calc(${thumbPct}% - 10px)`,
          top: "50%",
          transform: "translateY(-50%)",
          transition: "left 0.05s linear",
          width: 20, height: 20,
          borderRadius: "50%",
          background: trackColor,
          border: "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "left 0.05s linear, background 0.4s ease",
        }} />
      </div>

      {/* Label row — all three share the same coordinate space */}
      <div style={{ position: "relative", height: 28 }}>
        {/* "0" — flush left */}
        <span style={{
          position: "absolute", left: 0,
          fontSize: 16, color: "rgba(0,0,0,0.5)",
          opacity: hideZero ? 0 : 1,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}>0</span>

        {/* Animated score — centered on thumb */}
        <span style={{
          position: "absolute",
          left: `${thumbPct}%`,
          transform: "translateX(-50%)",
          transition: "left 0.05s linear, color 0.4s ease",
          fontSize: 22,
          fontWeight: 700,
          color: trackColor,
          whiteSpace: "nowrap",
        }}>{animatedScore}</span>

        {/* "100" — flush right */}
        <span style={{
          position: "absolute", right: 0,
          fontSize: 16, color: "rgba(0,0,0,0.5)",
          opacity: hideHundred ? 0 : 1,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}>100</span>
      </div>
    </div>
  );
}
