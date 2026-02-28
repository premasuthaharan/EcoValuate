import { useState, useRef, useEffect } from "react";

const MOCK_SUGGESTIONS = [
  "123 Main St, San Francisco, CA 94105",
  "456 Oak Ave, Los Angeles, CA 90001",
  "789 Pine Rd, Seattle, WA 98101",
  "321 Elm St, Austin, TX 73301",
  "654 Maple Dr, Denver, CO 80201",
  "987 Cedar Ln, Portland, OR 97201",
  "111 Birch Blvd, Chicago, IL 60601",
  "222 Walnut Way, New York, NY 10001",
];

const BG_URL = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80";
const BG_URL2 = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "#4a7c59" : "#ccc",
        cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: checked ? 23 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#c0392b" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(255,255,255,0.7)",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: "#333",
};

// ── Start Page ────────────────────────────────────────────────────────────────
function StartPage({ onGo }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    setSelected("");
    if (val.length > 1) {
      setSuggestions(MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase())));
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleSelect = (s) => {
    setQuery(s);
    setSelected(s);
    setOpen(false);
  };

  const handleGo = () => {
    if (query.trim()) onGo(selected || query);
  };

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(255,255,255,0.15)",
      }} />
      <div style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: -1, margin: 0 }}>
          EcoValuate
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <label style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>Enter your address</label>
          <div ref={ref} style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <input
                  value={query}
                  onChange={e => handleChange(e.target.value)}
                  placeholder="123 Main St, City, State"
                  style={{
                    ...inputStyle,
                    width: 280,
                    paddingRight: query ? 30 : 10,
                    background: "rgba(255,255,255,0.85)",
                  }}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setSelected(""); setSuggestions([]); setOpen(false); }}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "#555", border: "none", borderRadius: "50%",
                      width: 16, height: 16, cursor: "pointer", color: "#fff",
                      fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 0,
                    }}
                  >✕</button>
                )}
              </div>
              <button
                onClick={handleGo}
                style={{
                  padding: "8px 16px", background: "#222", color: "#fff",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  fontWeight: 600, fontSize: 13,
                }}
              >Go</button>
            </div>
            {open && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                zIndex: 100, width: 280, overflow: "hidden",
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(s)}
                    style={{
                      padding: "10px 14px", fontSize: 13, cursor: "pointer",
                      borderBottom: i < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                      color: "#333",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >{s}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Info Page ─────────────────────────────────────────────────────────────────
function InfoPage({ address, onSubmit }) {
  const [form, setForm] = useState({
    address, sqft: "", yearBuilt: "", pool: false,
    lat: "", lon: "", solarPanels: false,
    stories: "", fuelSource: "", other: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      width: "100%", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL2})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.2)" }} />
      <div style={{
        position: "relative",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        padding: "32px 36px 28px",
        width: 480,
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <h2 style={{ margin: "0 0 24px", color: "#2d5a27", fontWeight: 700, fontSize: 22 }}>
          your house details
        </h2>

        {error && <p style={{ color: "#c0392b", fontSize: 13, margin: "-12px 0 16px" }}>{error}</p>}

        <div style={{ display: "grid", gap: 18 }}>
          {/* Address — full width */}
          <Field label="address" required>
            <input
              value={form.address}
              onChange={e => set("address", e.target.value)}
              style={inputStyle}
            />
          </Field>

          {/* Row: sqft | year built | pool */}
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

          {/* Row: lat | lon | solar */}
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

          {/* Row: stories | fuel source | other */}
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
    </div>
  );
}

// ── Results Placeholder ───────────────────────────────────────────────────────
function ResultsPage({ data }) {
  return (
    <div style={{
      width: "100%", height: "100vh",
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

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState(null);

  if (page === "start") return <StartPage onGo={a => { setAddress(a); setPage("info"); }} />;
  if (page === "info") return <InfoPage address={address} onSubmit={d => { setFormData(d); setPage("results"); }} />;
  if (page === "results") return <ResultsPage data={formData} />;
}