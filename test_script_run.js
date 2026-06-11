const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = "nadhif_super_secret_jwt_key_2026";

async function run() {
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.error("No admin user found in database!");
    return;
  }

  console.log("Using admin user:", adminUser.email);
  const token = jwt.sign(
    { userId: adminUser.id, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const services = await prisma.service.findMany({
    include: { houseConfigs: true }
  });
  if (services.length === 0) {
    console.error("No services found in database");
    return;
  }
  const service = services[0];
  const serviceId = service.id;
  const houseConfigId = service.houseConfigs?.[0]?.id;
  if (!houseConfigId) {
    console.error("No houseConfigs on first service");
    return;
  }

  const orderRes = await fetch('http://localhost:5001/api/admin/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fullName: "Test Admin Guest",
      phone: "0777777777",
      address: "123 Test Street",
      serviceId,
      houseConfigId,
      scheduledDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      extraWorkers: 0,
      useMaterials: false,
      productOrigin: "NONE",
      sizeM2: 150,
      clientNote: "A client note test",
      housePictures: []
    })
  });

  const text = await orderRes.text();
  console.log("Order Creation Status:", orderRes.status);
  console.log("Response Body:", text);
}

run().catch(console.error).finally(() => prisma.$disconnect());
