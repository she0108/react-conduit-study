import { useState } from "react";
import { useNavigate } from "react-router";

import { followProfile, unfollowProfile } from "../../apis/profiles.js";
import { useAuthStore } from "../../stores/authStore.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function FollowButton({ profile, onChange }) {
  const { user } = useCurrentUser();
  const handleAuthError = useAuthStore((state) => state.handleAuthError);
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  if (user?.username === profile.username) return null;

  async function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const data = profile.following
        ? await unfollowProfile(profile.username)
        : await followProfile(profile.username);

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
