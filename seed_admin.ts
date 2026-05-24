import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

async function main() {
  const email = 'admin@nadif.com';
  const password = 'admin1234';

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin user already exists!');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      phone: '+213000000000',
      passwordHash,
      fullName: 'Super Admin',
      role: Role.ADMIN,
    }
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
