import assert from "node:assert/strict";
import test from "node:test";

import { submitAppointmentRequest } from "@/lib/appointment-request-client";

test("returns a user-facing error when the appointment API cannot be reached", async () => {
  const result = await submitAppointmentRequest(
    {
      therapistId: "therapist-1",
      desiredStart: "2030-01-01T10:00",
      durationMinutes: 50,
      message: "Gostaria de agendar.",
    },
    async () => {
      throw new TypeError("Failed to fetch");
    },
  );

  assert.deepEqual(result, {
    ok: false,
    message: "Não foi possível conectar ao servidor. Verifique se o localhost está em execução e tente novamente.",
  });
});
