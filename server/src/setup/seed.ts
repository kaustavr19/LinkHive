import { databases, DATABASE_ID, COLLECTION_LINKS } from '../config/appwrite.js';
import { ID, Permission, Role } from 'node-appwrite';
import { buildSearchBlob } from '../lib/search.js';
import { categorize } from '../lib/categorize.js';

const DEV_USER_ID = process.env.SEED_USER_ID || 'dev-user-001';

const SAMPLE_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.linkedin.com/jobs/view/software-engineer-at-google-123456',
  'https://instagram.com/natgeo',
  'https://medium.com/@user/the-future-of-web-development',
  'https://boards.greenhouse.io/stripe/jobs/senior-frontend-engineer',
  'https://dev.to/user/building-offline-first-apps',
  'https://x.com/elonmusk',
  'https://vimeo.com/76979871',
  'https://news.ycombinator.com/item?id=12345',
  'https://github.com/appwrite/appwrite',
];

async function seed() {
  console.log('\n🌱 Seeding links collection...\n');

  for (const url of SAMPLE_URLS) {
    const { category, source, name } = categorize(url);
    const status = category === 'jobs' ? 'not_applied' : null;

    const data = {
      userId: DEV_USER_ID,
      url,
      name,
      category,
      source,
      status,
      pinned: false,
      tags: [],
      searchBlob: buildSearchBlob({ name, source, url, category, tags: [] }),
      ogTitle: null,
      ogImage: null,
      ogDescription: null,
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_LINKS,
        ID.unique(),
        data,
        [
          Permission.read(Role.user(DEV_USER_ID)),
          Permission.update(Role.user(DEV_USER_ID)),
          Permission.delete(Role.user(DEV_USER_ID)),
        ],
      );
      console.log(`  ✓ ${category.padEnd(14)} ${name}`);
    } catch (e: any) {
      console.warn(`  ✗ Failed: ${url} — ${e.message}`);
    }
  }

  console.log('\n✅ Seed complete!\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
