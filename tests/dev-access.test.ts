import assert from "node:assert/strict";
import test from "node:test";
import { developmentAccounts, shouldShowDevelopmentAccess } from "@/lib/dev-access";

test("development access lists the seeded local roles", () => {
  assert.deepEqual(developmentAccounts, [
    { role: "Terapeuta", email: "marilene@tekaneves.psi" },
    { role: "Admin", email: "vitoria@tekaneves.psi" },
  ]);
});

test("development access is hidden in production", () => {
  assert.equal(shouldShowDevelopmentAccess("production"), false);
  assert.equal(shouldShowDevelopmentAccess("development"), true);
});
