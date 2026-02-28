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
      {/* Radial blur mask: blurs centre, fades to sharp at edges */}
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(4px)",
        maskImage: "radial-gradient(ellipse 55% 45% at 50% 52%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 50% 52%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "relative", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        marginTop: -180,
      }}>
        <h1 style={{
            fontFamily: "var(--font-brand)",
            fontSize: 70,
            fontWeight: 800,
            color: "#111",
            letterSpacing: "-0.03em",
            margin: 0,
            }}>
            EcoValuate
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <label style={{
            fontFamily: "var(--font-ui)",
            fontSize: 25,
            color: "#333",
            fontWeight: 500
            }}>
            Enter your address
        </label>
          <AddressSearch onGo={onGo} />
        </div>
      </div>
    </div>
  );
}
