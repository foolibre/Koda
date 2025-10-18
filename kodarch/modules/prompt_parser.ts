import type { DevPlan } from '../types';

interface ParsedTags {
  style?: string;
  stack?: string;
  license?: string;
  deploy?: string[];
  db?: string;
  auth?: boolean;
}

export class PromptParser {
  private defaultStyle = 'hyperforge';
  private validStyles = ['artisan', 'hyperforge', 'liminal', 'daemon', 'genesis'];

  parse(prompt: string): DevPlan {
    const tags = this.extractTags(prompt);
    const cleanPrompt = this.stripTags(prompt);

    const project = this.extractProjectName(cleanPrompt);
    const description = this.extractDescription(cleanPrompt);
    const stack = tags.stack || this.inferStack(cleanPrompt);
    const features = this.extractFeatures(cleanPrompt);

    return {
      project,
      description,
      stack,
      style: this.validateStyle(tags.style),
      features,
      artifact: {
        zip: true,
        license: tags.license || 'MIT',
        deploy_targets: tags.deploy || this.inferDeployTargets(stack)
      },
      database: {
        enabled: !!tags.db || this.needsDatabase(cleanPrompt),
        type: (tags.db as any) || 'postgres'
      },
      auth: {
        enabled: tags.auth || this.needsAuth(cleanPrompt),
        provider: 'supabase'
      }
    };
  }

  private extractTags(prompt: string): ParsedTags {
    const tags: ParsedTags = {};

    const styleMatch = prompt.match(/style:\s*(\w+)/i);
    if (styleMatch) tags.style = styleMatch[1].toLowerCase();

    const stackMatch = prompt.match(/stack:\s*([^\n]+)/i);
    if (stackMatch) tags.stack = stackMatch[1].trim();

    const licenseMatch = prompt.match(/license:\s*(\w+)/i);
    if (licenseMatch) tags.license = licenseMatch[1].toUpperCase();

    const deployMatch = prompt.match(/deploy:\s*([^\n]+)/i);
    if (deployMatch) {
      tags.deploy = deployMatch[1].split(/[,+]/).map(d => d.trim().toLowerCase());
    }

    const dbMatch = prompt.match(/db:\s*(\w+)/i);
    if (dbMatch) tags.db = dbMatch[1].toLowerCase();

    if (prompt.match(/\bauth\b/i)) tags.auth = true;

    return tags;
  }

  private stripTags(prompt: string): string {
    return prompt
      .replace(/style:\s*\w+/gi, '')
      .replace(/stack:\s*[^\n]+/gi, '')
      .replace(/license:\s*\w+/gi, '')
      .replace(/deploy:\s*[^\n]+/gi, '')
      .replace(/db:\s*\w+/gi, '')
      .trim();
  }

  private extractProjectName(prompt: string): string {
    const patterns = [
      /(?:build|create|make|initialize|scaffold)\s+(?:a|an)?\s+.*(?:named|called)\s+["']?([a-z0-9\s-]+)["']?/i,
      /project\s+(?:named|called)\s+["']?([a-z0-9\s-]+)["']?/i,
      /["']([a-z0-9\s-]+)["']\s+(?:as\s+the\s+project\s+name)/i,
      /["']([a-z0-9\s-]+)["']\s+(?:app|application|project|system)/i,
      /(?:named|called)\s+["']?([a-z0-9\s-]+)["']?$/i
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            return this.toKebabCase(match[1]);
        }
    }

    const words = prompt.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !this.isCommonWord(w));

    return words.length > 0 ? this.toKebabCase(words.slice(0, 2).join(' ')) : 'kodarch-project';
  }

  private extractDescription(prompt: string): string {
    let desc = prompt
      .replace(/\bstyle:\w+\b/gi, '')
      .replace(/\bstack:[^\n]+\b/gi, '')
      .split(/[.!?]/)[0]
      .trim();

    if (desc.length > 150) {
      desc = desc.substring(0, 147) + '...';
    }

    return desc || 'A KodArch-generated project';
  }

  private inferStack(prompt: string): string {
    const lower = prompt.toLowerCase();
    const detected = [];

    if (lower.match(/\b(next\.?js|nextjs|react)\b/)) detected.push('Next.js');
    else if (lower.match(/\b(svelte|sveltekit)\b/)) detected.push('SvelteKit');
    else if (lower.match(/\b(vue|nuxt)\b/)) detected.push('Vue');

    if (lower.match(/\b(node|express|fastify)\b/)) detected.push('Node');
    else if (lower.match(/\b(python|fastapi|django|flask)\b/)) detected.push('Python');
    else if (lower.match(/\b(rust|actix|axum)\b/)) detected.push('Rust');

    if (lower.match(/\b(postgres|postgresql)\b/)) detected.push('Postgres');
    else if (lower.match(/\b(mongodb|mongo)\b/)) detected.push('MongoDB');
    else if (lower.match(/\b(mysql)\b/)) detected.push('MySQL');

    return detected.join(' + ') || 'Next.js + Node';
  }

  private inferDeployTargets(stack: string): string[] {
    const targets = [];
    const lower = stack.toLowerCase();

    if (lower.includes('next') || lower.includes('react')) {
      targets.push('vercel');
    }

    targets.push('docker');

    if (!lower.includes('rust')) {
      targets.push('fly.io');
    }

    return targets;
  }

  private extractFeatures(prompt: string): string[] {
    const features: string[] = [];
    const lower = prompt.toLowerCase();

    const featurePatterns = [
      { pattern: /\b(authentication|auth|login|signup)\b/, feature: 'Authentication' },
      { pattern: /\b(payment|stripe|checkout)\b/, feature: 'Payment Processing' },
      { pattern: /\b(dashboard|admin panel)\b/, feature: 'Dashboard' },
      { pattern: /\b(api|rest|graphql)\b/, feature: 'API' },
      { pattern: /\b(real-?time|websocket|live)\b/, feature: 'Real-time Updates' },
      { pattern: /\b(email|notification)\b/, feature: 'Notifications' },
      { pattern: /\b(file upload|storage)\b/, feature: 'File Upload' },
      { pattern: /\b(search)\b/, feature: 'Search' },
      { pattern: /\b(ai|ml|gpt|llm)\b/, feature: 'AI Integration' }
    ];

    for (const { pattern, feature } of featurePatterns) {
      if (pattern.test(lower)) {
        features.push(feature);
      }
    }

    return features.length > 0 ? features : ['Core Functionality'];
  }

  private needsDatabase(prompt: string): boolean {
    const keywords = /\b(store|save|persist|database|data|user|account)\b/i;
    return keywords.test(prompt);
  }

  private needsAuth(prompt: string): boolean {
    const keywords = /\b(login|signup|auth|user|account|profile)\b/i;
    return keywords.test(prompt);
  }

  private validateStyle(style?: string): string {
    if (style && this.validStyles.includes(style)) {
      return style;
    }
    return this.defaultStyle;
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private isCommonWord(word: string): boolean {
    const common = ['build', 'create', 'make', 'with', 'using', 'that', 'this', 'have', 'from', 'into'];
    return common.includes(word);
  }
}
