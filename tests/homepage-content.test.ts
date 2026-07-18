import assert from "node:assert/strict";
import test from "node:test";
import { siteContent } from "@/lib/content";

test("homepage navigation keeps the public journey anchors", () => {
  assert.deepEqual(
    siteContent.navigation.map((item) => item.href),
    ["#acompanhamento", "#para-quem", "#sobre", "#contato"],
  );
});

test("homepage entry uses the approved about copy and contact CTA", () => {
  assert.equal(siteContent.about.eyebrow, "Sobre mim");
  assert.equal(siteContent.about.title, "Escuta atenta, cuidado e respeito pelo seu tempo.");
  assert.equal(siteContent.about.paragraphs.length, 2);
  assert.equal(siteContent.about.ctaHref, "#contato");
  assert.equal(siteContent.about.imagePriority, true);
});

test("support content no longer defines a homepage card grid", () => {
  assert.equal("areas" in siteContent.support, false);
});
