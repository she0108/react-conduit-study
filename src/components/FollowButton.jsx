import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { followProfile } from "../apis/profiles.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "./ErrorMessages.jsx";

export default function FollowButton({ profile, onChange }) {
  const { user, handleAuthError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  if (user?.username === profile.username) return null;

  async function handleClick() {
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const data = await followProfile(profile.username, profile.following);

      onChange(data.profile);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        aria-pressed={profile.following}
        className={profile.following ? "primary" : ""}
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? "처리 중…" : profile.following ? "팔로우 취소" : "+ 팔로우"}{" "}
        · {profile.username}
      </button>
      <ErrorMessages error={error} />
    </div>
  );
}
