export default function PageCard({ bgUrl, bgPosition = "center 80%", width = 660, children }) {
  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover", backgroundPosition: bgPosition,
        filter: "blur(1px)", transform: "scale(1.05)",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.2)" }} />
      <div style={{
        position: "relative",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(1px)",
        WebkitBackdropFilter: "blur(1px)",
        borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        width,
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {children}
      </div>
    </div>
  );
}
