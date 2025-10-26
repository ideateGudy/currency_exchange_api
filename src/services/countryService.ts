import { prisma } from '../config/db.ts';
import { createCanvas } from 'canvas';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import metaService from './metaService.ts';
import fsSync from 'fs';
// import * as imageService from './imageService.ts';

import type { Country, CountryInterface } from '../types/index.ts';
// import { CountryInterface } from '../types/index.ts';

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';

function randomMultiplier() {
  return Math.random() * (2000 - 1000);
}

const capitalize = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
// function randomMultiplier() {
//   return Math.random() * (2000 - 1000) + 1000;
// }

export async function getCountries({ region, currency, sort }: { region?: string; currency?: string; sort?: string }) {
  const where: any = {};
  if (region !== undefined) where.region = region;
  if (currency !== undefined) where.currency_code = currency;

  const countries = await prisma.country.findMany({
    where,
    orderBy:
      sort === 'gdp_desc'
        ? { estimated_gdp: 'desc' }
        : sort === 'gdp_asc'
        ? { estimated_gdp: 'asc' }
        : { name: 'asc' }
  });

  return countries;
}

export async function getCountryByName(name: string) {
   const capitalized = capitalize(name);
   return prisma.country.findUnique({ where: { name: capitalized } });
}

export async function deleteCountry(name: string) {
    const capitalized = capitalize(name);
  try {
    await prisma.country.delete({ where: { name: capitalized } });
    return true;
  } catch {
    return false;
  }
}

export async function refreshCountries() {
  let countriesResp, ratesResp;
  try {
    const [cRes, rRes] = await Promise.all([
      axios.get(COUNTRIES_API, ),
      axios.get(EXCHANGE_API, )
    ]);

    if (cRes.status < 200 || cRes.status >= 300 || rRes.status < 200 || rRes.status >= 300) {
      throw new Error('External fetch failed');
    }

    countriesResp = cRes.data;
    ratesResp = rRes.data;
  } catch (e: any) {
    return { status: 503, body: { error: 'External data source unavailable', details: e?.message ?? String(e) } };
  }

  const ratesMap: Record<string, number> = ratesResp?.rates || {};
  const now = new Date();

  const transaction = await prisma.$transaction(async (tx: any) => {
    for (const c of countriesResp) {
      const population = Number(c.population || 0);
      if (!c.name || !population) continue;

      const currency = Array.isArray(c.currencies) && c.currencies.length > 0 ? c.currencies[0].code : null;
      let exchange_rate: number | null = null;
      let estimated_gdp: number | null = null;

      if (!currency) {
        estimated_gdp = 0;
        exchange_rate = null;
      } else if (!ratesMap[currency]) {
        estimated_gdp = null;
      } else {
        exchange_rate = ratesMap[currency];
        estimated_gdp = (population * randomMultiplier()) / exchange_rate;
      }

        const capitalized = capitalize(c.name);
        console.log('Upserting country:', capitalized);
      
      await tx.country.upsert({
        where: { name: capitalized },
        update: {
          name: c.name,
          capital: c.capital || null,
          region: c.region || null,
          population,
          currency_code: currency,
          exchange_rate,
          estimated_gdp,
          flag_url: c.flag || null,
          last_refreshed_at: now
        },
        create: {
          name: c.name,
          capital: c.capital || null,
          region: c.region || null,
          population,
          currency_code: currency,
          exchange_rate,
          estimated_gdp,
          flag_url: c.flag || null,
          last_refreshed_at: now
        }
      });
    }

});

    const lastRefreshedAt = await metaService.setLastRefreshedAt(now);
     await generateSummaryImageDark();
    return {transaction,  lastRefreshedAt}
}

// export async function generateSummaryImage(now?: Date) {
//   const date = now ?? new Date();
//   const { createCanvas } = await import('canvas');
//   const total = await prisma.country.count();
//   const top = await prisma.country.findMany({
//     where: { estimated_gdp: { not: null } },
//     orderBy: { estimated_gdp: 'desc' },
//     take: 5
//   });

//   const canvas = createCanvas(1000, 600);
//   const ctx = canvas.getContext('2d');
//   ctx.fillStyle = '#fff';
//   ctx.fillRect(0, 0, 1000, 600);

//   ctx.fillStyle = '#111';
//   ctx.font = 'bold 28px Sans';
//   ctx.fillText(`Total countries: ${total}`, 40, 60);
//   ctx.font = '20px Sans';
//   ctx.fillText(`Last refresh: ${date.toISOString()}`, 40, 100);

//   ctx.font = '22px Sans';
//   ctx.fillText('Top 5 countries by estimated_gdp:', 40, 150);

//   let y = 190;
//   for (const row of top) {
//     ctx.font = '18px Sans';
//     ctx.fillText(`${row.name} — ${row.estimated_gdp?.toLocaleString() ?? 'N/A'}`, 60, y);
//     y += 36;
//   }

//   const cacheDir = process.env.CACHE_DIR || './cache';
//   await fs.mkdir(cacheDir, { recursive: true });
//   await fs.writeFile(path.join(cacheDir, 'summary.png'), canvas.toBuffer('image/png'));
// }

const CACHE_DIR = process.env.CACHE_DIR
  ? path.resolve(process.cwd(), process.env.CACHE_DIR)
  : path.resolve(process.cwd(), 'cache');
const SUMMARY_PATH = path.join(CACHE_DIR, 'summary.png');

export async function getSummaryImagePath(): Promise<string | null> {
  return fsSync.existsSync(SUMMARY_PATH) ? SUMMARY_PATH : null;
}

export async function generateSummaryImageDark() {
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

export default {
  getCountries,
  getCountryByName,
  deleteCountry,
  refreshCountries,
  generateSummaryImageDark,
  getSummaryImagePath
};