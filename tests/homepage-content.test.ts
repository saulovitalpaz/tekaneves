import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { siteContent } from "@/lib/content";

test("homepage navigation uses the public routes", () => {
  assert.deepEqual(
    siteContent.navigation.map((item) => item.href),
    ["/contato", "/entrar"],
  );
  assert.equal(siteContent.brand.descriptor, "Psicanalista");
});

test("homepage profile image is prioritized", () => {
  assert.equal(siteContent.home.imagePriority, true);
});

test("homepage mantém apenas o início sem chamada redundante de contato", async () => {
  const source = await readFile("components/home-entry.tsx", "utf8");

  assert.equal(siteContent.home.eyebrow, "Psicoterapia para universitários");
  assert.equal(siteContent.home.contactLabel, "Conhecer o acompanhamento");
  assert.match(source, /id="inicio"/);
  assert.doesNotMatch(source, /home-complement/);
  assert.doesNotMatch(source, /content\.portalLabel/);
});

test("homepage usa foto de perfil menor mesclada ao background clean verde", async () => {
  const css = await readFile("app/globals.css", "utf8");

  assert.match(css, /\.home-entry-card\s*\{[^}]*radial-gradient/);
  assert.match(css, /\.home-profile\s*\{[^}]*max-width: min\(42vw, 520px\)/);
  assert.match(css, /\.home-profile::before/);
  assert.match(css, /\.home-profile-image\s*\{[^}]*mix-blend-mode: multiply/);
});
