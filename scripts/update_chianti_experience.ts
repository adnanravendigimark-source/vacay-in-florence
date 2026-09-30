import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function run() {
  console.log("1. Adding column ultimate_experience_image if not exists...");
  await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS ultimate_experience_image text;`);
  console.log("Column added or confirmed.");

  const slug = "chianti-countryside-and-wine-tasting-day-trip";

  console.log(`2. Updating experience: ${slug}...`);

  const updatedWhyVisit = JSON.stringify({
    title: "Rolling Hills, Castle Estates & Legendary Sangiovese",
    subtitle: "Journey beyond the city walls into the heart of the Chianti Classico wine region.",
    description: "Wind along the cypress-lined roads of the Chiantigiana (SR222), visiting two premier family-owned wine estates. Tour sun-drenched vineyards, walk among centuries-old oak aging barrels, and enjoy an authentic multi-course farmhouse lunch paired with world-class Chianti Classico DOCG and Super Tuscan vintages.",
    collageImages: [
      "/images/experiences/chianti-vineyards.jpg",
      "/images/experiences/chianti-cellar.jpg",
      "/images/experiences/chianti-tasting.jpg",
    ],
  });

  const updatedHighlights = [
    {
      category: "WINE TASTING",
      title: "Guided Tastings at 2 Boutique Estates",
      description: "Sample award-winning Chianti Classico DOCG, Riserva, and Super Tuscan wines led by resident sommeliers.",
      badge: "8+ Wines",
    },
    {
      category: "AUTHENTIC CUISINE",
      title: "Multi-Course Tuscan Farmhouse Lunch",
      description: "Savor homemade pasta, artisanal pecorino cheeses, cured meats, and fresh-pressed estate olive oil paired with wines.",
      badge: "Full Lunch",
    },
    {
      category: "CELLAR & VINEYARDS",
      title: "Historic Barrel Cellar & Vineyard Walks",
      description: "Explore vaulted 16th-century stone cellars, massive French oak barriques, and sunlit hill-sloped vineyards.",
      badge: "Private Access",
    },
    {
      category: "LUXURY TRANSPORT",
      title: "Panoramic Minivan Ride along SR222",
      description: "Relax in air-conditioned comfort while taking in postcard-perfect vistas along the iconic Chiantigiana road.",
      badge: "Round-Trip",
    },
  ];

  const updatedSecrets = [
    {
      title: "The Legend of the Black Rooster (Gallo Nero)",
      snippet: "How a hungry black rooster defined the historic border between Florence and Siena.",
      fullStory: "In medieval times, Florence and Siena agreed to settle their disputed border by having a knight from each city ride out at dawn at the first rooster crow. Florence picked a starving black rooster that crowed hours before dawn, giving the Florentine knight a massive head start. Today, the Black Rooster remains the proud symbol of authentic Chianti Classico DOCG.",
      imageUrl: "/images/experiences/chianti-cypress-road.jpg",
      audioDuration: "2 min listen",
    },
    {
      title: "Sangiovese — The Blood of Jupiter",
      snippet: "Discover why the Sangiovese grape thrives exclusively in the mineral-rich Tuscan soil.",
      fullStory: "Derived from 'Sanguis Jovis' (Blood of Jupiter), Sangiovese is Tuscany's noble grape. Its distinct aromas of ripe cherry, balsamic herbs, and earthy spice are coaxed to perfection by Chianti's unique galestro (rocky schist) and alberese (compact limestone) soils, producing wines with remarkable aging potential.",
      imageUrl: "/images/experiences/chianti-tasting.jpg",
      audioDuration: "3 min listen",
    },
    {
      title: "Centuries-Old Barrique Cellars & Secret Vintages",
      snippet: "Underground stone chambers where family reserve barrels age undisturbed for decades.",
      fullStory: "Beneath the Renaissance estate villas lie damp, cool cellars insulated by thick stone walls. Here, reserve wines age for up to 36 months in Slavonian oak casks and French barriques, maturing alongside private family libraries holding vintages from the mid-20th century.",
      imageUrl: "/images/experiences/chianti-cellar.jpg",
      audioDuration: "2 min listen",
    },
  ];

  const updatedItinerary = [
    {
      time: "09:00 AM",
      title: "Departure from Florence & Scenic Drive",
      description: "Meet your expert sommelier guide in central Florence and board our luxury air-conditioned minivan. Travel along the breathtaking Chiantigiana (SR222) highway with postcard views of cypress groves, stone farmhouses, and olive orchards.",
      image: "/images/experiences/chianti-cypress-road.jpg",
      tag: "Scenic Drive",
      icon: "bus",
    },
    {
      time: "10:30 AM",
      title: "First Estate: Vineyard Walk & Morning Tasting",
      description: "Arrive at a prestigious family-owned estate nestled in the Chianti hills. Walk between rows of Sangiovese vines, learn organic viticulture techniques, and taste 4 distinct vintages alongside extra virgin olive oil and bruschetta.",
      image: "/images/experiences/chianti-vineyards.jpg",
      tag: "Vineyard Tour",
      icon: "camera",
    },
    {
      time: "01:00 PM",
      title: "Farmhouse Lunch & Wine Pairing",
      description: "Sit down at a panoramic estate terrace or rustic dining room for an authentic 3-course Tuscan feast. Enjoy homemade pasta, cured salumi, local pecorino, and cantucci paired with estate Chianti Classico Riserva.",
      image: "/images/experiences/chianti-tasting.jpg",
      tag: "Tuscan Feast",
      icon: "utensils",
    },
    {
      time: "03:30 PM",
      title: "Second Estate: Ancient Barrel Cellars & Super Tuscans",
      description: "Visit a second historic castle estate dating back to the 14th century. Tour the vaulted underground barrel rooms, discover the secret behind Super Tuscan blends, and finish with a guided tasting of aged reserve wines.",
      image: "/images/experiences/chianti-cellar.jpg",
      tag: "Cellar Masterclass",
      icon: "wine",
    },
  ];

  const updatedUltimateExperienceTitle = "Private Cellars & Rare Vintages — Beyond Standard Tastings";
  const updatedUltimateExperienceDescription = "Step into historic underground barrel cellars that have aged Chianti Classico for generations, with private tastings led directly by estate sommeliers.";
  const updatedUltimateExperienceImage = "/images/hero2-chianti-wine.jpg";
  const updatedUltimateExperiencePoints = [
    {
      icon: "wine",
      title: "Exclusive Barrel Room Access",
      description: "Sample rare reserve vintages directly from French oak barriques before public bottling.",
    },
    {
      icon: "camera",
      title: "Private Vineyard Terraces",
      description: "Take in sweeping panoramic vistas across the rolling Tuscan hills away from the crowds.",
    },
    {
      icon: "utensils",
      title: "Estate Extra Virgin Olive Oil",
      description: "Taste fresh-pressed, peppery Tuscan olive oil with artisan bread and aged pecorino.",
    },
  ];

  const updatedGettingThereOptions = [
    {
      mode: "Luxury Minivan from Central Florence",
      description: "Complimentary pickup and drop-off in a climate-controlled Mercedes minivan from Piazza della Repubblica (near Hotel Savoy) with a dedicated sommelier-driver.",
      image: "/images/hero2-guided-tour.jpg",
      tag: "Included / Recommended",
      icon: "bus",
    },
    {
      mode: "Scenic Drive via SR222 (Chiantigiana)",
      description: "If arriving by car, take the scenic Via Chiantigiana (SR222) south towards Greve in Chianti. Free private parking is available at both estate locations.",
      image: "/images/experiences/chianti-cypress-road.jpg",
      tag: "Self-Drive",
      icon: "compass",
    },
    {
      mode: "Private Hotel Chauffeur",
      description: "Private door-to-door luxury Mercedes transfer directly from your Florence hotel, villa, or Airbnb with customized departure timing.",
      image: "/images/experiences/getting-there-foot.jpg",
      tag: "VIP Upgrade",
      icon: "clock",
    },
  ];

  await db
    .update(products)
    .set({
      whyVisit: updatedWhyVisit,
      highlights: updatedHighlights,
      secretHistoryPoints: updatedSecrets,
      itinerary: updatedItinerary,
      ultimateExperienceTitle: updatedUltimateExperienceTitle,
      ultimateExperienceDescription: updatedUltimateExperienceDescription,
      ultimateExperienceImage: updatedUltimateExperienceImage,
      ultimateExperiencePoints: updatedUltimateExperiencePoints,
      gettingThereOptions: updatedGettingThereOptions,
    })
    .where(eq(products.slug, slug));

  console.log("Successfully updated Chianti experience data in database!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
