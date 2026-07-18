import Link from "next/link";
import { Users } from "lucide-react";

import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminClientsPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const clients = await prisma.user.findMany({
    where: user.role === "ADMIN" ? { role: "CLIENT" } : { role: "CLIENT", clientAppointments: { some: { therapistId: user.id } } },
    include: { _count: { select: { clientRequests: true, clientAppointments: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Relacionamentos</p>
          <h1 className="display-font">Clientes</h1>
          <p>Informações essenciais para acompanhar solicitações e consultas.</p>
        </div>
      </div>
      <section className="portal-panel">
        {clients.length ? (
          <div className="portal-list">
            {clients.map((client) => (
              <Link className="list-row" href={`/admin/clientes/${client.id}`} key={client.id}>
                <Users size={22} />
                <div>
                  <strong>{client.name}</strong>
                  <span>{client.email}</span>
                </div>
                <span>{client._count.clientRequests} solicitações · {client._count.clientAppointments} consultas</span>
              </Link>
            ))}
          </div>
        ) : <div className="empty-state"><Users size={34} /><h3>Nenhum cliente cadastrado</h3><p>Novos clientes aparecerão aqui após criar uma conta.</p></div>}
      </section>
    </div>
  );
}
