import { describe, it, expect } from 'vitest';
import LAYOUTS, { DEFAULT_LAYOUT } from '../src/app/templates.js';

describe('layouts', () => {
  it('should have exactly 6 layouts', () => {
    expect(LAYOUTS).toHaveLength(6);
  });

  it('should have default layout as "editorial-default"', () => {
    expect(DEFAULT_LAYOUT).toBe('editorial-default');
  });

  it('should have a default layout in the list', () => {
    const defaultLayout = LAYOUTS.find((l) => l.id === 'editorial-default');
    expect(defaultLayout).toBeDefined();
  });

  it('should have 3 editorial and 3 swiss layouts', () => {
    const editorial = LAYOUTS.filter((l) => l.family === 'editorial');
    const swiss = LAYOUTS.filter((l) => l.family === 'swiss');
    expect(editorial).toHaveLength(3);
    expect(swiss).toHaveLength(3);
  });

  describe('each layout', () => {
    for (const l of LAYOUTS) {
      it(`${l.id} should have required keys`, () => {
        expect(l).toHaveProperty('id');
        expect(l).toHaveProperty('name');
        expect(l).toHaveProperty('desc');
        expect(l).toHaveProperty('cssClass');
        expect(l).toHaveProperty('family');
        expect(l).toHaveProperty('typography');
        expect(l).toHaveProperty('visual');
        expect(l).toHaveProperty('defaults');
      });

      it(`${l.id} should have non-empty id`, () => {
        expect(l.id.length).toBeGreaterThan(0);
      });

      it(`${l.id} should have non-empty name`, () => {
        expect(l.name.length).toBeGreaterThan(0);
      });

      it(`${l.id} should have non-empty desc`, () => {
        expect(l.desc.length).toBeGreaterThan(0);
      });

      it(`${l.id} should have valid family`, () => {
        expect(['editorial', 'swiss']).toContain(l.family);
      });

      it(`${l.id} cssClass should start with mc--`, () => {
        expect(l.cssClass).toMatch(/^mc--/);
      });

      it(`${l.id} should have typography settings`, () => {
        expect(l.typography).toHaveProperty('headingFont');
        expect(l.typography).toHaveProperty('bodyFont');
        expect(l.typography).toHaveProperty('h1Weight');
        expect(l.typography).toHaveProperty('h2Weight');
        expect(l.typography).toHaveProperty('h3Weight');
      });

      it(`${l.id} should have visual settings`, () => {
        expect(l.visual).toHaveProperty('bgTreatment');
        expect(l.visual).toHaveProperty('cornerStyle');
        expect(l.visual).toHaveProperty('shadow');
        expect(l.visual).toHaveProperty('ruleStyle');
      });

      it(`${l.id} should have defaults with pad`, () => {
        expect(l.defaults).toBeDefined();
        expect(l.defaults.pad).toBeGreaterThan(0);
      });
    }
  });

  describe('layout ids', () => {
    it('should all be unique', () => {
      const ids = LAYOUTS.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('layout defaults', () => {
    it('editorial-magazine should have larger padding', () => {
      const l = LAYOUTS.find((l) => l.id === 'editorial-magazine');
      expect(l.defaults.pad).toBeGreaterThan(30);
    });

    it('swiss-minimal should have defaults', () => {
      const l = LAYOUTS.find((l) => l.id === 'swiss-minimal');
      expect(l.defaults).toBeDefined();
    });

    it('swiss-card should have border ring and radius', () => {
      const l = LAYOUTS.find((l) => l.id === 'swiss-card');
      expect(l.cssClass).toBe('mc--swiss-card');
      expect(l.defaults.br).toBeGreaterThan(0);
    });
  });
});