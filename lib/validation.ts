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

export const availabilitySchema = z.object({
  therapistId: z.string().cuid(),
  weekday: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(1439),
  endMinutes: z.number().int().min(1).max(1440),
  timezone: z.string().min(1).default("America/Sao_Paulo"),
  isActive: z.boolean().default(true),
}).refine((value) => value.endMinutes > value.startMinutes, { message: "O fim deve ser depois do início", path: ["endMinutes"] });

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

export const contactMessageSchema = z.object({
  recipientId: z.string().cuid(),
  appointmentRequestId: z.string().cuid().optional(),
  appointmentId: z.string().cuid().optional(),
  subject: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
});

export const homepageInquirySchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email,
  subject: z.string().trim().min(1).max(120).optional(),
  message: z.string().trim().min(1, "Escreva uma mensagem breve").max(2000),
  source: z.enum(["FLUTUANTE", "CONTATO_INTERNO", "WHATSAPP"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
