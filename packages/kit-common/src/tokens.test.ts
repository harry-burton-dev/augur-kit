import { describe, expect, it } from 'vitest';
import { token, tokens } from './generated/tokens.js';

describe('tokens', () => {
  it('carries the fixed accents from the token files', () => {
    expect(tokens.green).toBe('#34D399');
    expect(tokens.navy).toBe('#1E40AF');
  });

  it('includes type roles and spacing', () => {
    expect(tokens['type-body']).toBe('1rem');
    expect(tokens['space-5']).toBe('28px');
  });

  it('has the door gallery\'s light, strongest for needs you', () => {
    const n = (name: keyof typeof tokens) => Number.parseFloat(tokens[name]);
    expect(n('door-light-present')).toBeLessThan(n('door-light-strong'));
    expect(n('door-light-strong')).toBeLessThan(n('door-light-needs'));
    expect(n('door-light-reach-present')).toBeLessThan(n('door-light-reach'));
    expect(n('door-bloom')).toBeLessThan(n('door-bloom-focus'));
  });

  it('builds var() references', () => {
    expect(token('ink')).toBe('var(--ink)');
  });
});
