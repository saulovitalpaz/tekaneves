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

  assert.equal(siteContent.home.eyebrow, "Psicanalista");
  assert.equal(siteContent.home.title, "Teka Neves");
  assert.match(siteContent.home.description, /psicanalista/i);
  assert.match(source, /id="inicio"/);
  assert.doesNotMatch(source, /home-complement/);
  assert.doesNotMatch(source, /content\.portalLabel/);
  assert.doesNotMatch(siteContent.footer, /desenvolvimento|mock|local/i);
});

test("homepage usa a imagem aprovada como fundo integral do hero", async () => {
  const source = await readFile("components/home-entry.tsx", "utf8");
  const css = await readFile("app/globals.css", "utf8");

  assert.match(source, /src="\/images\/home-background\.png"/);
  assert.match(source, /className="home-entry-background"/);
  assert.match(source, /className="home-entry-media"/);
  assert.match(css, /\.home-entry-media\s*\{[^}]*aspect-ratio: 16 \/ 9/);
  assert.match(css, /\.home-entry-background\s*\{[^}]*object-fit: contain/);
  assert.doesNotMatch(css, /\.home-entry-card\s*\{[^}]*radial-gradient/);
});

test("homepage centraliza o backdrop e esmaece sua extensão inferior", async () => {
  const source = await readFile("components/home-entry.tsx", "utf8");
  const css = await readFile("app/globals.css", "utf8");

  assert.match(source, /className="home-entry-backdrop"/);
  assert.match(css, /\.home-entry-backdrop\s*\{[^}]*background-position: center/);
  assert.match(css, /\.home-entry-backdrop\s*\{[^}]*background-size: cover/);
  assert.match(css, /\.home-entry-backdrop\s*\{[^}]*mask-image: linear-gradient\([^}]*transparent/);
  assert.doesNotMatch(css, /\.home-entry\s*\{[^}]*margin:\s*0;/);
});

test("homepage renders quote card from server data without public external fetch", async () => {
  const [page, card] = await Promise.all([
    readFile("app/page.tsx", "utf8"),
    readFile("components/homepage-quote-card.tsx", "utf8"),
  ]);

  assert.match(page, /getHomepageQuoteCard/);
  assert.match(page, /HomepageQuoteCard/);
  assert.doesNotMatch(card, /useEffect|useState|fetch\(/);
  assert.match(card, /homepage-quote-card/);
});
