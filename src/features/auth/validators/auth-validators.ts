import type { FieldErrors, LoginData, RegisterData } from "@/types/auth";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string) {
  if (!EMAIL.test(email) || email.length > 255) return "Введите корректный email";
}

export function validateLogin(data: LoginData): FieldErrors<LoginData> {
  const errors: FieldErrors<LoginData> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  if (!data.password) errors.password = "Введите пароль";
  else if (data.password.length > 128) errors.password = "Не более 128 символов";
  return errors;
}
export function validateRegister(data: RegisterData): FieldErrors<RegisterData> {
  const errors: FieldErrors<RegisterData> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  if (data.password.length < 8 || data.password.length > 128 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) errors.password = "Пароль: 8–128 символов, минимум одна буква и цифра";
  return errors;
}
