import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string, role?: string, avatar?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || 'Traveler',
        role: role || 'guest',
        avatar: avatar || undefined,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || undefined,
          avatar: avatar || undefined,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user in Cloud SQL:', error);
    throw new Error('Database operation failed. Please try again.', { cause: error });
  }
}
