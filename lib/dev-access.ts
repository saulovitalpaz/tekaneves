export const developmentAccounts = [
  { role: "Paciente", email: "cliente@teka.local" },
  { role: "Terapeuta", email: "terapeuta@teka.local" },
  { role: "Admin", email: "admin@teka.local" },
] as const;

export function shouldShowDevelopmentAccess(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv !== "production";
}
