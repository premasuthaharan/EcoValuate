const getTrackColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
};

export default function ScoreSlider({ animatedScore }) {
  const trackColor = getTrackColor(animatedScore);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Track */}
      <div style={{
        position: "relative",
        height: 10,
        background: "rgba(0,0,0,0.18)",
        borderRadius: 99,
        marginBottom: 5,
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${animatedScore}%`,
          background: trackColor,
          borderRadius: 99,
          transition: "width 0.05s linear, background 0.4s ease",
        }} />
        {/* Thumb + score label underneath */}
        <div style={{
          position: "absolute",
          left: `calc(${animatedScore}% - 10px)`,
          top: "50%",
          transform: "translateY(-50%)",
          transition: "left 0.05s linear",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{
            width: 20, height: 20,
            borderRadius: "50%",
            background: trackColor,
            border: "2px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "background 0.4s ease",
          }} />
          <span style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            fontSize: 22,
            fontWeight: 700,
            color: trackColor,
            whiteSpace: "nowrap",
            transition: "color 0.4s ease",
          }}>{animatedScore}</span>
        </div>
      </div>
      {/* 0 / 100 labels */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 16, color: "rgba(0,0,0,0.5)",
      }}>
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
