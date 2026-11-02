import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { followProfile, unfollowProfile } from "../../apis/profiles.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { queryClient } from "../../queryClient.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function FollowButton({ profile }) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      profile.following
        ? unfollowProfile(profile.username)
        : followProfile(profile.username),
    // 프로필과 글 상세의 작성자 정보, 개인 피드를 다시 받는다.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["profile", profile.username],
        }),
        queryClient.invalidateQueries({ queryKey: ["article"] }),
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
      ]),
  });

  if (user?.username === profile.username) return null;

  function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    mutation.mutate();
  }

  return (
    <div>
      <button
        aria-pressed={profile.following}
        className={profile.following ? "primary" : ""}
        disabled={mutation.isPending}
        onClick={handleClick}
      >
        {mutation.isPending
          ? "처리 중…"
          : profile.following
            ? "팔로우 취소"
            : "+ 팔로우"}{" "}
        · {profile.username}
      </button>
      <ErrorMessages error={mutation.error} />
    </div>
  );
}
