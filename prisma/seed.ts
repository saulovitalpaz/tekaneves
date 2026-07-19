import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
function getSeedPassword() {
  const value = process.env.SEED_PASSWORD;
  if (!value) throw new Error("SEED_PASSWORD is required to run the seed.");
  return value;
}

const seedPassword = getSeedPassword();

async function upsertUser(email: string, name: string, role: UserRole) {
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash },
  });
}

async function migrateLegacyEmail(oldEmail: string, newEmail: string) {
  const [legacyUser, targetUser] = await Promise.all([
    prisma.user.findUnique({ where: { email: oldEmail } }),
    prisma.user.findUnique({ where: { email: newEmail } }),
  ]);

  if (legacyUser && !targetUser) {
    await prisma.user.update({ where: { id: legacyUser.id }, data: { email: newEmail } });
  }
}

async function main() {
  await migrateLegacyEmail("admin@teka.local", "vitoria@tekaneves.psi");
  await migrateLegacyEmail("vitória@tekaneves.psi", "vitoria@tekaneves.psi");
  await migrateLegacyEmail("terapeuta@teka.local", "marilene@tekaneves.psi");

  const admin = await upsertUser("vitoria@tekaneves.psi", "Vitória Neves da Paz Lima", UserRole.ADMIN);
  const therapist = await upsertUser("marilene@tekaneves.psi", "Marilene Neves da Paz Lima", UserRole.THERAPIST);

  const profile = await prisma.therapistProfile.upsert({
    where: { userId: therapist.id },
    update: { specialty: "Psicanalista", bio: "Acompanhamento cuidadoso para diferentes momentos da vida.", isPrimary: true },
    create: { userId: therapist.id, specialty: "Psicanalista", bio: "Acompanhamento cuidadoso para diferentes momentos da vida.", isPrimary: true },
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

  const existingQuoteSettings = await prisma.homepageQuoteSettings.findFirst();
  if (existingQuoteSettings) {
    await prisma.homepageQuoteSettings.update({
      where: { id: existingQuoteSettings.id },
      data: {
        manualQuoteText: "A escuta cuidadosa ajuda a abrir novos caminhos.",
        manualQuoteAuthor: "Marilene Neves da Paz Lima",
      },
    });
  } else {
    await prisma.homepageQuoteSettings.create({
      data: {
        isQuoteCardVisible: false,
        isAutoGenerateActive: false,
        manualQuoteText: "A escuta cuidadosa ajuda a abrir novos caminhos.",
        manualQuoteAuthor: "Marilene Neves da Paz Lima",
      },
    });
  }

  console.log(`Seeded internal accounts: ${admin.email} and ${therapist.email}`);
}

main().finally(() => prisma.$disconnect());
