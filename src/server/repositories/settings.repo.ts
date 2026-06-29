import { db } from "@/lib/db";

export const settingsRepo = {
  async all(): Promise<Record<string, string>> {
    const rows = await db.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  async setMany(map: Record<string, string>): Promise<void> {
    await db.$transaction(
      Object.entries(map).map(([key, value]) =>
        db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
      ),
    );
  },
};
