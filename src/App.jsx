import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
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
        {[
          'login',
          'register',
          'article/:slug',
          'editor',
          'editor/:slug',
          'profile/:username',
          'profile/:username/favorites',
          'settings',
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
