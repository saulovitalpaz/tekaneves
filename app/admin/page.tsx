import Link from "next/link";
import { HomepageQuoteSettingsForm } from "@/components/homepage-quote-settings-form";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { getHomepageQuoteSettings } from "@/lib/homepage-quote";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const requestWhere = user.role === "ADMIN" ? {} : { therapistId: user.id };
  const [pending, today, internalUnread, homepageUnread, quoteSettings] = await Promise.all([
    prisma.appointmentRequest.count({ where: { ...requestWhere, status: "PENDING" } }),
    prisma.appointment.count({ where: { ...requestWhere, status: "CONFIRMED", startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
    prisma.contactMessage.count({ where: user.role === "ADMIN" ? { recipient: { role: "THERAPIST" }, readAt: null } : { recipientId: user.id, readAt: null } }),
    prisma.homepageInquiry.count({ where: { readAt: null } }),
    getHomepageQuoteSettings(),
  ]);
  return <div><div className="portal-heading"><div><p className="eyebrow">Painel administrativo</p><h1 className="display-font">Olá, {user.name.split(" ")[0]}.</h1><p>Uma visão simples da agenda e dos retornos pendentes.</p></div><Link className="button-primary" href="/admin/agenda">Abrir agenda</Link></div><div className="dashboard-grid"><article className="data-card"><span>Solicitações pendentes</span><strong>{pending}</strong><small>Precisam de decisão</small></article><article className="data-card"><span>Consultas hoje</span><strong>{today}</strong><small>Compromissos confirmados</small></article><article className="data-card"><span>Mensagens de pacientes novas</span><strong>{internalUnread}</strong><small>Contato assíncrono interno</small></article><article className="data-card"><span>Contatos da homepage novos</span><strong>{homepageUnread}</strong><small>Formulários públicos não lidos</small></article></div><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Homepage</p><h2 className="display-font">Card de frase</h2></div></div><HomepageQuoteSettingsForm settings={quoteSettings} /></section></div>;
}
