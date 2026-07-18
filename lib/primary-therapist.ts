import { prisma } from "@/lib/db";

export async function getPrimaryTherapist() {
  return prisma.user.findFirst({
    where: { role: "THERAPIST", therapistProfile: { is: { isPrimary: true } } },
    select: { id: true, name: true, therapistProfile: { select: { specialty: true } } },
  });
}
