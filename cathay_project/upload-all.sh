#!/bin/bash

echo "CraftscapeHK Complete Data Upload"
echo "================================="
echo ""

echo "This will upload ALL data to your Convex database:"
echo "- 5 Crafts (traditional Hong Kong crafts)"
echo "- 5 Artisans (with craftIds arrays [1], [2], etc.)"
echo "- 2 Face Profiles (for virtual try-on)"
echo "- 28 Glyphs (Chinese characters for TextLab)"
echo "- 14 Products (marketplace items)"
echo "- 6 Events (cultural events and workshops)"
echo "- 3 Message Threads (customer conversations)"
echo "- 10 Chat Messages (individual messages)"
echo ""

read -p "Continue with upload? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Upload cancelled."
    exit 0
fi

echo ""
echo "Step 1: Core Data (Crafts, Artisans, Face Profiles, Glyphs)"
./upload-data.sh

echo ""
echo "Step 2: Products"
./upload-products.sh

echo ""
echo "Step 3: Events"
./upload-events.sh

echo ""
echo "Step 4: Messages"
./upload-messages.sh

echo ""
echo "Complete Data Upload Finished!"
echo ""
echo "Next Steps:"
echo "1. View your data: npx convex dashboard"
echo "2. Check tables: crafts, artisans, products, events, messageThreads, chatMessages, faceProfiles, glyphs"
echo "3. Test your app: npm run dev"

echo ""
echo "Summary:"
echo "- Traditional Crafts: Canton Porcelain, Neon Signs, Mahjong Carving, Cheongsam, Letterpress"
echo "- Master Artisans: All linked to their respective crafts via craftIds arrays"
echo "- Multilingual Content: All text in Chinese (zh) and English (en)"
echo "- Face Profiles: Default and LinkedIn preset faces for AI try-on"
echo "- Product Catalog: From HK$88 minibus signs to HK$12,800 wedding cheongsams"
echo "- Cultural Events: M+ Museum exhibitions, PMQ workshops, international conventions"
echo "- Customer Messages: Real conversations with translations between English/Chinese"

echo ""
echo "Upload completed successfully!"
