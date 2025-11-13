import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries to fetch data
export const getProducts = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getProductById = query({
  args: { productId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();
  },
});

export const getCrafts = query({
  handler: async (ctx) => {
    return await ctx.db.query("crafts").collect();
  },
});

export const getCraftById = query({
  args: { craftId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("crafts")
      .filter((q) => q.eq(q.field("craftId"), args.craftId))
      .first();
  },
});

export const getEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const getFeaturedEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
  },
});

export const getEventById = query({
  args: { eventId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();
  },
});

export const getArtisans = query({
  handler: async (ctx) => {
    return await ctx.db.query("artisans").collect();
  },
});

export const getArtisanById = query({
  args: { artisanId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artisans")
      .filter((q) => q.eq(q.field("artisanId"), args.artisanId))
      .first();
  },
});

export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

export const getOrdersByStatus = query({
  args: { status: v.union(v.literal("待處理"), v.literal("已發貨"), v.literal("已完成"), v.literal("已取消")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getMessageThreads = query({
  handler: async (ctx) => {
    return await ctx.db.query("messageThreads").collect();
  },
});

export const getUnreadMessages = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("messageThreads")
      .withIndex("by_unread", (q) => q.eq("unread", true))
      .collect();
  },
});

// Mutations to initialize data
export const initializeProducts = mutation({
  args: {
    products: v.array(v.object({
      productId: v.number(),
      name: v.any(),
      price: v.number(),
      priceDisplay: v.any(),
      priceSubDisplay: v.optional(v.any()),
      image: v.string(),
      artisan: v.any(),
      full_description: v.any(),
      category: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing products
    const existing = await ctx.db.query("products").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new products
    for (const product of args.products) {
      await ctx.db.insert("products", product);
    }
    
    return { count: args.products.length };
  },
});

export const initializeCrafts = mutation({
  args: {
    crafts: v.array(v.object({
      craftId: v.number(),
      name: v.any(),
      artisan: v.any(),
      short_description: v.any(),
      full_description: v.any(),
      images: v.array(v.string()),
      history: v.any(),
      story: v.any(),
      category: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing crafts
    const existing = await ctx.db.query("crafts").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new crafts
    for (const craft of args.crafts) {
      await ctx.db.insert("crafts", craft);
    }
    
    return { count: args.crafts.length };
  },
});

export const initializeEvents = mutation({
  args: {
    events: v.array(v.object({
      eventId: v.number(),
      title: v.any(),
      date: v.string(),
      time: v.any(),
      location: v.any(),
      description: v.any(),
      organizer: v.string(),
      organizer_icon: v.string(),
      image: v.string(),
      region: v.union(v.literal("港島"), v.literal("九龍"), v.literal("新界"), v.literal("線上")),
      type: v.union(v.literal("工作坊"), v.literal("展覽"), v.literal("講座")),
      isFeatured: v.optional(v.boolean()),
      url: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing events
    const existing = await ctx.db.query("events").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new events
    for (const event of args.events) {
      await ctx.db.insert("events", event);
    }
    
    return { count: args.events.length };
  },
});

export const initializeArtisans = mutation({
  args: {
    artisans: v.array(v.object({
      artisanId: v.number(),
      name: v.any(),
      bio: v.string(),
      image: v.string(),
      craftIds: v.array(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing artisans
    const existing = await ctx.db.query("artisans").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new artisans
    for (const artisan of args.artisans) {
      await ctx.db.insert("artisans", artisan);
    }
    
    return { count: args.artisans.length };
  },
});

export const initializeOrders = mutation({
  args: {
    orders: v.array(v.object({
      orderId: v.string(),
      customerName: v.string(),
      productId: v.id("products"),
      productSnapshot: v.object({
        name: v.any(),
        price: v.number(),
        image: v.string(),
      }),
      quantity: v.number(),
      total: v.number(),
      date: v.string(),
      status: v.union(v.literal("待處理"), v.literal("已發貨"), v.literal("已完成"), v.literal("已取消")),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing orders
    const existing = await ctx.db.query("orders").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new orders
    for (const order of args.orders) {
      await ctx.db.insert("orders", order);
    }
    
    return { count: args.orders.length };
  },
});

export const initializeMessageThreads = mutation({
  args: {
    messageThreads: v.array(v.object({
      threadId: v.string(),
      customerName: v.string(),
      lastMessage: v.string(),
      timestamp: v.string(),
      unread: v.boolean(),
      avatar: v.string(),
      productId: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing message threads
    const existing = await ctx.db.query("messageThreads").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    
    // Insert new message threads
    for (const thread of args.messageThreads) {
      await ctx.db.insert("messageThreads", thread);
    }
    
    return { count: args.messageThreads.length };
  },
});

