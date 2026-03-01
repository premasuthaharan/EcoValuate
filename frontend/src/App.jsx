import { useState } from "react";
import { API_BASE, BG_URL, BG_URL2, BG_URL3, BG_URL4, BG_URL5 } from "./constants";
import GraphPage from "./pages/GraphPage";
import StartPage from "./pages/StartPage";
import InfoPage from "./pages/InfoPage";
import ScorePage from "./pages/ScorePage";
import MapPage from "./pages/MapPage";

const PAGE_BG = {
  start: BG_URL,
  info:  BG_URL2,
  score: BG_URL3,
  map:   BG_URL4,
  graph: BG_URL5,
};

const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
  });
};

export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [loadData, setLoadData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeBackground = async (nextPage) => {
    const nextImage = PAGE_BG[nextPage];
    if (nextImage) await preloadImage(nextImage);
    setPage(nextPage);
  };

  async function handleGo(a) {
    setAddress(a);
    setLoading(true);
    const json = await fetch(`${API_BASE}/api/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: a }),
    }).then(res => res.json());
    setLoadData(json);
    setLoading(false);
    await changeBackground("info");
  }

  if (page === "start") return <StartPage onGo={handleGo} loading={loading} />;
  if (page === "info") return <InfoPage address={address} loadData={loadData} onSubmit={(d, past, updatedHomeData) => { setFormData(d); setLoadData(prev => ({ ...prev, data: { ...updatedHomeData, past } })); changeBackground("score"); }} onBack={() => changeBackground("start")} />;
  if (page === "score") return <ScorePage formData={formData} loadData={loadData} onPlanGenerate={future => { const next = { ...loadData, data: { ...loadData.data, future } }; setPlanData(future); setLoadData(next); changeBackground("map"); }} onBack={() => changeBackground("info")} />;
  if (page === "map") return <MapPage planData={planData} onBack={() => changeBackground("score")} onGraph={() => changeBackground("graph")} />;
  if (page === "graph") return <GraphPage loadData={loadData} onBack={() => changeBackground("map")} />;
}
