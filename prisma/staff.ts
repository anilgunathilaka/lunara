/**
 * Grant or revoke operations access (docs/4-architecture.md §3.5).
 *
 *   npm run staff:add -- person@example.com other@example.com
 *   npm run staff:remove -- person@example.com
 *
 * Emails are passed on the command line and stored only in the database —
 * never in the repository. Removing deactivates (history keeps the actor).
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaClient from '@prisma/client';

const { PrismaClient } = prismaClient;

const [mode, ...rawEmails] = process.argv.slice(2);
const emails = rawEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);

if ((mode !== 'add' && mode !== 'remove') || emails.length === 0) {
  console.error('Usage: npm run staff:add -- <email>... | npm run staff:remove -- <email>...');
  process.exit(1);
}
const invalid = emails.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
if (invalid.length) {
  console.error('Not valid email addresses:', invalid.join(', '));
  process.exit(1);
}

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  console.error('DIRECT_URL is not set (see .env.example).');
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main(): Promise<void> {
  for (const email of emails) {
    if (mode === 'add') {
      await prisma.staffMember.upsert({ where: { email }, update: { active: true }, create: { email } });
    } else {
      await prisma.staffMember.updateMany({ where: { email }, data: { active: false } });
    }
  }
  const active = await prisma.staffMember.count({ where: { active: true } });
  console.log(`${mode === 'add' ? 'Granted' : 'Revoked'} ${emails.length}; active staff now ${active}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
