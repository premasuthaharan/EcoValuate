import { useState, useRef, useEffect } from "react";
import { MOCK_SUGGESTIONS, inputStyle, ACCENT_COLOR } from "../constants";

export default function AddressSearch({ onGo }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
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
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <input
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="123 Main St, City, State"
            style={{
              ...inputStyle,
              width: 470,
              paddingRight: query ? 30 : 10,
              background: "rgba(255,255,255,0.85)",
            }}
          />
          {query && (
            <button
              onClick={handleClear}
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
          onClick={() => query.trim() && onGo(query)}
          style={{
            padding: "8px 16px", background: ACCENT_COLOR, color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer",
            fontWeight: 600, fontSize: 13,
          }}
        >Go</button>
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 100, width: 470, overflow: "hidden",
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
  );
}
