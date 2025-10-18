import { describe, it, expect } from 'vitest';
import { PromptParser } from '../kodarch/modules/prompt_parser';

describe('PromptParser', () => {
  it('should parse a simple prompt', () => {
    const parser = new PromptParser();
    const prompt = 'Create a new project called "my-app"';
    const devPlan = parser.parse(prompt);

    expect(devPlan.project).toBe('my-app');
    expect(devPlan.style).toBe('hyperforge');
  });
});