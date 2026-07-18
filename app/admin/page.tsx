import Link from "next/link";
import { CalendarDays, MessageCircle, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const requestWhere = user.role === "ADMIN" ? {} : { therapistId: user.id };
  const [pending, today, internalUnread, homepageUnread] = await Promise.all([
    prisma.appointmentRequest.count({ where: { ...requestWhere, status: "PENDING" } }),
    prisma.appointment.count({ where: { ...requestWhere, status: "CONFIRMED", startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
    prisma.contactMessage.count({ where: user.role === "ADMIN" ? { recipient: { role: "THERAPIST" }, readAt: null } : { recipientId: user.id, readAt: null } }),
    prisma.homepageInquiry.count({ where: { readAt: null } }),
  ]);
  return <div><div className="portal-heading"><div><p className="eyebrow">Painel administrativo</p><h1 className="display-font">Olá, {user.name.split(" ")[0]}.</h1><p>Uma visão simples da agenda e dos retornos pendentes.</p></div><Link className="button-primary" href="/admin/agenda">Abrir agenda</Link></div><div className="dashboard-grid"><article className="data-card"><span>Solicitações pendentes</span><strong>{pending}</strong><small>Precisam de decisão</small></article><article className="data-card"><span>Consultas hoje</span><strong>{today}</strong><small>Compromissos confirmados</small></article><article className="data-card"><span>Mensagens de pacientes novas</span><strong>{internalUnread}</strong><small>Contato assíncrono interno</small></article><article className="data-card"><span>Contatos da homepage novos</span><strong>{homepageUnread}</strong><small>Formulários públicos não lidos</small></article></div><section className="portal-panel quick-links"><Link href="/admin/agenda"><CalendarDays size={22} /><span><strong>Organizar agenda</strong><small>Disponibilidades e solicitações</small></span></Link><Link href="/admin/clientes"><UserRound size={22} /><span><strong>Ver clientes</strong><small>Informações essenciais para cuidar</small></span></Link><Link href="/admin/mensagens"><MessageCircle size={22} /><span><strong>Responder mensagens</strong><small>Retornos vinculados ao atendimento</small></span></Link></section></div>;
}
