import { useState } from "react";
import StartPage from "./pages/StartPage";
import InfoPage from "./pages/InfoPage";
import ScorePage from "./pages/ScorePage";

export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState(null);

  if (page === "start") return <StartPage onGo={a => { setAddress(a); setPage("info"); }} />;
  if (page === "info") return <InfoPage address={address} onSubmit={d => { setFormData(d); setPage("score"); }} />;
  if (page === "score") return <ScorePage formData={formData} onPlanGenerate={inputs => console.log("Plan inputs:", inputs)} />;
}
