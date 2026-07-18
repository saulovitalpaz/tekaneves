import assert from "node:assert/strict";
import test from "node:test";

import { availabilityUpdateSchema } from "@/lib/validation";

test("rejeita disponibilidade cujo fim não sucede o início", () => {
  const result = availabilityUpdateSchema.safeParse({ weekday: 1, startMinutes: 1020, endMinutes: 540, timezone: "America/Sao_Paulo", isActive: true });
  assert.equal(result.success, false);
});

test("aceita uma janela válida para edição", () => {
  const result = availabilityUpdateSchema.safeParse({ weekday: 1, startMinutes: 540, endMinutes: 1020, timezone: "America/Sao_Paulo", isActive: true });
  assert.equal(result.success, true);
});
