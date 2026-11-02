import { Link, NavLink } from 'react-router'
import styles from './Header.module.css'
export default function Header() {
  return (
    <header>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          conduit
        </Link>
        <nav aria-label="주 메뉴">
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/login">로그인</NavLink>
          <NavLink to="/register">회원가입</NavLink>
        </nav>
      </div>
    </header>
  )
}
