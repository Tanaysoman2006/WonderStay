import { db } from './index.ts';
import { bookings } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getDbBookings() {
  try {
    return await db.select().from(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings from Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createDbBooking(bookingData: typeof bookings.$inferInsert) {
  try {
    const result = await db.insert(bookings).values(bookingData).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create booking in Cloud SQL:', error);
    throw new Error('Failed to record reservation.', { cause: error });
  }
}
