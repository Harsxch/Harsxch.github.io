import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SignupWall } from "./signup/components/SignupWall.tsx";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SignupWall />
  </StrictMode>,
);
