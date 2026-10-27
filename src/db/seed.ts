import { db, pool } from './index.ts';
import { listings, users } from './schema.ts';
import { INITIAL_LISTINGS } from '../data/backendSeed.ts';

async function seed() {
  for (const listing of INITIAL_LISTINGS) {
    await db.insert(users).values({
      uid: listing.host.id,
      email: `seed+${listing.host.id}@wonderstay.invalid`,
      name: listing.host.name,
      role: 'host',
      avatar: listing.host.avatar,
      passwordHash: '!',
    }).onConflictDoNothing();

    await db.insert(listings).values({
      id: listing.id,
      hostId: listing.host.id,
      title: listing.title,
      tagline: listing.tagline,
      description: listing.description,
      category: listing.category,
      propertyType: listing.propertyType,
      roomType: listing.roomType,
      address: listing.location.address,
      city: listing.location.city,
      state: listing.location.state || '',
      country: listing.location.country,
      neighborhood: listing.location.neighborhood || '',
      lat: listing.location.lat,
      lng: listing.location.lng,
      price: listing.price,
      cleaningFee: listing.cleaningFee,
      serviceFeePercent: listing.serviceFeePercent,
      maxGuests: listing.maxGuests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      images: listing.images,
      amenities: listing.amenities,
      ratingsBreakdown: listing.ratingsBreakdown,
      houseRules: listing.houseRules,
      cancellationPolicy: listing.cancellationPolicy,
      isFeatured: listing.isFeatured || false,
      createdAt: new Date(listing.createdAt),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${INITIAL_LISTINGS.length} initial listings.`);
}

seed()
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
