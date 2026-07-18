import assert from "node:assert/strict";
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
