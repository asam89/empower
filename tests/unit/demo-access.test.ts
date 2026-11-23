import { describe, expect, it } from "vitest";
import { DEMO_ACCESS_DURATION_MS, codesMatch, createDemoToken, verifyDemoToken } from "@/lib/demo-access";

describe("demo access cookie", () => {
  it("accepts a token signed with the current code", async () => {
    const token = await createDemoToken("code-1");
    expect(await verifyDemoToken(token, "code-1")).toBe(true);
  });

  it("rejects tokens after the code changes, after expiry, or when tampered with", async () => {
    const now = Date.now();
    const token = await createDemoToken("code-1", now);
    expect(await verifyDemoToken(token, "code-2", now)).toBe(false);
    expect(await verifyDemoToken(token, "code-1", now + DEMO_ACCESS_DURATION_MS + 1)).toBe(false);
    const [, sig] = token.split(".");
    expect(await verifyDemoToken(`${now + 10 * DEMO_ACCESS_DURATION_MS}.${sig}`, "code-1", now)).toBe(false);
    expect(await verifyDemoToken("garbage", "code-1")).toBe(false);
  });

  it("compares codes exactly", async () => {
    expect(await codesMatch("abc", "abc")).toBe(true);
    expect(await codesMatch("abc", "abd")).toBe(false);
    expect(await codesMatch("", "abc")).toBe(false);
  });
});
