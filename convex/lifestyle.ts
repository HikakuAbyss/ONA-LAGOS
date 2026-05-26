import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUserRole, formatSuccess, formatError } from "./helpers";

// 1. PUBLIC QUERY: Retrieve all active published products sorted by displayOrder
export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    try {
      const list = await ctx.db
        .query("onaLifestyleProducts")
        .withIndex("by_publish_status", (q) => q.eq("publishStatus", "Published"))
        .collect();
      
      // Sort by displayOrder ascending
      return formatSuccess(list.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve published products catalog.");
    }
  }
});

// 2. ADMIN QUERY: Retrieve all products (including Drafts/Unpublished)
export const getAllProductsAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const allProducts = await ctx.db.query("onaLifestyleProducts").collect();
      return formatSuccess(allProducts.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (e: any) {
      return formatError(e.message || "Failed to retrieve administrative products catalog.");
    }
  }
});

// 3. ADMIN MUTATION: Add a new lifestyle product
export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    category: v.union(
      v.literal("Merchandise"),
      v.literal("Food Product"),
      v.literal("Drink Product"),
      v.literal("Gift Item"),
      v.literal("Home & Lifestyle"),
      v.literal("Limited Edition"),
      v.literal("Other")
    ),
    description: v.string(),
    imageUrl: v.string(),
    featuredImage: v.optional(v.string()),
    galleryImages: v.optional(v.array(v.string())),
    price: v.number(),
    discountPrice: v.union(v.number(), v.null()),
    stockStatus: v.union(
      v.literal("In Stock"),
      v.literal("Low Stock"),
      v.literal("Out of Stock"),
      v.literal("Preorder")
    ),
    quantityAvailable: v.union(v.number(), v.null()),
    featured: v.boolean(),
    publishStatus: v.union(
      v.literal("Draft"),
      v.literal("Published"),
      v.literal("Unpublished")
    ),
    displayOrder: v.number(),
    tags: v.array(v.string()),
    ctaType: v.union(
      v.literal("Order via WhatsApp"),
      v.literal("Enquire Now"),
      v.literal("Coming Soon"),
      v.literal("View Details")
    ),
    ctaLink: v.string(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const timestamp = new Date().toISOString();
      const productId = await ctx.db.insert("onaLifestyleProducts", {
        ...args,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return formatSuccess(productId);
    } catch (e: any) {
      return formatError(e.message || "Failed to create lifestyle product.");
    }
  }
});

// 4. ADMIN MUTATION: Update an existing lifestyle product
export const updateProduct = mutation({
  args: {
    id: v.id("onaLifestyleProducts"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("Merchandise"),
        v.literal("Food Product"),
        v.literal("Drink Product"),
        v.literal("Gift Item"),
        v.literal("Home & Lifestyle"),
        v.literal("Limited Edition"),
        v.literal("Other")
      )
    ),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    galleryImages: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    discountPrice: v.optional(v.union(v.number(), v.null())),
    stockStatus: v.optional(
      v.union(
        v.literal("In Stock"),
        v.literal("Low Stock"),
        v.literal("Out of Stock"),
        v.literal("Preorder")
      )
    ),
    quantityAvailable: v.optional(v.union(v.number(), v.null())),
    featured: v.optional(v.boolean()),
    publishStatus: v.optional(
      v.union(
        v.literal("Draft"),
        v.literal("Published"),
        v.literal("Unpublished")
      )
    ),
    displayOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    ctaType: v.optional(
      v.union(
        v.literal("Order via WhatsApp"),
        v.literal("Enquire Now"),
        v.literal("Coming Soon"),
        v.literal("View Details")
      )
    ),
    ctaLink: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      const { id, ...fields } = args;
      const timestamp = new Date().toISOString();
      await ctx.db.patch(id, {
        ...fields,
        updatedAt: timestamp
      });
      return formatSuccess(id);
    } catch (e: any) {
      return formatError(e.message || "Failed to update lifestyle product.");
    }
  }
});

// 5. ADMIN MUTATION: Delete a lifestyle product
export const deleteProduct = mutation({
  args: { id: v.id("onaLifestyleProducts") },
  handler: async (ctx, args) => {
    try {
      await verifyUserRole(ctx, ["Super Admin", "Admin", "Manager", "Content Editor"]);
      await ctx.db.delete(args.id);
      return formatSuccess(args.id);
    } catch (e: any) {
      return formatError(e.message || "Failed to purge lifestyle product.");
    }
  }
});
