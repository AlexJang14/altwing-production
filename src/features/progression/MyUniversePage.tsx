import posthog, {
  isPostHogConfigured,
} from "../../posthog";

import MyUniversePanel from "./MyUniversePanel";
import PlanetShelf from './PlanetShelf';
import ProjectProgress from "../projects/ProjectProgress";
import GuidanceVault from "../guidance/GuidanceVault";
import "../guidance/guidance.css";

import "./my-universe-page.css";

interface MyUniversePageProps {
  onBack: () => void;
  onStartMission: () => void;
}

function MyUniversePage({
  onBack,
  onStartMission,
}: MyUniversePageProps) {
  return (
    <main className="universe-page">
      <section className="module-toolbar">
        <button
          type="button"
          onClick={onBack}
        >
          ← Home
        </button>



        <button
          type="button"
          onClick={() => {
            if (isPostHogConfigured) {
              posthog.capture(
                "explore_another_wing_clicked",
                {
                  source: "my_universe",
                },
              );
            }

            onStartMission();
          }}
        >
          Explore Engineering →
        </button>
      </section>

      <section className="universe-page-hero">
        <span>
          05 · MY UNIVERSE
        </span>

        <h1>
          Your Work. Your Growth.
          <br />
          Your Proof.
        </h1>

        <h2 className="aw-first-subtitle">See how far you've come.</h2>
        <p>
          Revisit your missions, projects, decisions, and achievements. Every step is part of your story.
        </p>
      </section>

      <nav className="aw-universe-shortcuts" aria-label="My Universe shortcuts">{[{label:'Packs & planets',id:'universe-rewards'},{label:'My project records',id:'universe-projects'},{label:'Saved colleges & programs',id:'universe-saved'}].map(item=><button key={item.id} type="button" onClick={()=>document.getElementById(item.id)?.scrollIntoView({behavior:'smooth',block:'start'})}>{item.label} ↓</button>)}</nav>
      <div className="universe-page-content">
        <PlanetShelf />
        <MyUniversePanel />
        <div id="universe-projects"><ProjectProgress /></div>
        <div id="universe-saved"><GuidanceVault /></div>
      </div>
    </main>
  );
}

export default MyUniversePage;
