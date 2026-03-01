import { useState } from "react";
import Field from "../components/Field";
import Toggle from "../components/Toggle";
import { BG_URL2, inputStyle, ACCENT_COLOR } from "../constants";

export default function InfoPage({ address, onSubmit, onBack }) {
  const [form, setForm] = useState({
    address, sqft: "", yearBuilt: "", pool: false,
    lat: "", lon: "", solarPanels: false,
    stories: "", fuelSource: "", other: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [backHover, setBackHover] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.address.trim()) { setError("Address is required."); return; }
    setError("");
    console.log("EcoValuate form data:", form);
    setSubmitted(true);
    onSubmit(form);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL2})`,
      backgroundSize: "cover", backgroundPosition: "center 80%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
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
          position: "absolute", top: 15, left: 15,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>

      {/* Content */}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", gap: 20,
        width: 660,
      }}>
        <h2 style={{ margin: 0, color: "#111", fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em" }}>
          Your House Details
        </h2>

        {/* Bubble 1: Address */}
        <div style={bubbleStyle}>
          {error && <p style={{ color: "#c0392b", fontSize: 13, margin: "0 0 16px" }}>{error}</p>}
          <Field label="address" required>
            <input
              value={form.address}
              onChange={e => set("address", e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Bubble 2: Numeric / text fields */}
        <div style={bubbleStyle}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Field label="square feet">
                <input value={form.sqft} onChange={e => set("sqft", e.target.value)} style={inputStyle} type="number" />
              </Field>
              <Field label="year built">
                <input value={form.yearBuilt} onChange={e => set("yearBuilt", e.target.value)} style={inputStyle} type="number" />
              </Field>
              <Field label="stories">
                <input value={form.stories} onChange={e => set("stories", e.target.value)} style={inputStyle} type="number" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Field label="latitude">
                <input value={form.lat} onChange={e => set("lat", e.target.value)} style={inputStyle} type="number" />
              </Field>
              <Field label="longitude">
                <input value={form.lon} onChange={e => set("lon", e.target.value)} style={inputStyle} type="number" />
              </Field>
              <Field label="fuel source">
                <input value={form.fuelSource} onChange={e => set("fuelSource", e.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        </div>

        {/* Bubble 3: Yes/No toggles */}
        <div style={bubbleStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Field label="pool?">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.pool} onChange={v => set("pool", v)} />
              </div>
            </Field>
            <Field label="solar panels?">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.solarPanels} onChange={v => set("solarPanels", v)} />
              </div>
            </Field>
            <Field label="other yes / no">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.other} onChange={v => set("other", v)} />
              </div>
            </Field>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "13px 30px", paddingLeft: 22,
              background: submitted ? "#888" : ACCENT_COLOR,
              color: "#fff", border: "none", borderRadius: 28,
              fontWeight: 600, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "background 0.2s", whiteSpace: "nowrap",
            }}
          >
            <span>✓</span> {submitted ? "Submitted!" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

const bubbleStyle = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(1px)",
  WebkitBackdropFilter: "blur(1px)",
  borderRadius: 16,
  padding: "20px 24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};
