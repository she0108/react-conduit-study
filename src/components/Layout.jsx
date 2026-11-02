import { Outlet } from 'react-router'
import Header from './Header.jsx'
import AuthStatus from './AuthStatus.jsx'
import Footer from './Footer.jsx'
import styles from './Layout.module.css'
export default function Layout() {
  return (
    <div className={styles.layout}>
      <a className={styles.skip} href="#main">
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main">
        <AuthStatus>
          <Outlet />
        </AuthStatus>
      </main>
      <Footer />
    </div>
  )
}
