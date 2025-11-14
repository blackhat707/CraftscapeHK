import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import { AppContextProvider } from "./contexts/AppContext.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AppContextProvider>
          <ConvexAuthProvider client={convex}>
            <App />
          </ConvexAuthProvider>
        </AppContextProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
);
