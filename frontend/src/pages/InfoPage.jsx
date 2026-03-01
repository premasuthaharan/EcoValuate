import { useState } from "react";
import Field from "../components/Field";
import Toggle from "../components/Toggle";
import { BG_URL2, inputStyle, ACCENT_COLOR } from "../constants";

export default function InfoPage({ address, loadData, onSubmit, onBack }) {
  const m = loadData?.data?.metadata ?? {};
  const [form, setForm] = useState({
    address: m.address ?? address,
    sqft: m.size_sqft ?? "",
    yearBuilt: m.year_built ?? "",
    lat: m.latitude ?? "",
    lon: m.longitude ?? "",
    stories: m.stories ?? "",
    fuelSource: m.inferred_fuel === "natural_gas" ? "gas" : (["electric", "oil"].includes(m.inferred_fuel) ? m.inferred_fuel : ""),
    pool: m.has_pool ?? false,
    solarPanels: m.has_solar ?? false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [backHover, setBackHover] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const errs = {};
    if (!form.address.trim()) errs.address = "Address is required.";
    if (!form.sqft) errs.sqft = "Square footage is required.";
    if (!form.yearBuilt) errs.yearBuilt = "Year built is required.";
    if (!form.lat) errs.lat = "Latitude is required.";
    if (!form.lon) errs.lon = "Longitude is required.";
    if (form.stories && (!/^\d+$/.test(form.stories) || Number(form.stories) <= 0))
      errs.stories = "Must be a positive whole number.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
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
          <Field label="address" required>
            <input
              value={form.address}
              onChange={e => set("address", e.target.value)}
              style={{ ...inputStyle, borderColor: errors.address ? "#c0392b" : undefined }}
            />
          </Field>
          {errors.address && <span style={errorStyle}>{errors.address}</span>}
        </div>

        {/* Bubble 2: Numeric / text fields */}
        <div style={bubbleStyle}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <Field label="square feet" required>
                  <input value={form.sqft} onChange={e => set("sqft", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.sqft ? "#c0392b" : undefined }} type="number" />
                </Field>
                {errors.sqft && <span style={errorStyle}>{errors.sqft}</span>}
              </div>
              <div>
                <Field label="year built" required>
                  <input value={form.yearBuilt} onChange={e => set("yearBuilt", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.yearBuilt ? "#c0392b" : undefined }} type="number" />
                </Field>
                {errors.yearBuilt && <span style={errorStyle}>{errors.yearBuilt}</span>}
              </div>
              <div>
                <Field label="stories">
                  <input value={form.stories} onChange={e => set("stories", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.stories ? "#c0392b" : undefined }} type="number" min="1" step="1" />
                </Field>
                {errors.stories && <span style={errorStyle}>{errors.stories}</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <Field label="latitude" required>
                  <input value={form.lat} onChange={e => set("lat", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.lat ? "#c0392b" : undefined }} type="number" />
                </Field>
                {errors.lat && <span style={errorStyle}>{errors.lat}</span>}
              </div>
              <div>
                <Field label="longitude" required>
                  <input value={form.lon} onChange={e => set("lon", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.lon ? "#c0392b" : undefined }} type="number" />
                </Field>
                {errors.lon && <span style={errorStyle}>{errors.lon}</span>}
              </div>
              <div>
                <Field label="fuel source">
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.fuelSource}
                      onChange={e => set("fuelSource", e.target.value)}
                      style={{
                        ...inputStyle,
                        width: "100%",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                        color: form.fuelSource ? "rgb(51,51,51)" : "rgb(118,118,118)",
                      }}
                    >
                      <option value="" disabled>Select…</option>
                      <option value="gas">Gas</option>
                      <option value="electric">Electric</option>
                      <option value="oil">Oil</option>
                    </select>
                    <span style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      pointerEvents: "none", fontSize: 11, color: "#555",
                    }}>▾</span>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Bubble 3: Yes/No toggles */}
        <div style={bubbleStyle}>
          <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 13, color: "#555", letterSpacing: "0.05em" }}>
            Do you have…
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="a pool?">
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6 }}>
                <span style={yesNoLabel(!form.pool)}>No</span>
                <Toggle checked={form.pool} onChange={v => set("pool", v)} />
                <span style={yesNoLabel(form.pool)}>Yes</span>
              </div>
            </Field>
            <Field label="solar panels?">
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6 }}>
                <span style={yesNoLabel(!form.solarPanels)}>No</span>
                <Toggle checked={form.solarPanels} onChange={v => set("solarPanels", v)} />
                <span style={yesNoLabel(form.solarPanels)}>Yes</span>
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

const yesNoLabel = (active) => ({
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  color: active ? "#4a7c59" : "#999",
  transition: "color 0.2s, font-weight 0.2s",
});

const bubbleStyle = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(1px)",
  WebkitBackdropFilter: "blur(1px)",
  borderRadius: 16,
  padding: "20px 24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const errorStyle = {
  display: "inline-block",
  marginTop: 4,
  fontSize: 12,
  color: "#c0392b",
  background: "rgba(255,235,235,0.92)",
  border: "1px solid #c0392b",
  borderRadius: 99,
  padding: "2px 10px",
};
