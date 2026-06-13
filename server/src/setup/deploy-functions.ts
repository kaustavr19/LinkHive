import { functions, DATABASE_ID, COLLECTION_LINKS } from '../config/appwrite.js';
import { Runtime } from 'node-appwrite';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import * as tar from 'tar';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

const ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';

interface FunctionDef {
  id: string;
  name: string;
  entrypoint: string;
  sourceFile: string;
  events: string[];
  timeout: number;
  httpMethod?: string;
}

const FUNCTIONS: FunctionDef[] = [
  {
    id: 'links-api',
    name: 'Links API',
    entrypoint: 'index.js',
    sourceFile: 'src/functions/links-api.ts',
    events: [],
    timeout: 60,
  },
  {
    id: 'enrich-link',
    name: 'Enrich Link',
    entrypoint: 'index.js',
    sourceFile: 'src/functions/enrich-link.ts',
    events: [`databases.${DATABASE_ID}.collections.${COLLECTION_LINKS}.documents.*.create`],
    timeout: 30,
  },
];

const FUNCTION_ENV: Record<string, string> = {
  APPWRITE_ENDPOINT: ENDPOINT,
  APPWRITE_PROJECT_ID: PROJECT_ID,
  APPWRITE_API_KEY: API_KEY,
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_COLLECTION_LINKS: COLLECTION_LINKS,
};

function bundleFunction(def: FunctionDef): string {
  const buildDir = resolve(ROOT, '.build', def.id);
  if (existsSync(buildDir)) {
    rmSync(buildDir, { recursive: true, force: true });
  }
  mkdirSync(buildDir, { recursive: true });

  const pkg = {
    name: def.id,
    version: '1.0.0',
    type: 'module',
    main: 'index.js',
    dependencies: {
      'node-appwrite': '^14.0.0',
      'node-html-parser': '^6.1.13',
      'zod': '^3.23.8',
    },
  };
  writeFileSync(resolve(buildDir, 'package.json'), JSON.stringify(pkg, null, 2));

  const libDir = resolve(buildDir, 'lib');
  mkdirSync(libDir, { recursive: true });
  const configDir = resolve(buildDir, 'config');
  mkdirSync(configDir, { recursive: true });

  const libFiles = ['categorize.ts', 'metadata.ts', 'search.ts', 'validation.ts'];
  for (const f of libFiles) {
    const src = resolve(ROOT, 'src/lib', f);
    if (existsSync(src)) {
      writeFileSync(resolve(libDir, f), readFileSync(src, 'utf-8'));
    }
  }

  const constantsSrc = resolve(ROOT, 'src/config/constants.ts');
  if (existsSync(constantsSrc)) {
    writeFileSync(resolve(configDir, 'constants.ts'), readFileSync(constantsSrc, 'utf-8'));
  }

  const fnSrc = resolve(ROOT, def.sourceFile);
  let fnContent = readFileSync(fnSrc, 'utf-8');
  fnContent = fnContent.replace(/from ['"]\.\.\/lib\//g, "from './lib/");
  fnContent = fnContent.replace(/from ['"]\.\.\/config\//g, "from './config/");

  writeFileSync(resolve(buildDir, 'index.ts'), fnContent);

  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      outDir: './dist',
      rootDir: '.',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      declaration: false,
      sourceMap: false,
    },
    include: ['./**/*.ts'],
    exclude: ['node_modules'],
  };
  writeFileSync(resolve(buildDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  console.log(`  Bundling ${def.id}...`);
  execSync('npm install --omit=dev', { cwd: buildDir, stdio: 'pipe' });
  execSync('npx tsc', { cwd: buildDir, stdio: 'pipe' });

  writeFileSync(
    resolve(buildDir, 'index.js'),
    `export { default } from './dist/index.js';\n`,
  );

  return buildDir;
}

async function ensureFunction(def: FunctionDef): Promise<string> {
  try {
    const fn = await functions.get(def.id);
    console.log(`  • Function exists: ${def.id}`);
    await functions.update(
      def.id,
      def.name,
      undefined,
      undefined,
      def.events.length > 0 ? def.events : undefined,
      undefined,
      def.timeout,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    return fn.$id;
  } catch (e: any) {
    if (e.code === 404) {
      console.log(`  ✓ Creating function: ${def.id}`);
      const fn = await functions.create(
        def.id,
        def.name,
        Runtime.Node180,
        ['users'],
        def.events,
        undefined,
        def.timeout,
        undefined,
        undefined,
        def.entrypoint,
      );
      return fn.$id;
    }
    throw e;
  }
}

async function deployFunction(def: FunctionDef, buildDir: string): Promise<void> {
  const tarPath = resolve(ROOT, '.build', `${def.id}.tar.gz`);
  await tar.create(
    { gzip: true, file: tarPath, cwd: buildDir },
    readdirSync(buildDir),
  );

  console.log(`  Deploying ${def.id}...`);

  const { InputFile } = await import('node-appwrite/file');
  const file = InputFile.fromPath(tarPath, `${def.id}.tar.gz`);

  const deployment = await functions.createDeployment(
    def.id,
    file,
    true,
    def.entrypoint,
    undefined,
  );

  console.log(`  ✓ Deployed: ${def.id} (deployment: ${deployment.$id})`);
}

async function setFunctionVariables(functionId: string): Promise<void> {
  try {
    const existing = await functions.listVariables(functionId);
    for (const v of existing.variables) {
      await functions.deleteVariable(functionId, v.$id);
    }
  } catch {
    void 0;
  }

  for (const [key, value] of Object.entries(FUNCTION_ENV)) {
    await functions.createVariable(functionId, key, value);
  }
}

async function main() {
  console.log('\n🚀 LinkHive — Deploy Functions\n');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project:  ${PROJECT_ID}`);
  console.log(`Functions: ${FUNCTIONS.length}\n`);

  const buildRoot = resolve(ROOT, '.build');
  mkdirSync(buildRoot, { recursive: true });

  for (const def of FUNCTIONS) {
    console.log(`\n─── ${def.name} (${def.id}) ───`);

    const buildDir = bundleFunction(def);

    const fnId = await ensureFunction(def);

    await setFunctionVariables(fnId);
    console.log(`  ✓ Variables set`);

    await deployFunction(def, buildDir);
  }

  console.log('\n✅ All functions deployed!\n');
  console.log('Event-triggered functions:');
  for (const def of FUNCTIONS) {
    if (def.events.length > 0) {
      console.log(`  • ${def.name}: ${def.events.join(', ')}`);
    }
  }
  console.log('\nHTTP functions (call via Appwrite SDK or REST):');
  for (const def of FUNCTIONS) {
    if (!def.events.length) {
      console.log(`  • ${def.name}: ${def.httpMethod || 'ANY'} /v1/functions/${def.id}/executions`);
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err.message);
  console.error(err);
  process.exit(1);
});
