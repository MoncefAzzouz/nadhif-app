import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

/**
 * Creates (or promotes) an ADMIN user.
 *
 *   npx ts-node create_admin.ts <email> <password> ["Full Name"] [phone]
 *
 * If the email already exists the account is promoted to ADMIN and its password
 * is reset, so the script is safe to re-run.
 *
 * Note: ADMIN accounts receive the internal order/subscription notification
 * emails and can read every customer's data through /api/admin/*.
 */

async function freePhone(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `0555${Math.floor(100000 + Math.random() * 900000)}`;
    const taken = await prisma.user.findUnique({ where: { phone: candidate } });
    if (!taken) return candidate;
  }
  throw new Error('Could not generate a free phone number — pass one as the 4th argument.');
}

async function main() {
  const [email, password, fullName = 'Administrator', phoneArg] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: npx ts-node create_admin.ts <email> <password> ["Full Name"] [phone]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { passwordHash, role: Role.ADMIN, fullName },
    });
    console.log(`✅ Existing account promoted to ADMIN and password reset: ${updated.email}`);
    console.log(`   name: ${updated.fullName} | phone: ${updated.phone} | role: ${updated.role}`);
    return;
  }

  if (phoneArg) {
    const clash = await prisma.user.findUnique({ where: { phone: phoneArg } });
    if (clash) {
      console.error(`❌ Phone ${phoneArg} already belongs to ${clash.email}. Pick another one.`);
      process.exit(1);
    }
  }

  const created = await prisma.user.create({
    data: {
      email,
      phone: phoneArg || (await freePhone()),
      passwordHash,
      fullName,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin created: ${created.email}`);
  console.log(`   name: ${created.fullName} | phone: ${created.phone} | role: ${created.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
