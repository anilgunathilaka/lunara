/**
 * Loads the placeholder catalogue (content/catalogue/seed-catalogue.ts)
 * into Postgres — docs/4-architecture.md §3.3.
 *
 *   npm run db:seed
 *
 * Create-only and idempotent: every row is upserted with an empty update,
 * so re-running never overwrites a price or a stock count that has been
 * changed since. Run deliberately from a developer machine (DIRECT_URL),
 * like a migration — never from CI or the Worker.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaClient from '@prisma/client';
import {
  DEFAULT_THRESHOLD,
  PLACEHOLDER_LOT,
  seedDesigns,
  seedJacketColourways,
  seedJacketMaterials,
  seedListings,
  seedMaterials,
  seedSareeColourways,
} from '../content/catalogue/seed-catalogue.ts';

const { PrismaClient } = prismaClient;

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  console.error('DIRECT_URL is not set (see .env.example).');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const m of seedMaterials) {
      await tx.cottonMaterial.upsert({
        where: { id: m.id },
        update: {},
        create: { id: m.id, name: m.name, gsm: m.gsm, opacity: m.opacity, lengthMetres: m.lengthMetres },
      });
    }

    for (const [index, d] of seedDesigns.entries()) {
      await tx.sareeDesign.upsert({
        where: { id: d.id },
        update: {},
        create: { id: d.id, name: d.name, occasionTags: d.occasionTags, sortOrder: index },
      });
      for (const [materialId, price] of Object.entries(d.prices)) {
        await tx.priceMatrix.upsert({
          where: { designId_materialId: { designId: d.id, materialId } },
          update: {},
          create: { designId: d.id, materialId, price },
        });
      }
    }

    for (const c of seedSareeColourways) {
      await tx.stockItem.upsert({
        where: { sku: c.sku },
        update: {},
        create: { sku: c.sku, quantity: c.quantity, threshold: DEFAULT_THRESHOLD },
      });
      await tx.sareeColourway.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          designId: c.designId,
          materialId: c.materialId,
          colourName: c.colourName,
          colourHex: c.colourHex,
          lotId: PLACEHOLDER_LOT,
          sku: c.sku,
        },
      });
    }

    for (const [index, j] of seedJacketMaterials.entries()) {
      await tx.jacketMaterial.upsert({
        where: { id: j.id },
        update: {},
        create: { ...j, sortOrder: index },
      });
    }

    for (const c of seedJacketColourways) {
      await tx.stockItem.upsert({
        where: { sku: c.sku },
        update: {},
        create: { sku: c.sku, quantity: c.quantity, threshold: DEFAULT_THRESHOLD },
      });
      await tx.jacketColourway.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          materialId: c.materialId,
          colourName: c.colourName,
          colourHex: c.colourHex,
          lotId: PLACEHOLDER_LOT,
          sku: c.sku,
        },
      });
    }

    for (const [index, l] of seedListings.entries()) {
      await tx.curatedListing.upsert({
        where: { id: l.id },
        update: {},
        create: { ...l, sortOrder: index },
      });
    }
  }, { timeout: 60_000 });

  const counts = {
    designs: await prisma.sareeDesign.count(),
    prices: await prisma.priceMatrix.count(),
    sareeColourways: await prisma.sareeColourway.count(),
    jacketColourways: await prisma.jacketColourway.count(),
    stockItems: await prisma.stockItem.count(),
    listings: await prisma.curatedListing.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
