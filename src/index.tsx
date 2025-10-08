import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/global.css";
import App from "./app/App.tsx";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
