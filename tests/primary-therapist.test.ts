import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "@/lib/db";
import { getPrimaryTherapist } from "@/lib/primary-therapist";

test("returns only the marked primary therapist and nothing when no primary profile exists", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const existingPrimaryProfiles = await prisma.therapistProfile.findMany({
    where: { isPrimary: true },
    select: { id: true },
  });
  await prisma.therapistProfile.updateMany({
    where: { id: { in: existingPrimaryProfiles.map((profile) => profile.id) } },
    data: { isPrimary: false },
  });
  const therapists = await Promise.all([
    prisma.user.create({
      data: {
        name: "Terapeuta principal",
        email: `primary-${suffix}@test.local`,
        passwordHash: "hash",
        role: "THERAPIST",
        therapistProfile: { create: { specialty: "Psicoterapia", isPrimary: true } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Outra terapeuta",
        email: `other-${suffix}@test.local`,
        passwordHash: "hash",
        role: "THERAPIST",
        therapistProfile: { create: { specialty: "Psicologia", isPrimary: false } },
      },
    }),
  ]);

  try {
    const primaryTherapist = await getPrimaryTherapist();

    assert.deepEqual(primaryTherapist, {
      id: therapists[0].id,
      name: "Terapeuta principal",
      therapistProfile: { specialty: "Psicoterapia" },
    });

    await prisma.therapistProfile.update({
      where: { userId: therapists[0].id },
      data: { isPrimary: false },
    });

    assert.equal(await getPrimaryTherapist(), null);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: therapists.map((therapist) => therapist.id) } } });
    await prisma.therapistProfile.updateMany({
      where: { id: { in: existingPrimaryProfiles.map((profile) => profile.id) } },
      data: { isPrimary: true },
    });
  }
});
