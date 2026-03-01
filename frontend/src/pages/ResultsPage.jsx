import { BG_URL } from "../constants";

export default function ResultsPage({ data }) {
  return (
    <div style={{
      width: "100vw", height: "100vh",
      backgroundImage: `url(${BG_URL})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.25)" }} />
      <div style={{
        position: "relative", background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)", borderRadius: 16,
        padding: "40px 48px", textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
        <h2 style={{ color: "#2d5a27", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>Results Coming Soon</h2>
        <p style={{ color: "#555", fontSize: 14, margin: "0 0 4px" }}>Your data has been logged successfully.</p>
        <p style={{ color: "#888", fontSize: 12 }}>This page will display your EcoValuate score.</p>
        <pre style={{
          marginTop: 20, background: "rgba(0,0,0,0.05)", borderRadius: 8,
          padding: "12px 16px", fontSize: 11, textAlign: "left",
          color: "#444", maxWidth: 360, overflowX: "auto",
        }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
