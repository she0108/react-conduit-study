import { useCallback, useEffect, useRef, useState } from "react";

import { getCurrentUser } from "../apis/auth.js";
import { getToken, removeToken, saveToken } from "../utils/authStorage.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    user: null,
    status: getToken() ? "loading" : "anonymous",
    error: null,
  }));
  const [attempt, setAttempt] = useState(0);

  const restoreController = useRef(null);

  useEffect(() => {
    if (!getToken()) return;

    const controller = new AbortController();

    restoreController.current = controller;
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
  }, [attempt]);

  const startSession = useCallback((user) => {
    restoreController.current?.abort();
    saveToken(user.token);
    setAuth({ user, status: "authenticated", error: null });
  }, []);

  const updateCurrentUser = useCallback(
    (user, expectedToken) => {
      // 저장 요청 도중 로그아웃하거나 계정이 바뀌면 이전 응답으로 세션을 복원하지 않는다.
      if (!expectedToken || expectedToken !== getToken()) return false;

      startSession(user);
      return true;
    },
    [startSession],
  );

  const logout = useCallback(() => {
    restoreController.current?.abort();
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
    setAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        startSession,
        updateCurrentUser,
        logout,
        retry,
        handleAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
