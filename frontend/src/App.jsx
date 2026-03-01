import { useState } from "react";
import GraphPage from "./pages/GraphPage";
import StartPage from "./pages/StartPage";
import InfoPage from "./pages/InfoPage";
import ScorePage from "./pages/ScorePage";
import MapPage from "./pages/MapPage";

export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState(null);
  const [planData, setPlanData] = useState(null);

  if (page === "start") return <StartPage onGo={a => { setAddress(a); setPage("info"); }} />;
  if (page === "info") return <InfoPage address={address} onSubmit={d => { setFormData(d); setPage("score"); }} onBack={() => setPage("start")} />;
  if (page === "score") return <ScorePage formData={formData} onPlanGenerate={inputs => { setPlanData(inputs); setPage("map"); }} onBack={() => setPage("info")} />;
  if (page === "map") return <MapPage planData={planData} onBack={() => setPage("score")} onGraph={() => setPage("graph")} />;
  if (page === "graph") return <GraphPage onBack={() => setPage("map")} />;
}
