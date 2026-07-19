import { prisma } from "@/lib/db";

const messageRelations = {
  sender: { select: { id: true, name: true } },
  recipient: { select: { id: true, name: true } },
} as const;

export async function listInternalInbox(recipientId: string) {
  return prisma.contactMessage.findMany({
    where: { OR: [{ senderId: recipientId }, { recipientId }] },
    include: messageRelations,
    orderBy: { createdAt: "desc" },
  });
}

export async function listTekaAdminInbox() {
  return prisma.contactMessage.findMany({
    where: {
      OR: [
        { sender: { role: { in: ["ADMIN", "THERAPIST"] } } },
        { recipient: { role: { in: ["ADMIN", "THERAPIST"] } } },
      ],
    },
    include: messageRelations,
    orderBy: { createdAt: "desc" },
  });
}

export async function listInternalConversation(currentUserId: string, partnerId: string) {
  return prisma.contactMessage.findMany({
    where: {
      OR: [
        { senderId: currentUserId, recipientId: partnerId },
        { senderId: partnerId, recipientId: currentUserId },
      ],
    },
    include: messageRelations,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export async function listStaffClientConversation(clientId: string) {
  return prisma.contactMessage.findMany({
    where: {
      OR: [
        { senderId: clientId, recipient: { role: { in: ["ADMIN", "THERAPIST"] } } },
        { recipientId: clientId, sender: { role: { in: ["ADMIN", "THERAPIST"] } } },
      ],
    },
    include: messageRelations,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
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
