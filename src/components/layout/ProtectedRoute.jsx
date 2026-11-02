import { Navigate, Outlet, useLocation } from "react-router";

import { useCurrentUser } from "../../hooks/useCurrentUser.js";

export default function ProtectedRoute() {
  const { user } = useCurrentUser();
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
}
