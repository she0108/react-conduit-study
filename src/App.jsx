import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="article/:slug" element={<ArticlePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {['profile/:username', 'profile/:username/favorites'].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <section className="container page">
                <h1>Conduit</h1>
                <p>화면을 준비하고 있습니다.</p>
              </section>
            }
          />
        ))}
        <Route element={<ProtectedRoute />}>
          <Route path="editor" element={<EditorPage />} />
          <Route path="editor/:slug" element={<EditorPage />} />
          {['settings'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <section className="container page">
                  <h1>Conduit</h1>
                  <p>화면을 준비하고 있습니다.</p>
                </section>
              }
            />
          ))}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
