import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 1. PUBLIC QUERY: Retrieve all active published products sorted by displayOrder
export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("onaLifestyleProducts")
      .filter((q) => q.eq(q.field("publishStatus"), "Published"))
      .collect();
  }
});

// 2. ADMIN QUERY: Retrieve all products (including Drafts/Unpublished)
export const getAllProductsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("onaLifestyleProducts")
      .collect();
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
    const timestamp = new Date().toISOString();
    const productId = await ctx.db.insert("onaLifestyleProducts", {
      ...args,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    return productId;
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
    const { id, ...fields } = args;
    const timestamp = new Date().toISOString();
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: timestamp
    });
    return id;
  }
});

// 5. ADMIN MUTATION: Delete a lifestyle product
export const deleteProduct = mutation({
  args: { id: v.id("onaLifestyleProducts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  }
});
