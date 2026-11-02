const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function notBlank(message) {
  return { validate: (value) => value.trim() !== "" || message };
}

export const emailRules = {
  validate: (value) => {
    if (value.trim() === "") return "이메일을 입력해 주세요.";

    return EMAIL_PATTERN.test(value.trim()) || "이메일 형식을 확인해 주세요.";
  },
};
