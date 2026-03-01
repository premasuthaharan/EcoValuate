export const MOCK_SUGGESTIONS = [
  "123 Main St, San Francisco, CA 94105",
  "67 Sixty-Seventh Ave, New York, NY 6767",
  "456 Oak Ave, Los Angeles, CA 90001",
  "789 Pine Rd, Seattle, WA 98101",
  "321 Elm St, Austin, TX 73301",
  "654 Maple Dr, Denver, CO 80201",
  "987 Cedar Ln, Portland, OR 97201",
  "111 Birch Blvd, Chicago, IL 60601",
  "222 Walnut Way, New York, NY 10001",
  "22 Modesto, Irvine, CA 92602",
];

export const TIMELINE = [
  {
    year: 2026,
    steps: [
      { id: 1, text: "Install 7 solar panels" },
      { id: 2, text: "Switch to LED lighting" },
      { id: 3, text: "Add attic insulation" },
    ],
  },
  {
    year: 2027,
    steps: [
      { id: 4, text: "Replace gas stove with induction" },
      { id: 5, text: "Install smart thermostat" },
      { id: 6, text: "Add EV charger to garage" },
    ],
  },
  {
    year: 2028,
    steps: [
      { id: 7, text: "Install heat pump system" },
      { id: 8, text: "Add rainwater collection" },
      { id: 9, text: "Plant native garden" },
    ],
  },
  {
    year: 2029,
    steps: [
      { id: 10, text: "Install battery storage" },
      { id: 11, text: "Upgrade to energy-star appliances" },
    ],
  },
];

export const TREES_PER_STEP = 3;

export const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "https://ecovaluate.onrender.com";

export const ACCENT_COLOR = "#593a2a";
export const DARK_GREEN_COLOR = "#4a7c59";

export const BG_URL = "/bg1.png";
export const BG_URL2 = "/bg2.png";
export const BG_URL3 = "/bg3.png";
export const BG_URL4 = "/bg4.png";

export const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(255,255,255,0.7)",
  fontSize: 13,
  fontFamily: "var(--font-ui)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: "#333",
};
