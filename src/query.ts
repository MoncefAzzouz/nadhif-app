import prisma from './lib/prisma';

async function main() {
  const cats = await prisma.category.findMany({
    include: { categoryServices: true }
  });
  console.log("All categories in DB:", JSON.stringify(cats, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
