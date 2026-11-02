import { useCallback, useEffect, useState } from "react";

import { getCurrentUser } from "../apis/auth.js";
import { getToken, removeToken, saveToken } from "../utils/authStorage.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!getToken()) return;

    let ignore = false;

    getCurrentUser()
      .then((data) => {
        if (!ignore) setUser(data.user);
      })
      .catch((error) => {
        if (ignore) return;

        // 만료된 토큰은 지우고, 일시적인 실패는 토큰을 유지한 채 오류를 보여 준다.
        if (error.status === 401) removeToken();
        else setError(error);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function saveSession(nextUser) {
    saveToken(nextUser.token);
    setUser(nextUser);
  }

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setError(null);
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      if (error.status === 401) logout();
    },
    [logout],
  );

  return (
    <AuthContext
      value={{ user, loading, error, saveSession, logout, handleAuthError }}
    >
      {children}
    </AuthContext>
  );
}
