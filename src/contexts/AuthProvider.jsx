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

  const setUser = useCallback((user, expectedToken) => {
    if (expectedToken && expectedToken !== getToken()) return false;

    restoreController.current?.abort();
    saveToken(user.token);
    setAuth({ user, status: "authenticated", error: null });

    return true;
  }, []);

  const logout = useCallback(() => {
    restoreController.current?.abort();
    removeToken();
    setAuth({ user: null, status: "anonymous", error: null });
  }, []);

  const handleAuthError = useCallback(
    (error) => {
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
      value={{ ...auth, setUser, logout, retry, handleAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
