import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// LocalizedString schema for multilingual content
const localizedString = v.object({
  zh: v.string(),
  en: v.string(),
});

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  
  // Traditional crafts data
  crafts: defineTable({
    craftId: v.number(), // Original ID from constants
    name: localizedString,
    artisan: localizedString,
    short_description: localizedString,
    full_description: localizedString,
    images: v.array(v.string()),
    history: localizedString,
    story: localizedString,
    category: v.optional(v.string()),
  }).index("by_craftId", ["craftId"]),

  // Cultural events and workshops
  events: defineTable({
    eventId: v.number(), // Original ID from constants
    title: localizedString,
    date: v.string(),
    time: localizedString,
    location: localizedString,
    description: localizedString,
    organizer: v.string(),
    organizer_icon: v.string(),
    image: v.string(),
    region: v.union(v.literal("港島"), v.literal("九龍"), v.literal("新界"), v.literal("線上")),
    type: v.union(v.literal("工作坊"), v.literal("展覽"), v.literal("講座")),
    isFeatured: v.optional(v.boolean()),
    url: v.string(),
  }).index("by_eventId", ["eventId"])
    .index("by_region", ["region"])
    .index("by_type", ["type"])
    .index("by_featured", ["isFeatured"]),

  // Marketplace products
  products: defineTable({
    productId: v.number(), // Original ID from constants
    name: localizedString,
    price: v.number(),
    priceDisplay: localizedString,
    priceSubDisplay: v.optional(localizedString),
    image: v.string(),
    artisan: localizedString,
    full_description: localizedString,
    category: v.optional(v.string()),
    // Link to the Convex Auth user who owns/created this product (optional for seeded data)
    ownerUserId: v.optional(v.id("users")),
  }).index("by_productId", ["productId"])
    .index("by_category", ["category"])
    .index("by_ownerUserId", ["ownerUserId"]),

  // Master artisan profiles
  artisans: defineTable({
    artisanId: v.number(), // Original ID from constants
    name: localizedString,
    bio: v.string(),
    image: v.string(),
    craftIds: v.array(v.number()),
  }).index("by_artisanId", ["artisanId"]),

  // E-commerce orders
  orders: defineTable({
    orderId: v.string(), // Original ID from constants
    customerName: v.string(),
    productId: v.id("products"), // Reference to product
    productSnapshot: v.object({
      name: localizedString,
      price: v.number(),
      image: v.string(),
    }),
    quantity: v.number(),
    total: v.number(),
    date: v.string(),
    // Optional links to authenticated users for analytics and filtering
    customerUserId: v.optional(v.id("users")),
    artisanUserId: v.optional(v.id("users")),
    status: v.union(
      v.literal("待處理"),
      v.literal("已發貨"), 
      v.literal("已完成"),
      v.literal("已取消")
    ),
  }).index("by_orderId", ["orderId"])
    .index("by_status", ["status"])
    .index("by_customerName", ["customerName"])
    .index("by_customerUserId", ["customerUserId"])
    .index("by_artisanUserId", ["artisanUserId"]),

  // Message threads between customers and artisans
  messageThreads: defineTable({
    threadId: v.string(), // Original ID from constants
    customerName: v.string(),
    lastMessage: v.string(),
    timestamp: v.string(),
    unread: v.boolean(),
    avatar: v.string(),
    productId: v.number(),
    // Optional Convex Auth user links for both sides of the conversation
    customerUserId: v.optional(v.id("users")),
    artisanUserId: v.optional(v.id("users")),
  }).index("by_threadId", ["threadId"])
    .index("by_customerName", ["customerName"])
    .index("by_unread", ["unread"])
    .index("by_customerUserId", ["customerUserId"])
    .index("by_artisanUserId", ["artisanUserId"]),

  // Individual chat messages
  chatMessages: defineTable({
    messageId: v.string(), // Original ID from constants
    threadId: v.string(),
    sender: v.union(v.literal("customer"), v.literal("artisan")),
    originalText: v.string(),
    translatedText: v.optional(v.string()),
    language: v.union(v.literal("en"), v.literal("zh")),
    timestamp: v.string(),
    // Optional structured negotiation field, e.g. proposed price in HKD
    offerPrice: v.optional(v.number()),
  }).index("by_threadId", ["threadId"])
    .index("by_messageId", ["messageId"]),

  // Face profiles for virtual try-on
  faceProfiles: defineTable({
    profileId: v.string(), // Original ID from constants
    label: localizedString,
    imageUrl: v.string(),
    source: v.union(v.literal("preset"), v.literal("upload")),
    createdAt: v.string(),
    userId: v.optional(v.id("users")), // Link to user who uploaded
  }).index("by_profileId", ["profileId"])
    .index("by_source", ["source"])
    .index("by_userId", ["userId"]),

  // TextLab glyph library
  glyphs: defineTable({
    name: v.string(),
    glyph: v.union(
      v.literal("shou"), v.literal("tian"), v.literal("shui"), v.literal("kou"),
      v.literal("nian"), v.literal("bu"), v.literal("shan"), v.literal("ge"),
      v.literal("ren"), v.literal("xin"), v.literal("ri"), v.literal("shi"),
      v.literal("mu"), v.literal("huo"), v.literal("tu"), v.literal("zhu"),
      v.literal("da"), v.literal("zhong"), v.literal("jin"), v.literal("nu"),
      v.literal("yue"), v.literal("gong"), v.literal("heng"), v.literal("shu"),
      v.literal("pie"), v.literal("na"), v.literal("dian"), v.literal("ti")
    ),
  }).index("by_glyph", ["glyph"]),

  // AI-generated creations
  aiCreations: defineTable({
    craftId: v.number(),
    craftName: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_craftId", ["craftId"])
    .index("by_userId", ["userId"]),

  // Virtual try-on looks
  tryOnLooks: defineTable({
    craftId: v.number(),
    craftName: v.string(),
    imageUrl: v.string(),
    faceId: v.string(),
    faceLabel: v.string(),
    prompt: v.string(),
    mode: v.string(),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_craftId", ["craftId"])
    .index("by_userId", ["userId"])
    .index("by_faceId", ["faceId"]),

  // Keep the numbers table for backward compatibility
  numbers: defineTable({
    value: v.number(),
  }),
});
