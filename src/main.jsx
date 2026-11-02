import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";

import "./styles/global.css";

import App from "./App.jsx";
import { worker } from "./mocks/browser.js";
import { queryClient } from "./queryClient.js";

// 모의 API가 준비된 뒤에 앱을 렌더링한다.
worker.start({ onUnhandledRequest: "bypass" }).then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter useTransitions={false}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
