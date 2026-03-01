import { useState, useEffect } from "react";
import { BG_URL3, API_BASE } from "../constants";
import ScoreSlider from "../components/ScoreSlider";
import PlanInputs from "../components/PlanInputs";

const getEmoji = (score) => {
  if (score >= 80) return { face: "😄", label: "Excellent" };
  if (score >= 60) return { face: "🙂", label: "Good" };
  if (score >= 40) return { face: "😐", label: "Fair" };
  if (score >= 20) return { face: "😟", label: "Poor" };
  return { face: "😢", label: "Critical" };
};

export default function ScorePage({ loadData, onPlanGenerate, onBack }) {
  const score = loadData?.data?.past?.eco_score ?? 47;
  const [budget, setBudget] = useState("");
  const [years, setYears] = useState("");
  const [priority, setPriority] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backHover, setBackHover] = useState(false);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (score / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const { face, label } = getEmoji(animatedScore);

  const handleGenerate = async () => {
    const errs = {};
    if (!budget || isNaN(budget) || Number(budget) <= 0)
      errs.budget = "Enter a valid budget";
    if (!years || isNaN(years) || Number(years) <= 0 || Number(years) > 50)
      errs.years = "Enter years (1–50)";
    if (!priority)
      errs.priority = "Select a priority";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const planJson = await fetch(`${API_BASE}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget: Number(budget),
        horizon: Number(years),
        plan_type: priority,
        home_data: loadData.data,
      }),
    }).then(res => res.json());

    setLoading(false);
    if (onPlanGenerate) onPlanGenerate(planJson.plan);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      backgroundImage: `url(${BG_URL3})`,
      backgroundSize: "cover", backgroundPosition: "center 80%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-ui)",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />
      {/* Radial blur — same as StartPage */}
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(1px)",
        maskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 52%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <button
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          position: "absolute", top: 15, left: 15,
          background: "none", border: "none",
          color: backHover ? "#2d5a27" : "#4a7c59",
          fontWeight: 900, fontSize: 20, cursor: "pointer",
          fontFamily: "var(--font-ui)",
          transition: "color 0.15s",
        }}
      >← Back</button>

      {/* Content */}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", gap: 36,
        width: 720,
        marginTop: -160,
      }}>
        {/* Score row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 36, color: "#111", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Your Score:
          </span>
          <span style={{ fontSize: "3.4rem", lineHeight: 1, transition: "all 0.3s ease" }} title={label}>
            {face}
          </span>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
          borderRadius: 16,
          padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          <ScoreSlider animatedScore={animatedScore} score={score} />
        </div>

        <PlanInputs
          budget={budget}
          years={years}
          priority={priority}
          errors={errors}
          onBudgetChange={(v) => { setBudget(v); setErrors(p => ({ ...p, budget: undefined })); }}
          onYearsChange={(v) => { setYears(v); setErrors(p => ({ ...p, years: undefined })); }}
          onPriorityChange={(v) => { setPriority(v); setErrors(p => ({ ...p, priority: undefined })); }}
          onGenerate={handleGenerate}
          loading={loading}
        />
      </div>
    </div>
  );
}
