import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. STAFF QUERY: Fetch all contact mailbox messages (Staff/Admin only)
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Unread"), v.literal("Read"), v.literal("Replied")))
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Reservation Staff"]);

      let msgQuery = ctx.db.query("contact_messages");

      if (args.status) {
        msgQuery = msgQuery.withIndex("by_status", (q) => q.eq("status", args.status));
      }

      const list = await msgQuery.collect();

      // Sort by date descending
      return formatSuccess(
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve mailbox messages.");
    }
  }
});

// 2. PUBLIC MUTATION: Send a message via contact form (accessible to anyone)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format to match frontend
      const newMsgId = await ctx.db.insert("contact_messages", {
        ...args,
        date: timestamp,
        status: "Unread" as const
      });
      return formatSuccess(newMsgId);
    } catch (e: any) {
      return formatError(e.message || "Failed to transmit message.");
    }
  }
});

// 3. STAFF MUTATION: Mark message status (Staff/Admin only)
export const updateStatus = mutation({
  args: {
    id: v.id("contact_messages"),
    status: v.union(v.literal("Unread"), v.literal("Read"), v.literal("Replied"))
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Reservation Staff"]);
      await ctx.db.patch(args.id, { status: args.status });
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to update message status.");
    }
  }
});

// 4. ADMIN MUTATION: Delete a message record (Admin/Super Admin only)
export const deleteMessage = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to purge mailbox message.");
    }
  }
});
