"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type HomepageQuoteSettingsFormProps = {
  settings: {
    isQuoteCardVisible: boolean;
    isAutoGenerateActive: boolean;
    manualQuoteText: string;
    manualQuoteAuthor: string;
  };
};

export function HomepageQuoteSettingsForm({ settings }: HomepageQuoteSettingsFormProps) {
  const router = useRouter();
  const [isQuoteCardVisible, setIsQuoteCardVisible] = useState(settings.isQuoteCardVisible);
  const [isAutoGenerateActive, setIsAutoGenerateActive] = useState(settings.isAutoGenerateActive);
  const [manualQuoteText, setManualQuoteText] = useState(settings.manualQuoteText);
  const [manualQuoteAuthor, setManualQuoteAuthor] = useState(settings.manualQuoteAuthor);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);

    const response = await fetch("/api/v1/admin/homepage-quote", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isQuoteCardVisible, isAutoGenerateActive, manualQuoteText, manualQuoteAuthor }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(true);
      setFeedback(result.error?.message ?? "Não foi possível salvar o card.");
      return;
    }

    setFeedback("Card da homepage atualizado.");
    router.refresh();
  }

  return (
    <form className="homepage-quote-settings-form" onSubmit={submit}>
      <label className="toggle-field">
        <input type="checkbox" checked={isQuoteCardVisible} onChange={(event) => setIsQuoteCardVisible(event.target.checked)} />
        <span>Exibir card na homepage</span>
      </label>
      <label className="toggle-field">
        <input type="checkbox" checked={isAutoGenerateActive} onChange={(event) => setIsAutoGenerateActive(event.target.checked)} />
        <span>Gerar frase automaticamente a cada hora</span>
      </label>
      <label>Frase manual
        <textarea value={manualQuoteText} onChange={(event) => setManualQuoteText(event.target.value)} required minLength={3} maxLength={240} />
      </label>
      <label>Autor
        <input value={manualQuoteAuthor} onChange={(event) => setManualQuoteAuthor(event.target.value)} required minLength={2} maxLength={80} />
      </label>
      {feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}
      <button className="button-primary" type="submit">Salvar card</button>
    </form>
  );
}
