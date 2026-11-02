import { useCallback, useEffect, useState } from "react";

import { getCurrentUser } from "../apis/auth.js";
import { getToken, removeToken, saveToken } from "../utils/authStorage.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    user: null,
    status: getToken() ? "loading" : "anonymous",
    error: null,
  }));
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!getToken()) return;

    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then(({ user }) => {
        if (!controller.signal.aborted)
          setAuth({ user, status: "authenticated", error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        if (error.status === 401) {
          removeToken();
          setAuth({ user: null, status: "anonymous", error: null });
        } else setAuth({ user: null, status: "error", error });
      });

    return () => controller.abort();
  }, [reloadCount]);

  function saveSession(user) {
    saveToken(user.token);
    setAuth({ user, status: "authenticated", error: null });
  }

  const logout = useCallback(() => {
    removeToken();
    setAuth({ user: null, status: "anonymous", error: null });
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      // 이전 세션의 늦은 401 응답이 새 세션을 로그아웃시키지 않도록 요청 당시 토큰을 비교한다.
      if (error.status === 401 && error.token && error.token === getToken())
        logout();
    },
    [logout],
  );

  function retry() {
    setAuth({ user: null, status: "loading", error: null });
    setReloadCount((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{ ...auth, saveSession, logout, retry, handleAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
