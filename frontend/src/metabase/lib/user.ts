export function getFullName(user: NamedUser): string | null {
  const firstName = user.first_name?.trim() || "";
  const lastName = user.last_name?.trim() || "";
  return [firstName, lastName].join(" ").trim() || null;
}

export interface NamedUser {
  first_name?: string;
  last_name?: string;
  email?: string;
}
