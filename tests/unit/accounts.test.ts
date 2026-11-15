import { describe, expect, it } from "vitest";
import { changePasswordSchema, changeUsernameSchema, loginSchema, normalizeUsername, usernameSchema } from "@/lib/validation";

describe("staff usernames", () => {
  it("normalizes to lowercase and trims", () => {
    expect(normalizeUsername("  Younes.Admin ")).toBe("younes.admin");
    expect(usernameSchema.parse("  ADMIN_1 ")).toBe("admin_1");
  });

  it("accepts the initial owner username and rejects unsafe ones", () => {
    expect(usernameSchema.safeParse("12345678").success).toBe(true);
    for (const bad of ["ab", "a".repeat(33), "has space", "émoji", "x;drop", "a@b.c"]) {
      expect(usernameSchema.safeParse(bad).success, bad).toBe(false);
    }
  });

  it("login takes a username or an email", () => {
    expect(loginSchema.safeParse({ identifier: "12345678", password: "12345678" }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: "owner@example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: "  ", password: "x" }).success).toBe(false);
  });
});

describe("own credential changes", () => {
  it("username change needs the current password", () => {
    expect(changeUsernameSchema.safeParse({ username: "younes", currentPassword: "" }).success).toBe(false);
    expect(changeUsernameSchema.safeParse({ username: "younes", currentPassword: "12345678" }).success).toBe(true);
  });

  it("new password: 8+ chars, confirmed, different from the current one", () => {
    const ok = { currentPassword: "12345678", newPassword: "Kids-2026-safe", confirm: "Kids-2026-safe" };
    expect(changePasswordSchema.safeParse(ok).success).toBe(true);
    const short = changePasswordSchema.safeParse({ ...ok, newPassword: "short", confirm: "short" });
    expect(short.success).toBe(false);
    const mismatch = changePasswordSchema.safeParse({ ...ok, confirm: "other-value" });
    expect(!mismatch.success && mismatch.error.issues[0].message).toBe("mismatch");
    const same = changePasswordSchema.safeParse({ currentPassword: "12345678", newPassword: "12345678", confirm: "12345678" });
    expect(!same.success && same.error.issues[0].message).toBe("same");
  });
});
