import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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

// Artisan-specific helper to list products created by the current authenticated user
export const getProductsForCurrentArtisan = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Unauthenticated users don't own any artisan inventory
      return [];
    }
    return await ctx.db
      .query("products")
      .withIndex("by_ownerUserId", (q) => q.eq("ownerUserId", userId))
      .collect();
  },
});

// Mutation for artisans to create/upload a new product
export const createArtisanProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be signed in as an artisan to create products");
    }

    const user = await ctx.db.get(userId);
    const artisanDisplayName =
      (user as any)?.name ??
      (user as any)?.username ??
      (user as any)?.email ??
      "Artisan";

    // Compute a new numeric productId, continuing from existing seeded data.
    const last = await ctx.db
      .query("products")
      .withIndex("by_productId", (q) => q.gt("productId", 0))
      .order("desc")
      .first();

    const nextProductId = (last?.productId ?? 0) + 1;

    const priceDisplay = {
      zh: `HK$ ${args.price}`,
      en: `HK$ ${args.price}`,
    };

    const productDocId = await ctx.db.insert("products", {
      productId: nextProductId,
      name: { zh: args.name, en: args.name },
      price: args.price,
      priceDisplay,
      priceSubDisplay: undefined,
      image: args.image,
      artisan: { zh: artisanDisplayName, en: artisanDisplayName },
      full_description: { zh: args.description, en: args.description },
      category: args.category,
      ownerUserId: userId,
    });

    return await ctx.db.get(productDocId);
  },
});

// Mutation for buyers to place an order for a product (simple ecommerce flow)
export const createOrder = mutation({
  args: {
    productDocId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be signed in to place an order");
    }

    const user = await ctx.db.get(userId);
    const customerName =
      (user as any)?.name ??
      (user as any)?.username ??
      (user as any)?.email ??
      "Customer";

    const product = await ctx.db.get(args.productDocId);
    if (!product) {
      throw new Error("Product not found");
    }

    const total = product.price * args.quantity;
    const now = new Date();
    const orderId = `ORD-${now.getTime()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const orderDocId = await ctx.db.insert("orders", {
      orderId,
      customerName,
      productId: args.productDocId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity: args.quantity,
      total,
      date: now.toISOString(),
      status: "待處理",
      customerUserId: userId,
      artisanUserId: product.ownerUserId ?? undefined,
    });

    return await ctx.db.get(orderDocId);
  },
});

// Chat messages for a specific thread
export const getChatMessagesByThread = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

// Get or create a message thread for a given product for the current user.
// This powers the buyer ↔ artisan negotiation chat like Carousell.
export const getOrCreateThreadForProduct = mutation({
  args: {
    productNumericId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be signed in to start a chat");
    }

    const user = await ctx.db.get(userId);
    const customerName =
      (user as any)?.name ??
      (user as any)?.email ??
      "Anonymous";

    // Try to find an existing thread for this user + product
    const existing = await ctx.db
      .query("messageThreads")
      .withIndex("by_customerUserId", (q) => q.eq("customerUserId", userId))
      .collect();

    const existingForProduct = existing.find(
      (thread) => thread.productId === args.productNumericId
    );
    if (existingForProduct) {
      return existingForProduct;
    }

    // Look up product so we can infer artisan metadata if present
    const productDoc = await ctx.db
      .query("products")
      .withIndex("by_productId", (q) =>
        q.eq("productId", args.productNumericId)
      )
      .first();

    if (!productDoc) {
      throw new Error("Product not found");
    }

    // In a richer model we would resolve the artisan user ID from the product owner.
    const artisanUserId = productDoc.ownerUserId ?? null;

    const now = new Date();
    const threadId = `THREAD-${now.getTime()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const newThreadId = await ctx.db.insert("messageThreads", {
      threadId,
      customerName,
      lastMessage: "",
      timestamp: now.toLocaleString("zh-HK", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      }),
      unread: false,
      avatar: "/user-avatar.jpg",
      productId: args.productNumericId,
      customerUserId: userId,
      artisanUserId: artisanUserId ?? undefined,
    });

    const created = await ctx.db.get(newThreadId);
    return created;
  },
});

// Send a chat message and update the thread preview/unread state.
export const sendChatMessage = mutation({
  args: {
    threadId: v.string(),
    sender: v.union(v.literal("customer"), v.literal("artisan")),
    text: v.string(),
    language: v.union(v.literal("en"), v.literal("zh")),
    offerPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("zh-HK", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });

    const messageId = `MSG-${now.getTime()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const messageDocId = await ctx.db.insert("chatMessages", {
      messageId,
      threadId: args.threadId,
      sender: args.sender,
      originalText: args.text,
      translatedText: undefined,
      language: args.language,
      timestamp,
      offerPrice: args.offerPrice,
    });

    // Update thread preview + unread flag
    const [thread] = await ctx.db
      .query("messageThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .take(1);

    if (thread) {
      await ctx.db.patch(thread._id, {
        lastMessage: args.text,
        timestamp,
        // If the customer sends a message, mark as unread for artisan.
        unread: args.sender === "customer",
      });
    }

    return await ctx.db.get(messageDocId);
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
      customerUserId: v.optional(v.id("users")),
      artisanUserId: v.optional(v.id("users")),
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
      customerUserId: v.optional(v.id("users")),
      artisanUserId: v.optional(v.id("users")),
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

