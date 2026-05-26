import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. STAFF QUERY: Fetch all event/shoot enquiries (Staff/Admin only)
export const list = query({
  args: {
    type: v.optional(v.string()), // "Private Dining" or "Movie Shoot"
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Contacted"),
        v.literal("Confirmed"),
        v.literal("Approved"),
        v.literal("Cancelled")
      )
    )
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Reservation Staff"]);

      let enqQuery = ctx.db.query("event_enquiries");

      // Apply type filtering efficiently if provided
      if (args.type) {
        enqQuery = enqQuery.withIndex("by_type", (q) => q.eq("type", args.type));
      }

      const list = await enqQuery.collect();

      // Apply status filter if present
      if (args.status) {
        return formatSuccess(list.filter(item => item.status === args.status));
      }

      // Sort by date descending
      return formatSuccess(
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve event enquiries list.");
    }
  }
});

// 2. PUBLIC MUTATION: Submit an event/dining enquiry (accessible to anyone)
export const createPrivateDining = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    guests: v.number(),
    type: v.string(), // "Private Birthday", "Corporate Gala", "Proposal Setup", etc.
    details: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const newEnqId = await ctx.db.insert("event_enquiries", {
        ...args,
        status: "Pending" as const
      });
      return formatSuccess(newEnqId);
    } catch (e: any) {
      return formatError(e.message || "Failed to submit event enquiry.");
    }
  }
});

// 3. PUBLIC MUTATION: Submit a movie/film shoot enquiry (accessible to anyone)
export const createMovieShoot = mutation({
  args: {
    producer: v.string(),
    company: v.string(),
    phone: v.string(),
    email: v.string(),
    shootDate: v.string(),
    durationHours: v.number(),
    crewSize: v.number(),
    shootType: v.string(), // "Movie Scene", "Commercial", "High Fashion", etc.
    description: v.string(),
    budgetEst: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      // Map properties to match event_enquiries schema fields
      const newEnqId = await ctx.db.insert("event_enquiries", {
        name: args.producer,
        email: args.email,
        phone: args.phone,
        date: args.shootDate,
        guests: args.crewSize,
        type: args.shootType, // Marks as shoot category
        company: args.company,
        durationHours: args.durationHours,
        crewSize: args.crewSize,
        shootType: args.shootType,
        description: args.description,
        budgetEst: args.budgetEst,
        details: args.description, // redundancy mapping
        status: "Pending" as const
      });
      return formatSuccess(newEnqId);
    } catch (e: any) {
      return formatError(e.message || "Failed to submit film shoot request.");
    }
  }
});

// 4. STAFF MUTATION: Update enquiry status (Staff/Admin only)
export const updateStatus = mutation({
  args: {
    id: v.id("event_enquiries"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Contacted"),
      v.literal("Confirmed"),
      v.literal("Approved"),
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
      return formatError(e.message || "Failed to update enquiry status.");
    }
  }
});

// 5. ADMIN MUTATION: Delete an enquiry record (Admin/Super Admin only)
export const deleteEnquiry = mutation({
  args: { id: v.id("event_enquiries") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to delete enquiry record.");
    }
  }
});
