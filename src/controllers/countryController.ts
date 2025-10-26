import type { Request, Response, NextFunction } from 'express';
import * as countryService from '../services/countryService.ts';
// import * as imageService from '../services/imageService.ts';
import { prisma } from '../config/db.ts';

export async function refreshCountries(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await countryService.refreshCountries();
    // await imageService.generateSummaryImage();
    res.status(200).json({ message: 'Countries refreshed successfully', ...result });
  } catch (err) {
    next(err);
  }
}

export async function getCountries(req: Request, res: Response, next: NextFunction) {
    // console.log('Inside getCountries controller');
  try {
    const { region, currency, sort } = req.query;
    // console.log('Query parameters:', req.query);
    const opts: { region?: string; currency?: string; sort?: string } = {};
    if (region) opts.region = region.toString();
    if (currency) opts.currency = currency.toString();
    if (sort) opts.sort = sort.toString();

    const countries = await countryService.getCountries(opts);
    // console.log('Countries to be returned:', countries, "CONTROLLER");
    res.json(countries);
  } catch (err) {
    next(err);
  }
}

export async function getCountryByName(req: Request, res: Response, next: NextFunction) {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'name parameter is required' });
    const country = await countryService.getCountryByName(name);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country);
  } catch (err) {
    next(err);
  }
}

export async function deleteCountry(req: Request, res: Response, next: NextFunction) {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'name parameter is required' });
    const deleted = await countryService.deleteCountry(name);
    if (!deleted) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json({ message: `${name} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

export async function getSummaryImage(req: Request, res: Response, next: NextFunction) {
  try {
    const imagePath = await countryService.getSummaryImagePath();
    if (!imagePath) {
      return res.status(404).json({ error: 'Summary image not found' });
    }
    res.sendFile(imagePath);
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const totalCountries = await prisma.country.count();

    const meta = await prisma.metadata.findFirst({
      where: { key: 'last_refreshed_at' },
    });

    const lastRefreshedAt = meta?.value ?? null;

    res.json({
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshedAt,
    });
  } catch (err) {
    next(err);
  }
}
