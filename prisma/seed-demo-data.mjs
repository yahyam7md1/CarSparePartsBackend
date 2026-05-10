/**
 * Demo catalog seed (SAR-priced parts, vehicles, fitments).
 * Does NOT touch admin credentials — run separately from `prisma db seed` (seed.mjs).
 *
 * Usage: npm run seed:demo
 * Requires: DATABASE_URL in .env
 *
 * All demo rows are tagged so re-running removes prior demo data only:
 * - Products: SKU prefix SEED-DEMO-
 * - Categories: slug prefix seed-cat-
 * - Vehicles: chassisCode prefix SEED-V-
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(rootDir, ".env") });

const prisma = new PrismaClient();

const SKU_PREFIX = "SEED-DEMO-";
const CAT_SLUG_PREFIX = "seed-cat-";
const VEHICLE_CHASSIS_PREFIX = "SEED-V-";

/** Placeholder images (HTTPS; storefront getMediaUrl accepts absolute URLs). */
function placeholderImagePair(seed) {
  const thumb = `https://picsum.photos/seed/${seed}/320/320`;
  const large = `https://picsum.photos/seed/${seed}/800/800`;
  return { urlThumb: thumb, urlLarge: large };
}

async function clearDemoData() {
  const skuFilter = { startsWith: SKU_PREFIX };
  const catSlugFilter = { startsWith: CAT_SLUG_PREFIX };
  const chassisFilter = { startsWith: VEHICLE_CHASSIS_PREFIX };

  await prisma.fitment.deleteMany({
    where: { product: { sku: skuFilter } },
  });
  await prisma.productOem.deleteMany({
    where: { product: { sku: skuFilter } },
  });
  await prisma.productImage.deleteMany({
    where: { product: { sku: skuFilter } },
  });
  await prisma.product.deleteMany({ where: { sku: skuFilter } });
  await prisma.vehicle.deleteMany({ where: { chassisCode: chassisFilter } });
  await prisma.category.deleteMany({
    where: { slug: catSlugFilter, parentId: { not: null } },
  });
  await prisma.category.deleteMany({
    where: { slug: catSlugFilter, parentId: null },
  });
}

const PARENT_CATEGORIES = [
  { slug: "braking", nameEn: "Braking", nameAr: "المكابح والفرامل" },
  { slug: "filters", nameEn: "Filters", nameAr: "المرشحات والفلاتر" },
  { slug: "engine", nameEn: "Engine", nameAr: "المحرك" },
  { slug: "electrical", nameEn: "Electrical", nameAr: "النظام الكهربائي" },
  { slug: "suspension", nameEn: "Suspension", nameAr: "التعليق والمقصات" },
];

const CHILD_CATEGORIES = [
  ["braking", "brake-pads", "Brake pads", "تيل فرامل"],
  ["braking", "brake-discs", "Brake discs", "أقراص فرامل"],
  ["filters", "oil-filters", "Oil filters", "فلتر زيت"],
  ["filters", "air-filters", "Air filters", "فلتر هواء"],
  ["engine", "timing-belts", "Timing belts", "سير توقيت"],
  ["engine", "gaskets", "Gaskets & seals", "جوائت ومساطر"],
  ["electrical", "spark-plugs", "Spark plugs", "بواجي"],
  ["electrical", "sensors", "Sensors", "حساسات"],
  ["suspension", "shocks", "Shock absorbers", "مساعدات"],
  ["suspension", "control-arms", "Control arms", "مقصات وذراع توجيه"],
];

const VEHICLE_DEFS = [
  ["BMW", "3 Series", "320i", "E90", "2005-2012", "E90", "بي إم دبليو الفئة الثالثة"],
  ["BMW", "3 Series", "328i", "F30", "2012-2019", "F30", "بي إم دبليو الفئة الثالثة"],
  ["BMW", "3 Series", "330i", "G20", "2019-2024", "G20", "بي إم دبليو الفئة الثالثة"],
  ["BMW", "5 Series", "530i", "E60", "2003-2010", "E60", "بي إم دبليو الفئة الخامسة"],
  ["BMW", "5 Series", "535i", "F10", "2010-2017", "F10", "بي إم دبليو الفئة الخامسة"],
  ["BMW", "X5", "xDrive35i", "F15", "2014-2018", "F15", "بي إم دبليو X5"],
  ["Mini", "Hatch", "Cooper", "R56", "2007-2014", "R56", "ميني كوبر"],
  ["Mini", "Hatch", "Cooper S", "F56", "2014-2024", "F56", "ميني كوبر إس"],
  ["Audi", "A4", "2.0 TFSI", "B8", "2008-2015", "B8", "أودي A4"],
  ["Audi", "A4", "45 TFSI", "B9", "2016-2023", "B9", "أودي A4"],
  ["Audi", "A6", "3.0 TFSI", "C7", "2011-2018", "C7", "أودي A6"],
  ["Audi", "Q5", "2.0 TFSI", "FY", "2017-2024", "FY", "أودي Q5"],
  ["Volkswagen", "Golf", "GTI", "MK7", "2013-2020", "MK7", "فولكس فاجن جولف"],
  ["Volkswagen", "Golf", "R", "MK8", "2021-2024", "MK8", "فولكس فاجن جولف R"],
  ["Volkswagen", "Passat", "2.0 TSI", "B8", "2015-2022", "B8-PAS", "فولكس فاجن باسات"],
  ["Volkswagen", "Tiguan", "2.0 TSI", "AD1", "2016-2024", "AD1", "فولكس فاجن تيجوان"],
];

const BRANDS_ROTATION = ["BMW", "Mini", "Audi", "Volkswagen", "BMW", "Audi"];

const MOVEMENT_ROTATION = ["fast", "medium", "slow"];

function sarPrice(base, idx) {
  const n = base + idx * 17 + (idx % 7) * 29;
  return String((Math.round(n * 100) / 100).toFixed(2));
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");
  }

  console.log("Clearing previous demo data (seed-cat-*, SEED-DEMO-*, SEED-V-*)…");
  await clearDemoData();

  console.log("Creating categories…");
  const parentIdByKey = new Map();
  for (const p of PARENT_CATEGORIES) {
    const slug = `${CAT_SLUG_PREFIX}${p.slug}`;
    const row = await prisma.category.create({
      data: {
        slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        parentId: null,
      },
    });
    parentIdByKey.set(p.slug, row.id);
  }

  const leafCategoryIds = [];
  for (const [parentKey, childKey, nameEn, nameAr] of CHILD_CATEGORIES) {
    const parentId = parentIdByKey.get(parentKey);
    const slug = `${CAT_SLUG_PREFIX}${parentKey}-${childKey}`;
    const row = await prisma.category.create({
      data: {
        slug,
        nameEn,
        nameAr,
        parentId,
      },
    });
    leafCategoryIds.push(row.id);
  }

  console.log("Creating vehicles…");
  const vehicleIds = [];
  for (let i = 0; i < VEHICLE_DEFS.length; i++) {
    const [brand, series, specifics, chassisShort, yearRange, codeKey, nameAr] =
      VEHICLE_DEFS[i];
    const chassisCode = `${VEHICLE_CHASSIS_PREFIX}${codeKey}`;
    const nameEn = `${brand} ${series} ${specifics}`.trim();
    const v = await prisma.vehicle.create({
      data: {
        brand,
        series,
        specifics,
        chassisCode,
        yearRange,
        nameEn,
        nameAr,
        generation: chassisShort,
      },
    });
    vehicleIds.push(v.id);
  }

  console.log("Creating products, images, OEMs, fitments…");
  let productIndex = 0;
  for (const categoryId of leafCategoryIds) {
    const productsInLeaf = 5;
    for (let j = 0; j < productsInLeaf; j++) {
      productIndex += 1;
      const sku = `${SKU_PREFIX}${String(productIndex).padStart(4, "0")}`;
      const brandName = BRANDS_ROTATION[productIndex % BRANDS_ROTATION.length];
      const movementClass = MOVEMENT_ROTATION[productIndex % MOVEMENT_ROTATION.length];
      const price = sarPrice(45, productIndex);
      const compareAt =
        productIndex % 4 === 0 ? sarPrice(120, productIndex + 3) : null;
      const isFeatured = productIndex % 6 === 0;

      const nameEn = `${brandName} spare part #${productIndex}`;
      const nameAr = `قطعة تجريبية ${productIndex} — ${brandName}`;
      const descEn = `Seeded demo product for UI testing. Price in SAR. SKU ${sku}.`;
      const descAr = `منتج تجريبي للعرض. السعر بالريال السعودي. رقم ${sku}.`;

      const product = await prisma.product.create({
        data: {
          sku,
          brandName,
          categoryId,
          nameEn,
          nameAr,
          descEn,
          descAr,
          price,
          compareAtPrice: compareAt,
          stockQuantity: 5 + (productIndex % 40),
          movementClass,
          isFeatured,
          isActive: true,
          condition: "new",
          dimensions: `${180 + (productIndex % 50)}×${90 + (productIndex % 30)}×${40 + (productIndex % 20)} mm`,
          weight: 0.3 + (productIndex % 17) * 0.15,
          manufacturedIn: productIndex % 2 === 0 ? "DE" : "CN",
          generation: ["OEM", "Aftermarket", "Performance"][productIndex % 3],
        },
      });

      const { urlThumb, urlLarge } = placeholderImagePair(sku);
      await prisma.productImage.create({
        data: {
          productId: product.id,
          urlThumb,
          urlLarge,
          isMain: true,
          sortOrder: 0,
        },
      });

      if (productIndex % 2 === 0) {
        await prisma.productOem.create({
          data: {
            productId: product.id,
            value: `OEM-${100000 + productIndex}`,
            sortOrder: 0,
          },
        });
      }
      if (productIndex % 5 === 0) {
        await prisma.productOem.create({
          data: {
            productId: product.id,
            value: `ALT-${8000 + productIndex}`,
            sortOrder: 1,
          },
        });
      }

      const nFit = 2 + (productIndex % 3);
      for (let f = 0; f < nFit; f++) {
        const vehicleId = vehicleIds[(productIndex + f) % vehicleIds.length];
        await prisma.fitment.create({
          data: {
            productId: product.id,
            vehicleId,
          },
        });
      }
    }
  }

  const productCount = await prisma.product.count({ where: { sku: { startsWith: SKU_PREFIX } } });
  const vehicleCount = vehicleIds.length;
  const catCount = await prisma.category.count({ where: { slug: { startsWith: CAT_SLUG_PREFIX } } });

  console.log("Demo seed done.");
  console.log(`  Categories (demo): ${catCount}`);
  console.log(`  Vehicles (demo): ${vehicleCount}`);
  console.log(`  Products (demo): ${productCount}`);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
