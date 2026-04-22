export type RoleColor = 'exec' | 'train' | 'data' | 'gov' | 'risk' | 'knowledge';

export const ROLE_CLASS: Record<RoleColor, string> = {
  exec: 'role-exec',
  train: 'role-train',
  data: 'role-data',
  gov: 'role-gov',
  risk: 'role-risk',
  knowledge: 'role-knowledge',
};

export function roleClass(role: RoleColor): string {
  return ROLE_CLASS[role];
}
