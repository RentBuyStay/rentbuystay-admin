/* Demo administrators (swap for admin GET /admin/administrators). UI-first. */

export type AdminRole = "Admin 1" | "Admin 2" | "Auditor";

export const ADMIN_ROLES: AdminRole[] = ["Admin 1", "Admin 2", "Auditor"];

export const ROLE_COLOR: Record<AdminRole, string> = {
  "Admin 1": "#305E82",
  "Admin 2": "#305E82",
  Auditor: "#8A38F5",
};

export type Admin = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminRole;
  added: string;
};

export const ADMINS: Admin[] = [
  { id: "a1", name: "Tunde Adeyemi", firstName: "Tunde", lastName: "Adeyemi", email: "tundeade@gmail.com", phone: "+234 803 456 7890", role: "Admin 1", added: "15 May 2025" },
  { id: "a2", name: "Chinedu Nwosu", firstName: "Chinedu", lastName: "Nwosu", email: "chinedu.nwosu@example.com", phone: "+234 810 682 2927", role: "Admin 2", added: "15 May 2025" },
  { id: "a3", name: "Bola Adebayo", firstName: "Bola", lastName: "Adebayo", email: "bola.adebayo@example.com", phone: "+234 805 123 4567", role: "Auditor", added: "15 May 2025" },
  { id: "a4", name: "Amara Chukwu", firstName: "Amara", lastName: "Chukwu", email: "amara.chukwu@example.com", phone: "+234 811 987 6543", role: "Admin 1", added: "15 May 2025" },
  { id: "a5", name: "Ikenna Okeke", firstName: "Ikenna", lastName: "Okeke", email: "ikenna.okeke@example.com", phone: "+234 901 234 5678", role: "Admin 1", added: "15 May 2025" },
];

export const getAdmin = (id: string) => ADMINS.find((a) => a.id === id);

export function adminInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
