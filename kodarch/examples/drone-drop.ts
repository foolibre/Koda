import { KodArch } from '../index';

async function main() {
  const prompt = `
Create an AI-powered drone delivery prototype in Hyperforge mode.

The system should track drone fleets, manage delivery routes, and provide
real-time status updates. Include authentication, a dashboard for operators,
and API endpoints for drone communication.

style:hyperforge
stack:Next.js + Node + Postgres
db:postgres
deploy:vercel,docker,fly.io
`;

  console.log('🧱 KodArch — Foolibre Labs');
  console.log('Starting build: drone-drop\n');

  const kodarch = new KodArch('./workspace', './artifacts');

  const devPlan = kodarch.getDevPlan(prompt);
  console.log('📋 DevPlan Generated:');
  console.log(JSON.stringify(devPlan, null, 2));
  console.log('\n');

  const zipPath = await kodarch.build(prompt);

  console.log('\n✅ Build Complete');
  console.log(`📦 Artifact: ${zipPath}`);
  console.log('\n📄 Build Logs:');
  console.log(kodarch.getBuildLogs());

  console.log('\n🧱 KODARCH BUILD SUCCESSFUL.');
  console.log('ARTIFACT READY.');
  console.log('FOOLIBRE LABS — THE MACHINE NOW BUILDS ITSELF.\n');
}

main().catch(console.error);
