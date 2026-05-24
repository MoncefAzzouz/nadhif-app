import prisma from '../src/lib/prisma';

const DEFAULT_SERVICES = [
  {
    id: 's1',
    name: 'Simple Service',
    description: 'Quick premium maintenance cleaning. Focuses on dusting high-frequency areas, sweeping, vacuuming, and waste removal.',
    picture: '/assets/landiring.JPG',
    extraWorkerPrice: 800,
    durationHours: 4,
    materialPrice: 1000,
    materialsMandatory: false,
    localProductPrice: 800,
    importedProductPrice: 1500,
    productsMandatory: false,
    isActive: true,
    houseConfigs: [
      { type: 'f2', workers: 3, basePrice: 3000 },
      { type: 'f3', workers: 4, basePrice: 4000 },
      { type: 'f4', workers: 5, basePrice: 5000 }
    ]
  },
  {
    id: 's2',
    name: 'Semi Grand Service',
    description: 'Detailed cleaning covering high-contact points, inside windows, bathroom sanitization, and upholstery vacuuming.',
    picture: '/assets/sejadaclean.JPG',
    extraWorkerPrice: 1000,
    durationHours: 4,
    materialPrice: 1500,
    materialsMandatory: true,
    localProductPrice: 1200,
    importedProductPrice: 2000,
    productsMandatory: true,
    isActive: true,
    houseConfigs: [
      { type: 'f2', workers: 3, basePrice: 4500 },
      { type: 'f3', workers: 4, basePrice: 6000 },
      { type: 'f4', workers: 5, basePrice: 7500 }
    ]
  },
  {
    id: 's3',
    name: 'Grand Service',
    description: 'Maximum deep cleaning. Includes comprehensive kitchen grease washing, deep bathroom scrub, window tracking, and air vents.',
    picture: '/assets/deepclean.JPG',
    extraWorkerPrice: 1200,
    durationHours: 4,
    materialPrice: 2000,
    materialsMandatory: true,
    localProductPrice: 1500,
    importedProductPrice: 2500,
    productsMandatory: true,
    isActive: true,
    houseConfigs: [
      { type: 'f2', workers: 3, basePrice: 6000 },
      { type: 'f3', workers: 4, basePrice: 8000 },
      { type: 'f4', workers: 5, basePrice: 10000 }
    ]
  }
];

async function main() {
  console.log('Seeding database with default services...');

  for (const s of DEFAULT_SERVICES) {
    // Check if service already exists
    const existing = await prisma.service.findUnique({
      where: { id: s.id }
    });

    if (existing) {
      console.log(`Service ${s.name} already exists. Skipping.`);
      continue;
    }

    // Create service and its house configurations
    await prisma.service.create({
      data: {
        id: s.id,
        name: s.name,
        description: s.description,
        picture: s.picture,
        extraWorkerPrice: s.extraWorkerPrice,
        durationHours: s.durationHours,
        materialPrice: s.materialPrice,
        materialsMandatory: s.materialsMandatory,
        localProductPrice: s.localProductPrice,
        importedProductPrice: s.importedProductPrice,
        productsMandatory: s.productsMandatory,
        isActive: s.isActive,
        houseConfigs: {
          create: s.houseConfigs
        }
      }
    });

    console.log(`Service ${s.name} created successfully.`);
  }

  // Also let's seed a default admin user if none exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!existingAdmin) {
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@nadif.com',
        phone: '0555555555',
        passwordHash: adminPasswordHash,
        fullName: 'Nadif Admin',
        role: 'ADMIN'
      }
    });
    console.log('Default admin user (admin@nadif.com / admin123) created successfully.');
  }
  // Seed promo codes
  const promoCodes = [
    {
      code: 'WELCOME20',
      discountPercent: 20,
      validFrom: new Date('2026-01-01T00:00:00Z'),
      validUntil: new Date('2027-12-31T23:59:59Z'),
      isActive: true
    },
    {
      code: 'SPRING10',
      discountPercent: 10,
      validFrom: new Date('2026-01-01T00:00:00Z'),
      validUntil: new Date('2027-12-31T23:59:59Z'),
      isActive: true
    }
  ];

  for (const promo of promoCodes) {
    const existingPromo = await prisma.promo.findUnique({
      where: { code: promo.code }
    });

    if (!existingPromo) {
      await prisma.promo.create({ data: promo });
      console.log(`Promo code ${promo.code} seeded successfully.`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
