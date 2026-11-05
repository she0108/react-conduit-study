import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";

import "./styles/global.css";

import { worker } from "./mocks/browser.js";
import { queryClient } from "./queryClient.js";
import router from "./router.jsx";

// 모의 API가 준비된 뒤에 앱을 렌더링한다.
worker.start({ onUnhandledRequest: "bypass" }).then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
