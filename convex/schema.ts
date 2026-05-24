import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table: Ona Lifestyle Products Catalog
  onaLifestyleProducts: defineTable({
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
    imageUrl: v.string(), // featured cover thumbnail image
    featuredImage: v.optional(v.string()), // secondary mirror pointer
    galleryImages: v.optional(v.array(v.string())), // extra slide details
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
    seoDescription: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string()
  })
  .index("by_display_order", ["displayOrder"])
  .index("by_publish_status", ["publishStatus"])
});
