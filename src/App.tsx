import { useEffect, useState } from "react";
import { ReturningWall } from "./signup/components/ReturningWall.tsx";
import { SignupWall } from "./signup/components/SignupWall.tsx";

type View = "new" | "returning";
const fromHash = (): View => (location.hash === "#/returning" ? "returning" : "new");

/**
 * Demo shell. The New/Returning switcher exists only so reviewers can try both
 * flows; in production the platform decides which one to show.
 */
export function App() {
  const [view, setView] = useState<View>(fromHash);

  useEffect(() => {
    const onHash = () => setView(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (v: View) => {
    location.hash = v === "returning" ? "#/returning" : "#/";
    setView(v);
  };

  return (
    <>
      <nav className="demo-switch" aria-label="Demo view">
        <span className="demo-switch-label">Demo view</span>
        <div role="tablist" className="demo-tabs">
          <button role="tab" aria-selected={view === "new"} onClick={() => go("new")}>New student</button>
          <button role="tab" aria-selected={view === "returning"} onClick={() => go("returning")}>Returning student</button>
        </div>
      </nav>
      {view === "new" ? <SignupWall key="new" onSeeReturning={() => go("returning")} /> : <ReturningWall key="ret" onSignUp={() => go("new")} />}
    </>
  );
}
