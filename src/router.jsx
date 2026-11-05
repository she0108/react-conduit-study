import { createBrowserRouter } from "react-router";

import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "article/:slug", element: <ArticlePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "profile/:username", element: <ProfilePage /> },
      {
        path: "profile/:username/favorites",
        element: <ProfilePage favorites />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "editor", element: <EditorPage /> },
          { path: "editor/:slug", element: <EditorPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
