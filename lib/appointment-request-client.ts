export type AppointmentRequestPayload = {
  therapistId: FormDataEntryValue | null;
  desiredStart: FormDataEntryValue | null;
  durationMinutes: number;
  message: string;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ApiResponse = {
  data?: { id?: string; status?: string } | null;
  error?: { message?: string } | null;
};

export async function submitAppointmentRequest(
  payload: AppointmentRequestPayload,
  fetcher: FetchLike = fetch,
): Promise<{ ok: true; id?: string } | { ok: false; message: string }> {
  try {
    const response = await fetcher("/api/v1/appointment-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null)) as ApiResponse | null;

    if (!response.ok) {
      return {
        ok: false,
        message: result?.error?.message ?? "Não foi possível solicitar o horário.",
      };
    }

    return { ok: true, id: result?.data?.id };
  } catch {
    return {
      ok: false,
      message: "Não foi possível conectar ao servidor. Verifique se o localhost está em execução e tente novamente.",
    };
  }
}
