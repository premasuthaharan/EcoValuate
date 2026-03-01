import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("footprint");

  const tabs = [
    { id: "footprint", label: "Expected Footprint" },
    { id: "graph", label: "Cost" },
  ];

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: "url(/bg5.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

      {/* Row: panel + house */}
      <div style={{ position: "relative", display: "flex", flexDirection: "row", alignItems: "center", gap: 60 }}>

        {/* Column: tabs + content box */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", overflow: "hidden" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 16,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  padding: "12px 36px",
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
                  color: activeTab === tab.id ? "#111" : "#fff",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: "0 24px 24px 0",
            width: 680,
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {activeTab === "footprint" && (
              <p style={{ fontFamily: "var(--font-ui)", color: "#555", fontSize: 15 }}>
                Expected Footprint content goes here.
              </p>
            )}
            {activeTab === "graph" && (
              <p style={{ fontFamily: "var(--font-ui)", color: "#555", fontSize: 15 }}>
                Graph content goes here.
              </p>
            )}
          </div>
        </div>

        {/* Polygon house — 3/4 perspective */}
        <svg viewBox="0 0 210 248" width={252} height={298} xmlns="http://www.w3.org/2000/svg">
          {/* Ground shadow */}
          <ellipse cx="100" cy="238" rx="85" ry="7" fill="#2a3a2a" />

          {/* Chimney right face */}
          <polygon points="118,18 118,54 128,48 128,12" fill="#7A6244" />
          {/* Chimney front face */}
          <polygon points="106,22 106,58 118,54 118,18" fill="#9A7A54" />
          {/* Chimney top */}
          <polygon points="106,22 118,18 128,12 116,16" fill="#C4A472" />

          {/* Right side wall (shadow face) */}
          <polygon points="130,222 178,194 178,88 130,116" fill="#A08860" />

          {/* Front wall (light face) */}
          <polygon points="15,222 130,222 130,116 15,116" fill="#C9AA7A" />

          {/* Right roof face (dark) */}
          <polygon points="72,58 118,30 178,88 130,116" fill="#3D607A" />
          {/* Front roof face (light) */}
          <polygon points="72,58 15,116 130,116" fill="#5C8FAA" />

          {/* Door */}
          <polygon points="65,222 65,162 104,162 104,222" fill="#7B4A2A" />
          {/* Door panel */}
          <polygon points="70,167 70,192 99,192 99,167" fill="#6A3C20" />
          {/* Door knob */}
          <circle cx="97" cy="196" r="2.5" fill="#D4A030" />

          {/* Left window */}
          <polygon points="22,130 22,160 56,160 56,130" fill="#A8CCE0" />
          <line x1="39" y1="130" x2="39" y2="160" stroke="#7AAAC4" strokeWidth="2" />
          <line x1="22" y1="145" x2="56" y2="145" stroke="#7AAAC4" strokeWidth="2" />
          <polygon points="22,130 22,160 56,160 56,130" fill="none" stroke="#6898B0" strokeWidth="1.5" />

          {/* Right window (front wall) */}
          <polygon points="78,130 78,160 114,160 114,130" fill="#A8CCE0" />
          <line x1="96" y1="130" x2="96" y2="160" stroke="#7AAAC4" strokeWidth="2" />
          <line x1="78" y1="145" x2="114" y2="145" stroke="#7AAAC4" strokeWidth="2" />
          <polygon points="78,130 78,160 114,160 114,130" fill="none" stroke="#6898B0" strokeWidth="1.5" />

          {/* Side window (parallelogram on right face) */}
          <polygon points="137,128 163,113 163,141 137,156" fill="#88B8CC" />
          <line x1="150" y1="120" x2="150" y2="149" stroke="#5A98B4" strokeWidth="1.5" />
          <line x1="137" y1="134" x2="163" y2="127" stroke="#5A98B4" strokeWidth="1.5" />
          <polygon points="137,128 163,113 163,141 137,156" fill="none" stroke="#5A98B4" strokeWidth="1.5" />
        </svg>

      </div>
    </div>
  );
}
