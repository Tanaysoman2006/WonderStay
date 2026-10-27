import { db } from './index.ts';
import { listings } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getDbListings() {
  try {
    return await db.select().from(listings);
  } catch (error) {
    console.error('Failed to fetch listings from Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getDbListingById(id: string) {
  try {
    const results = await db.select().from(listings).where(eq(listings.id, id));
    return results[0] || null;
  } catch (error) {
    console.error(`Failed to fetch listing ${id} from Cloud SQL:`, error);
    throw new Error('Database query failed.', { cause: error });
  }
}
