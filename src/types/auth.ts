export type Role = { id: string; name: string };
export type User = { id: string; email: string; roles: Role[] };
export type LoginData = { email: string; password: string };
export type RegisterData = LoginData;
export type FieldErrors<T> = Partial<Record<keyof T, string>>;
