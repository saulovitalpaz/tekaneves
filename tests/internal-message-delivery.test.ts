import assert from "node:assert/strict";
import test from "node:test";

import { listInternalInbox, listTekaAdminInbox } from "@/lib/internal-messages";
import { prisma } from "@/lib/db";

test("delivers a client message to its therapist and the shared Teka admin inbox", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Cliente", email: `client-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
    prisma.user.create({ data: { name: "Terapeuta", email: `therapist-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
    prisma.user.create({ data: { name: "Admin", email: `admin-${suffix}@test.local`, passwordHash: "hash", role: "ADMIN" } }),
    prisma.user.create({ data: { name: "Outra terapeuta", email: `other-therapist-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
  ]);
  const [client, therapist, admin, otherTherapist] = users;

  try {
    const message = await prisma.contactMessage.create({
      data: {
        senderId: client.id,
        recipientId: therapist.id,
        subject: "Dúvida sobre atendimento",
        body: "Gostaria de confirmar um detalhe.",
      },
    });

    const [therapistInbox, adminInbox, otherTherapistInbox] = await Promise.all([
      listInternalInbox(therapist.id),
      listTekaAdminInbox(),
      listInternalInbox(otherTherapist.id),
    ]);

    assert.ok(therapistInbox.some((item) => item.id === message.id));
    assert.ok(adminInbox.some((item) => item.id === message.id));
    assert.ok(!otherTherapistInbox.some((item) => item.id === message.id));
    assert.equal(admin.role, "ADMIN");
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } });
  }
});
