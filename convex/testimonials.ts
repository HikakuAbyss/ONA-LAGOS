import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. PUBLIC QUERY: Retrieve dining testimonials (readable by anyone)
export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      const allReviews = await ctx.db.query("testimonials").collect();
      return formatSuccess(allReviews);
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve reviews catalog.");
    }
  }
});

// 2. STAFF/ADMIN MUTATION: Add a new testimonial (Staff/Admin only)
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    comment: v.string(),
    rating: v.number()
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const newReviewId = await ctx.db.insert("testimonials", args);
      return formatSuccess(newReviewId);
    } catch (e: any) {
      return formatError(e.message || "Failed to save dining review.");
    }
  }
});

// 3. ADMIN MUTATION: Delete a testimonial record (Admin/Super Admin only)
export const deleteTestimonial = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to purge review record.");
    }
  }
});
