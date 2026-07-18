import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("homepage quote admin API is protected for admin and therapist roles", async () => {
  const source = await readFile("app/api/v1/admin/homepage-quote/route.ts", "utf8");

  assert.match(source, /getCurrentUser/);
  assert.match(source, /\["ADMIN", "THERAPIST"\]\.includes\(user\.role\)/);
  assert.match(source, /homepageQuoteSettingsSchema/);
  assert.match(source, /updateHomepageQuoteSettings/);
});

test("admin dashboard renders homepage quote settings controls", async () => {
  const [page, form] = await Promise.all([
    readFile("app/admin/page.tsx", "utf8"),
    readFile("components/homepage-quote-settings-form.tsx", "utf8"),
  ]);

  assert.match(page, /HomepageQuoteSettingsForm/);
  assert.match(page, /getHomepageQuoteSettings/);
  assert.match(form, /isQuoteCardVisible/);
  assert.match(form, /isAutoGenerateActive/);
  assert.match(form, /manualQuoteText/);
  assert.match(form, /manualQuoteAuthor/);
  assert.match(form, /\/api\/v1\/admin\/homepage-quote/);
});
