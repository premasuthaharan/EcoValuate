import { useState } from "react";
import Field from "../components/Field";
import Toggle from "../components/Toggle";
import PageCard from "../components/PageCard";
import { BG_URL2, inputStyle } from "../constants";

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
    <>
      <button
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          position: "fixed", top: 15, left: 15, zIndex: 10,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>
    <PageCard bgUrl={BG_URL2} width={660}>
      <div style={{ padding: "42px 48px" }}>
        <h2 style={{ margin: "0 0 24px", color: "#2d5a27", fontWeight: 700, fontSize: 22 }}>
          your house details
        </h2>

        {error && <p style={{ color: "#c0392b", fontSize: 13, margin: "-12px 0 16px" }}>{error}</p>}

        <div style={{ display: "grid", gap: 18 }}>
          <Field label="address" required>
            <input
              value={form.address}
              onChange={e => set("address", e.target.value)}
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Field label="square feet">
              <input value={form.sqft} onChange={e => set("sqft", e.target.value)} style={inputStyle} type="number" />
            </Field>
            <Field label="year built">
              <input value={form.yearBuilt} onChange={e => set("yearBuilt", e.target.value)} style={inputStyle} type="number" />
            </Field>
            <Field label="pool?">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.pool} onChange={v => set("pool", v)} />
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Field label="latitude">
              <input value={form.lat} onChange={e => set("lat", e.target.value)} style={inputStyle} type="number" />
            </Field>
            <Field label="longitude">
              <input value={form.lon} onChange={e => set("lon", e.target.value)} style={inputStyle} type="number" />
            </Field>
            <Field label="solar panels?">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.solarPanels} onChange={v => set("solarPanels", v)} />
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Field label="stories">
              <input value={form.stories} onChange={e => set("stories", e.target.value)} style={inputStyle} type="number" />
            </Field>
            <Field label="fuel source">
              <input value={form.fuelSource} onChange={e => set("fuelSource", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="other yes / no">
              <div style={{ paddingTop: 6 }}>
                <Toggle checked={form.other} onChange={v => set("other", v)} />
              </div>
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 28px",
              background: submitted ? "#888" : "#4a7c59",
              color: "#fff", border: "none", borderRadius: 24,
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "background 0.2s",
            }}
          >
            <span>✓</span> {submitted ? "Submitted!" : "Submit"}
          </button>
        </div>
      </div>
    </PageCard>
    </>
  );
}

