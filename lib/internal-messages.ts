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
