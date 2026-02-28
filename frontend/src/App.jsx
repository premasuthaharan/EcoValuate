import { useState } from "react";
import StartPage from "./pages/StartPage";
import InfoPage from "./pages/InfoPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  const [page, setPage] = useState("start");
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState(null);

  if (page === "start") return <StartPage onGo={a => { setAddress(a); setPage("info"); }} />;
  if (page === "info") return <InfoPage address={address} onSubmit={d => { setFormData(d); setPage("results"); }} />;
  if (page === "results") return <ResultsPage data={formData} />;
}
