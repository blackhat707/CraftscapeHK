import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generic function to insert records into any table
 * Usage: npx convex run insertData --table "tableName" --data '[{record1}, {record2}]'
 */
export const insertData = mutation({
  args: {
    table: v.string(),
    data: v.any(), // Can be a single object or array of objects
  },
  handler: async (ctx, args) => {
    const { table, data } = args;
    
    try {
      // Handle both single objects and arrays
      const records = Array.isArray(data) ? data : [data];
      const insertedIds = [];
      
      for (const record of records) {
        const id = await ctx.db.insert(table as any, record);
        insertedIds.push(id);
        console.log(`✅ Inserted record into ${table}:`, id);
      }
      
      return { 
        success: true, 
        table, 
        insertedCount: records.length,
        insertedIds
      };
    } catch (error) {
      console.error(`❌ Failed to insert into ${table}:`, error);
      throw new Error(`Failed to insert records: ${error}`);
    }
  },
});

/**
 * Clear all data from a table
 */
export const clearTable = mutation({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db.query(args.table as any).collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    console.log(`🗑️ Cleared ${records.length} records from ${args.table}`);
    return { success: true, deletedCount: records.length };
  },
});
