import { describe, it, expect } from 'vitest';
import TEMPLATES, { DEFAULT_TEMPLATE } from '../src/app/templates.js';

describe('templates', () => {
  it('should have exactly 4 templates', () => {
    expect(TEMPLATES).toHaveLength(4);
  });

  it('should have default template as "default"', () => {
    expect(DEFAULT_TEMPLATE).toBe('default');
  });

  it('should have a default template in the list', () => {
    const defaultTpl = TEMPLATES.find((t) => t.id === 'default');
    expect(defaultTpl).toBeDefined();
  });

  describe('each template', () => {
    for (const t of TEMPLATES) {
      it(`${t.id} should have required keys`, () => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('desc');
        expect(t).toHaveProperty('cssClass');
      });

      it(`${t.id} should have non-empty id`, () => {
        expect(t.id.length).toBeGreaterThan(0);
      });

      it(`${t.id} should have non-empty name`, () => {
        expect(t.name.length).toBeGreaterThan(0);
      });

      it(`${t.id} should have non-empty desc`, () => {
        expect(t.desc.length).toBeGreaterThan(0);
      });

      it(`${t.id} cssClass should start with mc__card--`, () => {
        expect(t.cssClass).toMatch(/^mc__card--/);
      });
    }
  });

  describe('template ids', () => {
    it('should all be unique', () => {
      const ids = TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('template defaults', () => {
    it('magazine template should have defaults', () => {
      const t = TEMPLATES.find((t) => t.id === 'magazine');
      expect(t.defaults).toBeDefined();
      expect(t.defaults.pad).toBeGreaterThan(0);
    });

    it('minimal template should have defaults', () => {
      const t = TEMPLATES.find((t) => t.id === 'minimal');
      expect(t.defaults).toBeDefined();
    });

    it('card template should have defaults with border and radius', () => {
      const t = TEMPLATES.find((t) => t.id === 'card');
      expect(t.defaults).toBeDefined();
      expect(t.defaults.bw).toBeGreaterThan(0);
      expect(t.defaults.br).toBeGreaterThan(0);
    });
  });
});