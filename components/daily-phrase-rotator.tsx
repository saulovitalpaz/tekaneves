"use client";

import { useEffect, useState } from "react";

type DailyPhrase = { id: string; text: string };

type DailyPhraseRotatorProps = {
  phrases: readonly DailyPhrase[];
};

export function DailyPhraseRotator({ phrases }: DailyPhraseRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % phrases.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [phrases.length]);

  const activePhrase = phrases[activeIndex] ?? phrases[0];

  if (!activePhrase) return null;

  return (
    <div className="hero-note" aria-live="polite" data-phrase-id={activePhrase.id}>
      {activePhrase.text}
    </div>
  );
}
