import { Link, NavLink } from "react-router";

import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { useLogoutToHome } from "../../hooks/useLogoutToHome.js";

import styles from "./Header.module.css";

export default function Header() {
  const { user } = useCurrentUser();
  const logoutToHome = useLogoutToHome();

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
              <NavLink
                to={`/profile/${encodeURIComponent(user.username)}`}
                className={styles.profile}
                title={user.username}
              >
                {user.username}
              </NavLink>
              <button className={styles.logout} onClick={logoutToHome}>
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
  );
}
