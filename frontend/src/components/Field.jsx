export default function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#c0392b" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
