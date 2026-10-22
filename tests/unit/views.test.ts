import { describe, expect, it } from "vitest";
import { PARENT_CHILD_ID } from "@/demo/config/school";
import { STUDENTS } from "@/demo/fixtures/students";
import { resolveView, visibleStudents } from "@/demo/lib/views";

describe("role views", () => {
  it("always resolves the Parent role to their own child", () => {
    const visible = visibleStudents("parent", STUDENTS);
    expect(visible.map((s) => s.id)).toEqual([PARENT_CHILD_ID]);
    for (const [view, id] of [["student", "hana-k"], ["roster", null], ["dashboard", null], [null, null], ["student", PARENT_CHILD_ID]] as const) {
      expect(resolveView("parent", view, id, visible)).toEqual({ view: "parent", studentId: PARENT_CHILD_ID });
    }
  });

  it("falls back to the role's first view for unknown or disallowed views", () => {
    expect(resolveView("teacher", "value", null, STUDENTS).view).toBe("dashboard");
    expect(resolveView("principal", "nope", null, STUDENTS).view).toBe("dashboard");
    expect(resolveView("sert", "student", "missing", STUDENTS).view).toBe("roster");
    expect(resolveView("sert", "student", "hana-k", STUDENTS)).toEqual({ view: "student", studentId: "hana-k" });
  });
});
