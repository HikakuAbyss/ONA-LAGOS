import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. PUBLIC QUERY: Retrieve a configuration block by key (readable by anyone)
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    try {
      const setting = await ctx.db
        .query("admin_settings")
        .withIndex("by_key", (q) => q.eq("key", args.key))
        .unique();
      return formatSuccess(setting ? setting.data : null);
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve configuration settings.");
    }
  }
});

// 2. STAFF/ADMIN MUTATION: Overwrite a configuration block by key (Staff/Admin only)
export const setByKey = mutation({
  args: {
    key: v.string(),
    data: v.any()
  },
  handler: async (ctx, args) => {
    try {
      // Content Editor can edit settings/CMS content, Staff can edit operational coordinates
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor", "Reservation Staff"]);

      const existing = await ctx.db
        .query("admin_settings")
        .withIndex("by_key", (q) => q.eq("key", args.key))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { data: args.data });
        return formatSuccess({ id: existing._id, action: "updated" });
      } else {
        const newSettingsId = await ctx.db.insert("admin_settings", {
          key: args.key,
          data: args.data
        });
        return formatSuccess({ id: newSettingsId, action: "created" });
      }
    } catch (e: any) {
      return formatError(e.message || "Failed to save configuration settings.");
    }
  }
});
