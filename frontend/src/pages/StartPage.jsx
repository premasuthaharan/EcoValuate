import { useState } from "react";
import AddressSearch from "../components/AddressSearch";
import { BG_URL, ACCENT_COLOR } from "../constants";

const clouds = [
  { top: "-5vh", left: "35vw", width: "22vw", opacity: 0.85 },
  { top: "14vh", left: "50vw", width: "21vw", opacity: 0.75 },
];

export default function StartPage({ onGo }) {
  const [query, setQuery] = useState("");

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        @keyframes cloudBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(4px)",
        maskImage: "radial-gradient(ellipse 55% 45% at 50% 52%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 50% 52%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }} />
      {clouds.map((c, i) => (
        <img
          key={i}
          src="/cloud.png"
          alt=""
          style={{
            position: "absolute",
            top: c.top, left: c.left,
            width: c.width,
            opacity: c.opacity,
            filter: "grayscale(1) brightness(1.15)",
            pointerEvents: "none",
            userSelect: "none",
            animation: `cloudBounce ${3 + i * 0.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        marginTop: -180,
        width: 500,
      }}>
        <h1 style={{
          fontFamily: "var(--font-brand)",
          fontSize: 70,
          fontWeight: 800,
          color: "#111",
          letterSpacing: "-0.03em",
          margin: 0,
          alignSelf: "center",
        }}>
          EcoValuate
        </h1>

        {/* Input bubble */}
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          <AddressSearch query={query} onQueryChange={setQuery} />
        </div>

        {/* Go button */}
        <button
          onClick={() => query.trim() && onGo(query)}
          style={{
            padding: "13px 36px", paddingLeft: 32,
            background: ACCENT_COLOR, color: "#fff",
            border: "none", borderRadius: 28, cursor: "pointer",
            fontWeight: 600, fontSize: 16,
            transition: "background 0.2s", whiteSpace: "nowrap",
            fontFamily: "var(--font-ui)",
          }}
        >Go</button>
      </div>
    </div>
  );
}
