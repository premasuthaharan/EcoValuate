import { useState, useRef, useEffect } from "react";
import { MOCK_SUGGESTIONS, inputStyle } from "../constants";

export default function AddressSearch({ onQueryChange, query }) {
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
    onQueryChange(val);
    if (val.length > 1) {
      setSuggestions(MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase())));
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleSelect = (s) => {
    onQueryChange(s);
    setOpen(false);
  };

  const handleClear = () => {
    onQueryChange("");
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Enter your address..."
          style={{
            ...inputStyle,
            fontSize: 15,
            padding: "12px 36px 12px 14px",
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
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 100, width: "100%", overflow: "hidden",
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
