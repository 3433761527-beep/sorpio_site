import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import "./extra.css";
import "./dream.css";
import "./progressive.css";
import "./games.css";
import "./cinema.css";
import "./merge.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(console.warn);
  });
