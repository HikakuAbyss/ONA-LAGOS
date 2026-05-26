import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Users table (Admin/Staff profiles)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("Super Admin"),
      v.literal("Admin"),
      v.literal("Manager"),
      v.literal("Content Editor"),
      v.literal("Reservation Staff"),
      v.literal("User")
    ),
    status: v.union(v.literal("Active"), v.literal("Suspended")),
    addedAt: v.string()
  })
  .index("by_email", ["email"]),

  // 2. Menu Items table (Gastronomy catalog)
  menu_items: defineTable({
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
  }),

  // 3. Gallery Items table (Visual atmosphere cards)
  gallery_items: defineTable({
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
  }),

  // 4. Event & Shoot Enquiries table
  event_enquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    guests: v.number(),
    type: v.string(), // e.g. "Corporate Gala", "Movie Scene"
    status: v.union(
      v.literal("Pending"),
      v.literal("Contacted"),
      v.literal("Confirmed"),
      v.literal("Approved"),
      v.literal("Cancelled")
    ),
    details: v.string(),
    company: v.optional(v.string()),
    durationHours: v.optional(v.number()),
    crewSize: v.optional(v.number()),
    shootType: v.optional(v.string()),
    description: v.optional(v.string()),
    budgetEst: v.optional(v.string()),
    internalNotes: v.optional(v.string())
  })
  .index("by_type", ["type"])
  .index("by_status", ["status"]),

  // 5. Contact Messages table (Guest inbox)
  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    date: v.string(),
    status: v.union(v.literal("Unread"), v.literal("Read"), v.literal("Replied"))
  })
  .index("by_status", ["status"]),

  // 6. Admin Settings table (CMS state and branding keys)
  admin_settings: defineTable({
    key: v.string(), // "cms_config", "cms_draft", "content_catalog_draft", "content_catalog_published", "operational"
    data: v.any()
  })
  .index("by_key", ["key"]),

  // 7. Reservations table (Dining table sessions)
  reservations: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.string(),
    guests: v.number(),
    type: v.string(), // "Sunday Roast" or "Standard Dining"
    status: v.union(
      v.literal("Pending"),
      v.literal("Confirmed"),
      v.literal("Seated"),
      v.literal("Cancelled")
    ),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string())
  })
  .index("by_date", ["date"])
  .index("by_status", ["status"]),

  // 8. Testimonials table (Client reviews)
  testimonials: defineTable({
    name: v.string(),
    role: v.string(),
    comment: v.string(),
    rating: v.number()
  }),

  // 9. Ona Lifestyle Products Catalog table
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
    seoDescription: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string()
  })
  .index("by_display_order", ["displayOrder"])
  .index("by_publish_status", ["publishStatus"])
});
