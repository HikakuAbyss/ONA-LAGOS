import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. PUBLIC QUERY: Retrieve gallery items (readable by anyone)
export const getItems = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("food"),
        v.literal("drinks"),
        v.literal("interior"),
        v.literal("outdoor"),
        v.literal("guests"),
        v.literal("events"),
        v.literal("chef")
      )
    )
  },
  handler: async (ctx, args) => {
    try {
      let galleryQuery = ctx.db.query("gallery_items");
      const list = await galleryQuery.collect();

      if (args.category) {
        return formatSuccess(list.filter(item => item.category === args.category));
      }

      return formatSuccess(list);
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve visual gallery catalog.");
    }
  }
});

// 2. STAFF/ADMIN MUTATION: Add a new gallery item
export const createItem = mutation({
  args: {
    category: v.union(
      v.literal("food"),
      v.literal("drinks"),
      v.literal("interior"),
      v.literal("outdoor"),
      v.literal("guests"),
      v.literal("events"),
      v.literal("chef")
    ),
    title: v.string(),
    image: v.string()
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const newItemId = await ctx.db.insert("gallery_items", args);
      return formatSuccess(newItemId);
    } catch (e: any) {
      return formatError(e.message || "Failed to publish gallery card.");
    }
  }
});

// 3. STAFF/ADMIN MUTATION: Update an existing gallery item
export const updateItem = mutation({
  args: {
    id: v.id("gallery_items"),
    category: v.optional(
      v.union(
        v.literal("food"),
        v.literal("drinks"),
        v.literal("interior"),
        v.literal("outdoor"),
        v.literal("guests"),
        v.literal("events"),
        v.literal("chef")
      )
    ),
    title: v.optional(v.string()),
    image: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const { id, ...fields } = args;
      await ctx.db.patch(id, fields);
      return formatSuccess(id);
    } catch (e: any) {
      return formatError(e.message || "Failed to edit gallery card.");
    }
  }
});

// 4. STAFF/ADMIN MUTATION: Delete a gallery item
export const deleteItem = mutation({
  args: { id: v.id("gallery_items") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to delete gallery card.");
    }
  }
});
