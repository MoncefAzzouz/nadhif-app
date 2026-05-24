import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

async function main() {
  const email = 'superadmin@nadif.com';
  const password = 'superadmin1234';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('New admin user already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      fullName: 'Super Administrator',
      phone: '0555000000', // Dummy phone
      role: Role.ADMIN,
    },
  });

  console.log(`Successfully created new admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Optional: disconnect prisma
  });
