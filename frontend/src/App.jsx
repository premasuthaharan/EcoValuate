import { useState } from "react";
import { API_BASE } from "./constants";
import GraphPage from "./pages/GraphPage";
import StartPage from "./pages/StartPage";
import InfoPage from "./pages/InfoPage";
import ScorePage from "./pages/ScorePage";
import MapPage from "./pages/MapPage";

export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [loadData, setLoadData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setPage("info");
  }

  if (page === "start") return <StartPage onGo={handleGo} loading={loading} />;
  if (page === "info") return <InfoPage address={address} loadData={loadData} onSubmit={(d, past, updatedHomeData) => { setFormData(d); setLoadData(prev => ({ ...prev, data: { ...updatedHomeData, past } })); setPage("score"); }} onBack={() => setPage("start")} />;
  if (page === "score") return <ScorePage formData={formData} loadData={loadData} onPlanGenerate={future => { const next = { ...loadData, data: { ...loadData.data, future } }; setPlanData(future); setLoadData(next); setPage("map"); }} onBack={() => setPage("info")} />;
  if (page === "map") return <MapPage planData={planData} onBack={() => setPage("score")} onGraph={() => setPage("graph")} />;
  if (page === "graph") return <GraphPage loadData={loadData} onBack={() => setPage("map")} />;
}
