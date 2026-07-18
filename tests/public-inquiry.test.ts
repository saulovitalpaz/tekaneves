import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "@/app/api/v1/homepage-inquiries/route";
import { prisma } from "@/lib/db";
import { homepageInquirySchema } from "@/lib/validation";

const validPayload = {
  name: "  Ana Silva  ",
  email: "ANA@EXAMPLE.COM",
  subject: "  Primeiro contato  ",
  message: "  Gostaria de saber mais sobre terapia.  ",
  source: "FLUTUANTE",
} as const;

test("accepts a valid FLUTUANTE homepage inquiry payload", () => {
  const parsed = homepageInquirySchema.safeParse(validPayload);

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.source, "FLUTUANTE");
    assert.equal(parsed.data.email, "ana@example.com");
  }
});

test("rejects an unknown homepage inquiry source", () => {
  const parsed = homepageInquirySchema.safeParse({ ...validPayload, source: "OUTRO" });

  assert.equal(parsed.success, false);
});

test("returns VALIDATION_ERROR for a missing or invalid homepage inquiry body", async () => {
  const response = await POST(new Request("http://localhost/api/v1/homepage-inquiries", { method: "POST", body: "{" }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    data: null,
    error: { code: "VALIDATION_ERROR", message: "Confira os campos obrigatórios." },
  });
});

test("stores a valid homepage inquiry through only the HomepageInquiry Prisma delegate", async () => {
  const prismaWithInquiry = prisma as unknown as { homepageInquiry?: { create: (args: { data: unknown }) => Promise<{ id: string }> } };
  const originalDescriptor = Object.getOwnPropertyDescriptor(prismaWithInquiry, "homepageInquiry");
  let createData: unknown;

  Object.defineProperty(prismaWithInquiry, "homepageInquiry", {
    configurable: true,
    value: {
      create: async ({ data }: { data: unknown }) => {
        createData = data;
        return { id: "homepage-inquiry-1" };
      },
    },
  });

  try {
    const response = await POST(new Request("http://localhost/api/v1/homepage-inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    }));

    assert.deepEqual(createData, {
      name: "Ana Silva",
      email: "ana@example.com",
      subject: "Primeiro contato",
      message: "Gostaria de saber mais sobre terapia.",
      source: "FLUTUANTE",
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { data: { id: "homepage-inquiry-1" }, error: null });
  } finally {
    if (originalDescriptor) Object.defineProperty(prismaWithInquiry, "homepageInquiry", originalDescriptor);
    else delete prismaWithInquiry.homepageInquiry;
  }
});
