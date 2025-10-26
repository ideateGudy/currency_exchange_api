import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { prisma } from '../config/db.ts';

const CACHE_DIR = process.env.CACHE_DIR
  ? path.resolve(process.cwd(), process.env.CACHE_DIR)
  : path.resolve(process.cwd(), 'cache');
const SUMMARY_PATH = path.join(CACHE_DIR, 'summary.png');

export async function generateSummaryImage() {
  if (!fsSync.existsSync(CACHE_DIR)) fsSync.mkdirSync(CACHE_DIR, { recursive: true });

  const totalCountries = await prisma.country.count();
  console.log('Total countries:', totalCountries);

  const topCountries = await prisma.country.findMany({
    where: { estimated_gdp: { not: null } },
    orderBy: { estimated_gdp: 'desc' },
    take: 5,
    select: { name: true, estimated_gdp: true },
  });

  console.log('Top countries:', topCountries);

  const status = await prisma.metadata.findFirst({ where: { key: 'last_refreshed_at' } });
  console.log('Status:', status);

  const lastRefreshed = status?.value ?? new Date().toISOString();

  console.log('Last refreshed at:', lastRefreshed);


  const width = 700;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Sans';
  ctx.fillText('Country Summary', 30, 60);

  // Total count
  ctx.font = '20px Sans';
  ctx.fillText(`Total Countries: ${totalCountries}`, 30, 120);

  // Top 5 countries by GDP
  ctx.fillText('Top 5 Countries by Estimated GDP:', 30, 170);
  ctx.font = '18px Sans';

  let y = 200;
  for (const [index, country] of topCountries.entries()) {
    ctx.fillText(
      `${index + 1}. ${country.name} — ${country.estimated_gdp?.toLocaleString() ?? 'N/A'}`,
      50,
      y
    );
    y += 30;
  }

  // Timestamp
  ctx.font = '16px Sans';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`Last Refreshed: ${new Date(lastRefreshed).toUTCString()}`, 30, height - 40);

  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(SUMMARY_PATH, buffer);
}

export async function getSummaryImagePath(): Promise<string | null> {
  return fsSync.existsSync(SUMMARY_PATH) ? SUMMARY_PATH : null;
}
