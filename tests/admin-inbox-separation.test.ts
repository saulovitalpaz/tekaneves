import assert from "node:assert/strict";
import test from "node:test";

import { homepageInquirySourceLabel } from "@/components/homepage-inquiry-list";

test("homepage inquiry labels preserve their distinct source", () => {
  assert.equal(homepageInquirySourceLabel("FLUTUANTE"), "Janela flutuante");
  assert.equal(homepageInquirySourceLabel("CONTATO_INTERNO"), "Contato pelo site");
  assert.equal(homepageInquirySourceLabel("WHATSAPP"), "WhatsApp");
});
