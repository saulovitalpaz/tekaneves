"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { PublicInquiryForm } from "./public-inquiry-form";

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = "floating-contact-dialog-title";

  function closeDialog() {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!isOpen) return;

    dialogRef.current?.querySelector<HTMLInputElement>("input[name='name']")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDialog();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button ref={triggerRef} type="button" className="floating-contact" aria-label="Falar comigo" aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
        <MessageCircle size={19} aria-hidden="true" />
        <span>Falar comigo</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={dialogTitleId} className="soft-panel w-full max-w-lg">
            <div className="flex items-start justify-between gap-4">
              <div><p className="eyebrow">Contato</p><h2 id={dialogTitleId} className="display-font section-heading">Como podemos ajudar?</h2></div>
              <button type="button" onClick={closeDialog} aria-label="Fechar mensagem" className="button-secondary"><X size={18} aria-hidden="true" /></button>
            </div>
            <PublicInquiryForm variant="compact" />
          </div>
        </div>
      )}
    </>
  );
}
