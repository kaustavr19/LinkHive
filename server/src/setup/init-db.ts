import { databases, DATABASE_ID, COLLECTION_LINKS, COLLECTION_USERS, BUCKET_ID, storage } from '../config/appwrite.js';
import { Permission, Role, IndexType } from 'node-appwrite';

async function createDatabase() {
  try {
    await databases.create(DATABASE_ID, 'LinkHive DB');
    console.log('✓ Database created:', DATABASE_ID);
  } catch (e: any) {
    if (e.code === 409) {
      console.log('• Database already exists:', DATABASE_ID);
    } else {
      throw e;
    }
  }
}

async function createLinksCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_LINKS,
      'Links',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true,
    );
    console.log('✓ Collection created:', COLLECTION_LINKS);
  } catch (e: any) {
    if (e.code === 409) {
      console.log('• Collection already exists:', COLLECTION_LINKS);
      return;
    } else {
      throw e;
    }
  }

  const attrs = [
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'userId', 36, true),
    () => databases.createUrlAttribute(DATABASE_ID, COLLECTION_LINKS, 'url', true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'name', 500, true),
    () => databases.createEnumAttribute(DATABASE_ID, COLLECTION_LINKS, 'category', ['jobs', 'socials', 'videos', 'articles', 'uncategorized'], true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'source', 255, false),
    () => databases.createEnumAttribute(DATABASE_ID, COLLECTION_LINKS, 'status', ['applied', 'not_applied', 'rejected'], false),
    () => databases.createBooleanAttribute(DATABASE_ID, COLLECTION_LINKS, 'pinned', false, false),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'tags', 100, false, undefined, true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'searchBlob', 2000, false),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'ogTitle', 500, false),
    () => databases.createUrlAttribute(DATABASE_ID, COLLECTION_LINKS, 'ogImage', false),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_LINKS, 'ogDescription', 1000, false),
  ];

  for (const create of attrs) {
    try {
      await create();
    } catch (e: any) {
      if (e.code === 409) continue;
      console.warn('  Attribute warning:', e.message);
    }
  }
  console.log('  ✓ Attributes created for links');

  await sleep(8000);

  const indexes = [
    () => databases.createIndex(DATABASE_ID, COLLECTION_LINKS, 'idx_userId', IndexType.Key, ['userId']),
    () => databases.createIndex(DATABASE_ID, COLLECTION_LINKS, 'idx_category', IndexType.Key, ['userId', 'category']),
    () => databases.createIndex(DATABASE_ID, COLLECTION_LINKS, 'idx_pinned', IndexType.Key, ['userId', 'pinned']),
    () => databases.createIndex(DATABASE_ID, COLLECTION_LINKS, 'idx_search', IndexType.Fulltext, ['searchBlob']),
    () => databases.createIndex(DATABASE_ID, COLLECTION_LINKS, 'idx_created', IndexType.Key, ['userId', '$createdAt']),
  ];

  for (const create of indexes) {
    try {
      await create();
    } catch (e: any) {
      if (e.code === 409) continue;
      console.warn('  Index warning:', e.message);
    }
  }
  console.log('  ✓ Indexes created for links');
}

async function createUserProfilesCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_USERS,
      'User Profiles',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true,
    );
    console.log('✓ Collection created:', COLLECTION_USERS);
  } catch (e: any) {
    if (e.code === 409) {
      console.log('• Collection already exists:', COLLECTION_USERS);
      return;
    } else {
      throw e;
    }
  }

  const attrs = [
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_USERS, 'userId', 36, true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_USERS, 'displayName', 100, true),
    () => databases.createUrlAttribute(DATABASE_ID, COLLECTION_USERS, 'avatarUrl', false),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTION_USERS, 'preferences', 5000, false, '{}'),
  ];

  for (const create of attrs) {
    try {
      await create();
    } catch (e: any) {
      if (e.code === 409) continue;
      console.warn('  Attribute warning:', e.message);
    }
  }
  console.log('  ✓ Attributes created for user_profiles');

  await sleep(2000);

  try {
    await databases.createIndex(DATABASE_ID, COLLECTION_USERS, 'idx_userId', IndexType.Unique, ['userId']);
  } catch (e: any) {
    if (e.code !== 409) console.warn('  Index warning:', e.message);
  }
  console.log('  ✓ Indexes created for user_profiles');
}

async function createStorageBucket() {
  try {
    await storage.createBucket(
      BUCKET_ID,
      'Link Thumbnails',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
      ],
      false,
      true,
      10 * 1024 * 1024,
      ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    );
    console.log('✓ Storage bucket created:', BUCKET_ID);
  } catch (e: any) {
    if (e.code === 409) {
      console.log('• Storage bucket already exists:', BUCKET_ID);
    } else {
      throw e;
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n🔧 LinkHive — Appwrite Setup\n');
  console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
  console.log('Project:', process.env.APPWRITE_PROJECT_ID);
  console.log('');

  await createDatabase();
  await createLinksCollection();
  await createUserProfilesCollection();
  await createStorageBucket();

  console.log('\n✅ Setup complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
