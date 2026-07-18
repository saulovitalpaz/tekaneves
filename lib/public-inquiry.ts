export type HomepageInquiryPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  source: "FLUTUANTE" | "CONTATO_INTERNO" | "WHATSAPP";
};

export async function submitHomepageInquiry(payload: HomepageInquiryPayload, fetcher: typeof fetch = fetch) {
  const response = await fetcher("/api/v1/homepage-inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Não foi possível enviar a mensagem.");
  }

  return result.data as { id: string };
}

export function buildWhatsAppUrl(payload: HomepageInquiryPayload) {
  const text = [
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    payload.subject ? `Assunto: ${payload.subject}` : null,
    `Mensagem: ${payload.message}`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/5533987009784?text=${encodeURIComponent(text)}`;
}
