import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <section className="container page">
              <h1>conduit</h1>
              <p>생각을 나누고, 함께 배우는 공간.</p>
            </section>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {[
          'article/:slug',
          'profile/:username',
          'profile/:username/favorites',
        ].map((path) => (
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
          {['editor', 'editor/:slug', 'settings'].map((path) => (
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
