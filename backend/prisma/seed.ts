import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (for development only)
  await prisma.salesRepRetailer.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.territory.deleteMany();
  await prisma.area.deleteMany();
  await prisma.region.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.salesRep.deleteMany();

  console.log('✅ Cleared existing data');

  // Create regions
  const regions = await Promise.all([
    prisma.region.create({ data: { name: 'Dhaka' } }),
    prisma.region.create({ data: { name: 'Chittagong' } }),
    prisma.region.create({ data: { name: 'Sylhet' } }),
    prisma.region.create({ data: { name: 'Rajshahi' } }),
    prisma.region.create({ data: { name: 'Khulna' } }),
  ]);
  console.log(`✅ Created ${regions.length} regions`);

  // Create areas
  const areas = await Promise.all([
    // Dhaka areas
    prisma.area.create({ data: { name: 'Mirpur', regionId: regions[0].id } }),
    prisma.area.create({ data: { name: 'Dhanmondi', regionId: regions[0].id } }),
    prisma.area.create({ data: { name: 'Gulshan', regionId: regions[0].id } }),
    // Chittagong areas
    prisma.area.create({ data: { name: 'Agrabad', regionId: regions[1].id } }),
    prisma.area.create({ data: { name: 'Pahartali', regionId: regions[1].id } }),
    // Sylhet areas
    prisma.area.create({ data: { name: 'Zindabazar', regionId: regions[2].id } }),
  ]);
  console.log(`✅ Created ${areas.length} areas`);

  // Create distributors
  const distributors = await Promise.all([
    prisma.distributor.create({ data: { name: 'Bengal Distributors Ltd' } }),
    prisma.distributor.create({ data: { name: 'Delta Trade International' } }),
    prisma.distributor.create({ data: { name: 'Summit Logistics' } }),
  ]);
  console.log(`✅ Created ${distributors.length} distributors`);

  // Create territories
  const territories = await Promise.all([
    prisma.territory.create({ data: { name: 'Zone A', areaId: areas[0].id } }),
    prisma.territory.create({ data: { name: 'Zone B', areaId: areas[0].id } }),
    prisma.territory.create({ data: { name: 'Zone A', areaId: areas[1].id } }),
    prisma.territory.create({ data: { name: 'Zone A', areaId: areas[3].id } }),
  ]);
  console.log(`✅ Created ${territories.length} territories`);

  // Create sales reps (1 admin + 3 SRs)
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.salesRep.create({
    data: {
      username: 'admin',
      name: 'System Admin',
      phone: '01711111111',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const salesReps = await Promise.all([
    prisma.salesRep.create({
      data: {
        username: 'karim_sr',
        name: 'Karim Ahmed',
        phone: '01712345678',
        passwordHash: hashedPassword,
        role: 'SR',
      },
    }),
    prisma.salesRep.create({
      data: {
        username: 'fatima_sr',
        name: 'Fatima Rahman',
        phone: '01798765432',
        passwordHash: hashedPassword,
        role: 'SR',
      },
    }),
    prisma.salesRep.create({
      data: {
        username: 'john_sr',
        name: 'John Doe',
        phone: '01755555555',
        passwordHash: hashedPassword,
        role: 'SR',
      },
    }),
  ]);
  console.log(`✅ Created 1 admin + ${salesReps.length} sales reps`);
  console.log('   📧 Default password for all users: password123');

  // Create retailers (70 per SR for testing)
  const retailerPromises: Promise<any>[] = [];

  for (let srIndex = 0; srIndex < salesReps.length; srIndex++) {
    const sr = salesReps[srIndex];

    for (let i = 1; i <= 70; i++) {
      const retailerNum = (srIndex * 70) + i;

      // Distribute retailers across all regions, areas, territories, and distributors
      const regionIndex = retailerNum % regions.length;
      const areaIndex = retailerNum % areas.length;
      const distributorIndex = retailerNum % distributors.length;

      // Find a territory that belongs to the selected area
      // Filter territories by area, or fall back to first territory
      const areaTerritories = territories.filter(t => t.areaId === areas[areaIndex].id);
      const territoryIndex = areaTerritories.length > 0
        ? (retailerNum % areaTerritories.length)
        : 0;
      const selectedTerritory = areaTerritories[territoryIndex] || territories[0];

      const uid = `RET-${regions[regionIndex].name.substring(0, 3).toUpperCase()}-${String(retailerNum).padStart(4, '0')}`;

      retailerPromises.push(
        prisma.retailer.create({
          data: {
            uid,
            name: `${generateBusinessName()} - ${regions[regionIndex].name}`,
            phone: `017${String(10000000 + retailerNum).substring(1)}`,
            regionId: regions[regionIndex].id,
            areaId: areas[areaIndex].id,
            distributorId: distributors[distributorIndex].id,
            territoryId: selectedTerritory.id,
            points: Math.floor(Math.random() * 5000),
            routes: `Route-${Math.floor(Math.random() * 10) + 1}, Route-${Math.floor(Math.random() * 10) + 1}`,
            notes: i % 5 === 0 ? 'High value customer' : undefined,
            assignments: {
              create: {
                salesRepId: sr.id,
                assignedBy: admin.id,
              },
            },
          },
        })
      );
    }
  }

  // Execute all retailer creations
  await Promise.all(retailerPromises);
  console.log(`✅ Created ${retailerPromises.length} retailers`);
  console.log(`   📊 Distribution: ${salesReps.length} SRs × 70 retailers each`);

  // Summary
  const counts = {
    regions: await prisma.region.count(),
    areas: await prisma.area.count(),
    distributors: await prisma.distributor.count(),
    territories: await prisma.territory.count(),
    salesReps: await prisma.salesRep.count(),
    retailers: await prisma.retailer.count(),
    assignments: await prisma.salesRepRetailer.count(),
  };

  console.log('\n📊 Database Summary:');
  console.log(`   Regions: ${counts.regions}`);
  console.log(`   Areas: ${counts.areas}`);
  console.log(`   Distributors: ${counts.distributors}`);
  console.log(`   Territories: ${counts.territories}`);
  console.log(`   Sales Reps: ${counts.salesReps} (1 admin + ${counts.salesReps - 1} SRs)`);
  console.log(`   Retailers: ${counts.retailers}`);
  console.log(`   Assignments: ${counts.assignments}`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin:');
  console.log('     username: admin');
  console.log('     password: password123');
  console.log('   Sales Rep:');
  console.log('     username: karim_sr');
  console.log('     password: password123');
}

// Helper function to generate realistic business names
function generateBusinessName(): string {
  const prefixes = ['Rahman', 'Ahmed', 'Khan', 'Hossain', 'Ali', 'Islam', 'Uddin', 'Begum'];
  const types = ['Store', 'Shop', 'Mart', 'Trading', 'Enterprise', 'Brothers', 'General Store'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const type = types[Math.floor(Math.random() * types.length)];

  return `${prefix} ${type}`;
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
