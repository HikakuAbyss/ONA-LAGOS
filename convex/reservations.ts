import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. STAFF QUERY: Fetch all reservation entries sorted by date
export const list = query({
  args: {
    date: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Confirmed"),
        v.literal("Seated"),
        v.literal("Cancelled")
      )
    )
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Reservation Staff"]);
      
      let resQuery = ctx.db.query("reservations");
      
      // If a specific date is requested, filter efficiently
      if (args.date) {
        resQuery = resQuery.withIndex("by_date", (q) => q.eq("date", args.date));
      }
      
      const list = await resQuery.collect();
      
      // Apply status filter if present
      if (args.status) {
        return formatSuccess(list.filter(item => item.status === args.status));
      }
      
      // Default: Sort by date descending
      return formatSuccess(
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve reservation log.");
    }
  }
});

// 2. PUBLIC MUTATION: Submit a new guest reservation request (accessible to anyone)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.string(),
    guests: v.number(),
    type: v.string(), // "Sunday Roast" or "Standard Dining"
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      // Validate guest size
      if (args.guests <= 0) {
        throw new Error("Validation Error: Guest count must be greater than zero.");
      }

      const newResId = await ctx.db.insert("reservations", {
        ...args,
        status: "Pending" as const
      });

      return formatSuccess(newResId);
    } catch (e: any) {
      return formatError(e.message || "Failed to submit booking request.");
    }
  }
});

// 3. STAFF MUTATION: Update reservation status (Staff/Admin only)
export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Confirmed"),
      v.literal("Seated"),
      v.literal("Cancelled")
    ),
    internalNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Reservation Staff"]);
      
      const { id, ...fields } = args;
      await ctx.db.patch(id, fields);
      
      return formatSuccess(id);
    } catch (e: any) {
      return formatError(e.message || "Failed to update reservation status.");
    }
  }
});

// 4. ADMIN MUTATION: Delete a reservation record (Admin/Super Admin only)
export const deleteReservation = mutation({
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to purge reservation record.");
    }
  }
});
