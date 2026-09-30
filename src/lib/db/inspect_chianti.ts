import { db } from "./index";
import { products } from "./schema";
import { eq } from "drizzle-orm";

async function run() {
  const [p] = await db.select().from(products).where(eq(products.slug, "chianti-countryside-and-wine-tasting-day-trip"));
  console.log("TITLE:", p.title);
  console.log("WHY_VISIT:", p.whyVisit);
  console.log("SECRET_POINTS:", JSON.stringify(p.secretHistoryPoints, null, 2));
  console.log("ITINERARY:", JSON.stringify(p.itinerary, null, 2));
  console.log("ULTIMATE_TITLE:", p.ultimateExperienceTitle);
  console.log("ULTIMATE_POINTS:", JSON.stringify(p.ultimateExperiencePoints, null, 2));
  console.log("GETTING_THERE:", JSON.stringify(p.gettingThereOptions, null, 2));
  console.log("SEASONAL_TIPS:", JSON.stringify(p.bestTimeToVisitTips, null, 2));
  process.exit(0);
}
run();
