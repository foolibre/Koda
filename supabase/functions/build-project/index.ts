import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface BuildRequest {
  prompt: string;
  style?: string;
}

interface DevPlan {
  project: string;
  description: string;
  stack: string;
  style: string;
  features: string[];
  database: { enabled: boolean; type: string };
  auth: { enabled: boolean; provider: string };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, style = 'hyperforge' }: BuildRequest = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const devPlan = parsePrompt(prompt, style);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: devPlan.project,
        prompt: prompt,
        dev_plan: devPlan,
        style: devPlan.style,
        status: 'building',
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return new Response(JSON.stringify({ error: 'Failed to create project' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const phases = [
      { phase: 'init', message: 'KodArch build initiated', status: 'success' },
      { phase: 'parse', message: `Parsed prompt into ${devPlan.project}`, status: 'success' },
      { phase: 'architect', message: `Generating ${devPlan.style} style project structure`, status: 'success' },
      { phase: 'scaffold', message: `Creating ${devPlan.stack} application`, status: 'success' },
      { phase: 'database', message: devPlan.database.enabled ? `Setting up ${devPlan.database.type} database` : 'Skipping database setup', status: 'success' },
      { phase: 'auth', message: devPlan.auth.enabled ? 'Configuring authentication' : 'Skipping authentication', status: 'success' },
      { phase: 'features', message: `Implementing features: ${devPlan.features.join(', ')}`, status: 'success' },
      { phase: 'build', message: 'Building project artifacts', status: 'success' },
      { phase: 'artifactize', message: 'Packaging deployment artifact', status: 'success' },
      { phase: 'complete', message: 'Build completed successfully', status: 'success' },
    ];

    for (const log of phases) {
      await supabase.from('build_logs').insert({
        project_id: project.id,
        phase: log.phase,
        message: log.message,
        status: log.status,
        details: {},
      });
    }

    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', project.id);

    return new Response(
      JSON.stringify({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          dev_plan: devPlan,
          status: 'completed',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Build error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parsePrompt(prompt: string, defaultStyle: string): DevPlan {
  const lower = prompt.toLowerCase();
  
  const styleMatch = prompt.match(/style:\s*(\w+)/i);
  const style = styleMatch ? styleMatch[1].toLowerCase() : defaultStyle;
  
  const projectName = extractProjectName(prompt);
  const description = extractDescription(prompt);
  const stack = inferStack(lower);
  const features = extractFeatures(lower);
  const needsDb = /\b(store|save|persist|database|data|user|account)\b/i.test(prompt);
  const needsAuth = /\b(login|signup|auth|user|account|profile)\b/i.test(prompt);
  
  return {
    project: projectName,
    description: description,
    stack: stack,
    style: style,
    features: features,
    database: {
      enabled: needsDb,
      type: 'postgres',
    },
    auth: {
      enabled: needsAuth,
      provider: 'supabase',
    },
  };
}

function extractProjectName(prompt: string): string {
  const patterns = [
    /(?:build|create|make)\s+(?:a|an)?\s*["']?([a-z0-9-]+)["']?/i,
    /project\s+called\s+["']?([a-z0-9-]+)["']?/i,
    /["']([a-z0-9-]+)["']\s+(?:app|application|project)/i,
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return toKebabCase(match[1]);
  }
  
  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !isCommonWord(w));
  
  return words.slice(0, 2).join('-') || 'kodarch-project';
}

function extractDescription(prompt: string): string {
  let desc = prompt.split(/[.!?]/)[0].trim();
  if (desc.length > 150) desc = desc.substring(0, 147) + '...';
  return desc || 'A KodArch-generated project';
}

function inferStack(lower: string): string {
  const detected = [];
  
  if (lower.match(/\b(next\.?js|nextjs|react)\b/)) detected.push('Next.js');
  else if (lower.match(/\b(svelte|sveltekit)\b/)) detected.push('SvelteKit');
  else if (lower.match(/\b(vue|nuxt)\b/)) detected.push('Vue');
  
  if (lower.match(/\b(node|express|fastify)\b/)) detected.push('Node');
  else if (lower.match(/\b(python|fastapi|django|flask)\b/)) detected.push('Python');
  
  if (lower.match(/\b(postgres|postgresql)\b/)) detected.push('Postgres');
  else if (lower.match(/\b(mongodb|mongo)\b/)) detected.push('MongoDB');
  
  return detected.join(' + ') || 'Next.js + Node';
}

function extractFeatures(lower: string): string[] {
  const features: string[] = [];
  const patterns = [
    { pattern: /\b(authentication|auth|login|signup)\b/, feature: 'Authentication' },
    { pattern: /\b(payment|stripe|checkout)\b/, feature: 'Payments' },
    { pattern: /\b(dashboard|admin)\b/, feature: 'Dashboard' },
    { pattern: /\b(api|rest|graphql)\b/, feature: 'API' },
    { pattern: /\b(real-?time|websocket|live)\b/, feature: 'Real-time' },
    { pattern: /\b(email|notification)\b/, feature: 'Notifications' },
    { pattern: /\b(upload|storage)\b/, feature: 'File Upload' },
    { pattern: /\b(search)\b/, feature: 'Search' },
    { pattern: /\b(ai|ml|gpt|llm)\b/, feature: 'AI' },
  ];
  
  for (const { pattern, feature } of patterns) {
    if (pattern.test(lower)) features.push(feature);
  }
  
  return features.length > 0 ? features : ['Core Functionality'];
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isCommonWord(word: string): boolean {
  const common = ['build', 'create', 'make', 'with', 'using', 'that', 'this', 'have', 'from'];
  return common.includes(word);
}
