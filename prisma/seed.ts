// Loads the sample cafés from src/lib/sample-data.ts.
//
// Running the seed REPLACES all cafes and tastings in the database.

import { PrismaClient } from "@prisma/client";
import { sampleCafes as cafes } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.tasting.deleteMany();
  await prisma.cafe.deleteMany();

  for (const { tastings = [], ...cafe } of cafes) {
    await prisma.cafe.create({
      data: {
        ...cafe,
        tastings: { create: tastings.map((t) => ({ ...t, visitedOn: new Date(t.visitedOn) })) },
      },
    });
  }

  const tastingCount = cafes.reduce((n, c) => n + (c.tastings?.length ?? 0), 0);
  console.log(`Seeded ${cafes.length} cafés and ${tastingCount} tastings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
