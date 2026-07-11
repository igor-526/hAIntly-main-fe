export type LoginData = { email: string; password: string };
export type RegisterData = { email: string; password: string };
export type Role = { id: string; name: string };
export type User = { id: string; email: string; roles: Role[] };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;
