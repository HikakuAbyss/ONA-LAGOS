import { QueryCtx, MutationCtx } from "./_generated/server";

// 1. Unified Response Formatter
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function formatSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null
  };
}

export function formatError(error: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error
  };
}

// 2. Fetch authenticated user identity
export async function getAuthUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: Caller identity could not be verified.");
  }
  return identity;
}

// 3. Role-Based Access Control (RBAC) check helper
export async function verifyUserRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: ("Super Admin" | "Admin" | "Manager" | "Content Editor" | "Reservation Staff" | "User")[]
) {
  // Retrieve authenticated email
  const identity = await getAuthUserIdentity(ctx);
  const email = identity.email;
  if (!email) {
    throw new Error("Access Denied: Authenticated profile lacks a valid email address.");
  }

  // Double check bootstrapped owners for emergency access
  const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
  if (bootstrapped.includes(email.trim().toLowerCase())) {
    return { name: identity.name || "Bootstrap Owner", email, role: "Super Admin" as const };
  }

  // Query users collection in DB
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (!user) {
    throw new Error(`Access Denied: No profile found for email "${email}".`);
  }

  if (user.status === "Suspended") {
    throw new Error("Access Denied: This administrator account has been suspended.");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access Denied: Role "${user.role}" does not possess required privileges.`);
  }

  return user;
}
