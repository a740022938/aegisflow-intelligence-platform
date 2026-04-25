export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
export type TimestampFields = { created_at: string; updated_at: string };
export type PageRequest = { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' };
export type PageResponse<T> = { ok: boolean; data: T[]; total: number; page: number; limit: number; pages: number };

