import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const seedPassword = process.env.SEED_PASSWORD ?? "TekaLocal2026!";

async function upsertUser(email: string, name: string, role: UserRole) {
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash },
  });
}

async function main() {
  const admin = await upsertUser("admin@teka.local", "Admin Teka", UserRole.ADMIN);
  const therapist = await upsertUser("terapeuta@teka.local", "Teka Neves", UserRole.THERAPIST);
  const client = await upsertUser("cliente@teka.local", "Cliente de Desenvolvimento", UserRole.CLIENT);

  const profile = await prisma.therapistProfile.upsert({
    where: { userId: therapist.id },
    update: { specialty: "Psicoterapia", bio: "Acompanhamento cuidadoso para diferentes momentos da vida." },
    create: { userId: therapist.id, specialty: "Psicoterapia", bio: "Acompanhamento cuidadoso para diferentes momentos da vida." },
  });

  await prisma.availability.deleteMany({ where: { therapistProfileId: profile.id } });
  await prisma.availability.createMany({
    data: [
      { therapistProfileId: profile.id, weekday: 1, startMinutes: 9 * 60, endMinutes: 17 * 60 },
      { therapistProfileId: profile.id, weekday: 2, startMinutes: 9 * 60, endMinutes: 17 * 60 },
      { therapistProfileId: profile.id, weekday: 3, startMinutes: 9 * 60, endMinutes: 17 * 60 },
      { therapistProfileId: profile.id, weekday: 4, startMinutes: 9 * 60, endMinutes: 17 * 60 },
      { therapistProfileId: profile.id, weekday: 5, startMinutes: 9 * 60, endMinutes: 15 * 60 },
    ],
  });

  console.log(`Seeded ${admin.email}, ${therapist.email} and ${client.email}`);
  console.log(`Development password: ${seedPassword}`);
}

main().finally(() => prisma.$disconnect());
