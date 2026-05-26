import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. ADMIN QUERY: List all users (Super Admin, Admin, Manager only)
export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager"]);
      const allUsers = await ctx.db.query("users").collect();
      return formatSuccess(allUsers);
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve user catalog.");
    }
  }
});

// 2. MUTATION: Upsert authenticated user profile (self-signup/first-time sync)
export const upsertProfile = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Unauthenticated: Cannot sync profile without identity context.");
      }

      const email = identity.email;
      if (!email) {
        throw new Error("Access Denied: Authenticated account must possess a valid email address.");
      }

      // Check if profile already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      const timestamp = new Date().toISOString();

      if (existingUser) {
        // Update name if changed
        if (existingUser.name !== args.name) {
          await ctx.db.patch(existingUser._id, { name: args.name });
        }
        return formatSuccess({ id: existingUser._id, action: "synced" });
      }

      // First-time profile: Bootstrap Super Admin email validation rules
      const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
      const userRole = bootstrapped.includes(email.trim().toLowerCase()) 
        ? ("Super Admin" as const) 
        : ("User" as const);

      const newUserId = await ctx.db.insert("users", {
        name: args.name,
        email,
        role: userRole,
        status: "Active",
        addedAt: timestamp
      });

      return formatSuccess({ id: newUserId, action: "created", role: userRole });
    } catch (e: any) {
      return formatError(e.message || "Failed to sync user profile.");
    }
  }
});

// 3. ADMIN MUTATION: Modify an admin's role (Super Admin only)
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("Super Admin"),
      v.literal("Admin"),
      v.literal("Manager"),
      v.literal("Content Editor"),
      v.literal("Reservation Staff"),
      v.literal("User")
    )
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin"]);
      
      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) {
        throw new Error("Target user profile does not exist.");
      }

      // Prevent editing bootstrap owner accounts
      const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
      if (bootstrapped.includes(targetUser.email.trim().toLowerCase())) {
        throw new Error("Constraint Violation: Cannot modify bootstrap owner account roles.");
      }

      await ctx.db.patch(args.userId, { role: args.role });
      return formatSuccess(args.userId);
    } catch (e: any) {
      return formatError(e.message || "Failed to update user role.");
    }
  }
});

// 4. ADMIN MUTATION: Toggle administrator account status (Super Admin & Admin only)
export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("Active"), v.literal("Suspended"))
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin"]);

      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) {
        throw new Error("Target user profile does not exist.");
      }

      const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
      if (bootstrapped.includes(targetUser.email.trim().toLowerCase())) {
        throw new Error("Constraint Violation: Cannot suspend bootstrap owner accounts.");
      }

      await ctx.db.patch(args.userId, { status: args.status });
      return formatSuccess(args.userId);
    } catch (e: any) {
      return formatError(e.message || "Failed to update account status.");
    }
  }
});

// 5. ADMIN MUTATION: Delete an administrator profile (Super Admin only)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin"]);

      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) {
        throw new Error("Target user profile does not exist.");
      }

      const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
      if (bootstrapped.includes(targetUser.email.trim().toLowerCase())) {
        throw new Error("Constraint Violation: Cannot purge bootstrap owner accounts.");
      }

      await ctx.db.delete(args.userId);
      return formatSuccess(args.userId);
    } catch (e: any) {
      return formatError(e.message || "Failed to purge administrator account.");
    }
  }
});
