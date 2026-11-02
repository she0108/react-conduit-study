import { startTransition } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import styles from './Header.module.css'
export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function handleLogout() {
    startTransition(() => {
      logout()
      navigate('/', { replace: true })
    })
  }
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
          {user ? (
            <>
              <NavLink to="/editor">새 글 쓰기</NavLink>
              <NavLink to="/settings">설정</NavLink>
              <NavLink
                to={`/profile/${encodeURIComponent(user.username)}`}
                className={styles.profile}
                title={user.username}
              >
                {user.username}
              </NavLink>
              <button className={styles.logout} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">로그인</NavLink>
              <NavLink to="/register">회원가입</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
