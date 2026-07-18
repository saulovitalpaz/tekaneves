export const developmentAccounts = [
  { role: "Terapeuta", email: "marilene@tekaneves.psi" },
  { role: "Admin", email: "vitoria@tekaneves.psi" },
] as const;

export function shouldShowDevelopmentAccess(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv !== "production";
}
