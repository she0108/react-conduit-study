import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import "./styles/global.css";

import AuthProvider from "./contexts/AuthProvider.jsx";
import { worker } from "./mocks/browser.js";
import router from "./router.jsx";

// 모의 API가 준비된 뒤에 앱을 렌더링한다.
worker.start({ onUnhandledRequest: "bypass" }).then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  );
});
