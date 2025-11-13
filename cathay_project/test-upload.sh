#!/bin/bash

echo "Testing Convex upload with simple data..."

echo "Clearing glyphs table..."
npx convex run clearTable '{"table": "glyphs"}'

echo "Uploading a single glyph..."
npx convex run insertData '{"table": "glyphs", "data": [{"name": "手", "glyph": "shou"}]}'

echo "Test completed!"
