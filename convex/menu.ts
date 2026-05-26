import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. PUBLIC QUERY: Fetch all culinary menu items (readable by anyone)
export const getItems = query({
  args: {
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      let itemsQuery = ctx.db.query("menu_items");
      const list = await itemsQuery.collect();
      
      if (args.category && args.category !== "All") {
        const lowerCat = args.category.toLowerCase();
        return formatSuccess(
          list.filter((item) => 
            item.categories.some(c => c.toLowerCase() === lowerCat)
          )
        );
      }
      
      return formatSuccess(list);
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve culinary menu catalog.");
    }
  }
});

// 2. ADMIN MUTATION: Add a new culinary menu item
export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.string(),
    categories: v.array(v.string()),
    dietary: v.object({
      isVegetarian: v.optional(v.boolean()),
      isVegan: v.optional(v.boolean()),
      isGlutenFree: v.optional(v.boolean()),
      isSpicy: v.optional(v.boolean()),
      hasNuts: v.optional(v.boolean()),
      isKidsFriendly: v.optional(v.boolean()),
      isMild: v.optional(v.boolean())
    }),
    image: v.string()
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const newItemId = await ctx.db.insert("menu_items", args);
      return formatSuccess(newItemId);
    } catch (e: any) {
      return formatError(e.message || "Failed to create menu item.");
    }
  }
});

// 3. ADMIN MUTATION: Update an existing menu item
export const updateItem = mutation({
  args: {
    id: v.id("menu_items"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    dietary: v.optional(
      v.object({
        isVegetarian: v.optional(v.boolean()),
        isVegan: v.optional(v.boolean()),
        isGlutenFree: v.optional(v.boolean()),
        isSpicy: v.optional(v.boolean()),
        hasNuts: v.optional(v.boolean()),
        isKidsFriendly: v.optional(v.boolean()),
        isMild: v.optional(v.boolean())
      })
    ),
    image: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const { id, ...fields } = args;
      await ctx.db.patch(id, fields);
      return formatSuccess(id);
    } catch (e: any) {
      return formatError(e.message || "Failed to edit menu item.");
    }
  }
});

// 4. ADMIN MUTATION: Delete a culinary menu item
export const deleteItem = mutation({
  args: { id: v.id("menu_items") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to delete menu item.");
    }
  }
});
