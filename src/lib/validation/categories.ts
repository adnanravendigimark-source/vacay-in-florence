import { z } from "zod";

/**
 * categoryIconSchema is the one surviving export from this file after the
 * Categories CMS feature (admin CRUD, public /categories pages) was
 * removed — it's still a real, active dependency: the Admin Attraction
 * Editor's icon field (src/lib/validation/attractions.ts) reuses the same
 * icon enum/visual vocabulary, since attractions are landmark/experience
 * groups presented the same way categories used to be.
 */
export const categoryIconSchema = z.enum(["landmark", "museum", "tour-guide", "food-wine", "day-trip", "outdoor"]);
