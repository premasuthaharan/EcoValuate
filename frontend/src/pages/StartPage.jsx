import AddressSearch from "../components/AddressSearch";
import { BG_URL } from "../constants";

export default function StartPage({ onGo }) {
  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />
      <div style={{
        position: "relative", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: -1, margin: 0 }}>
          EcoValuate
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <label style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>Enter your address</label>
          <AddressSearch onGo={onGo} />
        </div>
      </div>
    </div>
  );
}
