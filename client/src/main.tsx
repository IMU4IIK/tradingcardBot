import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TelegramProvider } from "./lib/telegram";

createRoot(document.getElementById("root")!).render(
  <TelegramProvider>
    <App />
  </TelegramProvider>
);
