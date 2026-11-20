import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_SCHOOL_KEY, getSchool, isSchoolKey, SCHOOLS } from "@/demo/config/school";
import { fill } from "@/demo/lib/text";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("white-label config", () => {
  it("names the school only in the config file", () => {
    const config = join("src", "demo", "config", "school.ts");
    const school = SCHOOLS[DEFAULT_SCHOOL_KEY];
    const hits = files("src")
      .filter((f) => f !== config)
      .filter((f) => {
        const text = readFileSync(f, "utf8");
        return text.includes(school.name) || new RegExp(`\\b${school.shortName}\\b`).test(text);
      })
      .map((f) => relative(".", f));
    expect(hits).toEqual([]);
  });

  it("only accepts allow-listed school keys", () => {
    expect(isSchoolKey("gla")).toBe(true);
    expect(isSchoolKey("sample")).toBe(true);
    expect(isSchoolKey("__proto__")).toBe(false);
    expect(isSchoolKey("constructor")).toBe(false);
    expect(isSchoolKey("other")).toBe(false);
    expect(getSchool("other").key).toBe(DEFAULT_SCHOOL_KEY);
  });

  it("fills school placeholders", () => {
    expect(fill("{short} at {school}", getSchool("sample"))).toBe("Northfield at Northfield Academy");
  });
});
