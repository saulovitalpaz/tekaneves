import { z } from "zod";

const email = z.string().trim().email("Informe um email válido").toLowerCase();
const password = z.string().min(8, "A senha deve ter pelo menos 8 caracteres");
const isoDate = z.coerce.date({ invalid_type_error: "Informe uma data válida" });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  email,
  password,
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Informe sua senha") });

const availabilityFieldsSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(1439),
  endMinutes: z.number().int().min(1).max(1440),
  timezone: z.string().min(1).default("America/Sao_Paulo"),
  isActive: z.boolean().default(true),
});

function hasValidAvailabilityRange(value: { startMinutes: number; endMinutes: number }) {
  return value.endMinutes > value.startMinutes;
}

export const availabilitySchema = availabilityFieldsSchema
  .extend({ therapistId: z.string().cuid() })
  .refine(hasValidAvailabilityRange, { message: "O fim deve ser depois do início", path: ["endMinutes"] });

export const availabilityUpdateSchema = availabilityFieldsSchema
  .refine(hasValidAvailabilityRange, { message: "O fim deve ser depois do início", path: ["endMinutes"] });

export const appointmentRequestSchema = z.object({
  therapistId: z.string().cuid(),
  desiredStart: isoDate,
  durationMinutes: z.number().int().min(30).max(120).default(50),
  message: z.string().trim().min(1, "Escreva uma mensagem breve").max(1000, "A mensagem deve ter até 1000 caracteres"),
});

export const appointmentDecisionSchema = z.object({
  status: z.enum(["CONFIRMED", "DECLINED", "PROPOSED"]),
  confirmedStart: isoDate.optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

export const appointmentSummaryBodySchema = z.object({
  body: z.string().trim().min(1, "Escreva um resumo breve").max(4000, "O resumo deve ter até 4000 caracteres"),
});

export const appointmentStatusUpdateSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export const contactMessageSchema = z.object({
  recipientId: z.string().cuid(),
  appointmentRequestId: z.string().cuid().optional(),
  appointmentId: z.string().cuid().optional(),
  subject: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
});

const manualAppointmentBaseSchema = z.object({
  therapistId: z.string().cuid(),
  startAt: isoDate,
  durationMinutes: z.number().int().min(30).max(120).default(50),
  note: z.string().trim().max(1000).optional(),
});

export const registeredAppointmentCreateSchema = manualAppointmentBaseSchema.extend({
  mode: z.literal("REGISTERED"),
  clientId: z.string().cuid(),
});

export const preRegisteredAppointmentCreateSchema = manualAppointmentBaseSchema.extend({
  mode: z.literal("PRE_REGISTERED"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
});

export const adminAppointmentCreateSchema = z.discriminatedUnion("mode", [
  registeredAppointmentCreateSchema,
  preRegisteredAppointmentCreateSchema,
]);

export const preRegistrationLinkSchema = z.object({
  clientId: z.string().cuid(),
});

export const homepageQuoteSettingsSchema = z.object({
  isQuoteCardVisible: z.boolean(),
  isAutoGenerateActive: z.boolean(),
  manualQuoteText: z.string().trim().min(3, "Escreva uma frase").max(240, "A frase deve ter até 240 caracteres"),
  manualQuoteAuthor: z.string().trim().min(2, "Informe o autor").max(80, "O autor deve ter até 80 caracteres"),
});

export const homepageInquirySchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email,
  subject: z.string().trim().min(1).max(120).optional(),
  message: z.string().trim().min(1, "Escreva uma mensagem breve").max(2000),
  source: z.enum(["FLUTUANTE", "CONTATO_INTERNO", "WHATSAPP"]),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
