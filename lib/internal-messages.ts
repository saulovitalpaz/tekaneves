import { prisma } from "@/lib/db";

const messageRelations = {
  sender: { select: { id: true, name: true } },
  recipient: { select: { id: true, name: true } },
} as const;

export async function listInternalInbox(recipientId: string) {
  return prisma.contactMessage.findMany({
    where: { recipientId },
    include: messageRelations,
    orderBy: { createdAt: "desc" },
  });
}

export async function listTekaAdminInbox() {
  return prisma.contactMessage.findMany({
    where: { recipient: { role: "THERAPIST" } },
    include: messageRelations,
    orderBy: { createdAt: "desc" },
  });
}

type MessagingScope = {
  id: string;
  role: "ADMIN" | "THERAPIST" | "CLIENT";
};

export async function listClientMessageRecipients(user: MessagingScope) {
  if (user.role === "CLIENT") return [];

  return prisma.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}
