import { prisma } from '../config/db.ts';

export default {
  async setLastRefreshedAt(date: Date) {
    await prisma.metadata.upsert({
      where: { key: 'last_refreshed_at' },
      update: { value: date.toISOString() },
      create: { key: 'last_refreshed_at', value: date.toISOString() }
    });
  },

  async getLastRefreshedAt() {
    const m = await prisma.metadata.findUnique({ where: { key: 'last_refreshed_at' } });
    return m?.value ?? null;
  },

  async getTotalCountries() {
    return prisma.country.count();
  }
};