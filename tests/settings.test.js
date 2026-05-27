import { describe, it, expect } from 'vitest';
import { createDefaults, cloneSettings, applyCardVars, availableHeight } from '../src/app/settings.js';
import { DEFAULTS, FORMATS } from '../src/app/config.js';

describe('settings', () => {
  describe('createDefaults', () => {
    it('should return an object with the same keys as DEFAULTS', () => {
      const result = createDefaults();
      for (const key of Object.keys(DEFAULTS)) {
        expect(result).toHaveProperty(key);
      }
    });

    it('should return values equal to DEFAULTS', () => {
      const result = createDefaults();
      for (const [key, val] of Object.entries(DEFAULTS)) {
        expect(result[key]).toBe(val);
      }
    });

    it('should return a new object (not the same reference)', () => {
      const result = createDefaults();
      expect(result).not.toBe(DEFAULTS);
    });

    it('should not be affected by mutation', () => {
      const result = createDefaults();
      result.h1 = 999;
      expect(DEFAULTS.h1).not.toBe(999);
    });
  });

  describe('cloneSettings', () => {
    it('should return a shallow copy', () => {
      const original = { a: 1, b: 'test', c: true };
      const cloned = cloneSettings(original);
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should not affect original when cloned is mutated', () => {
      const original = { x: 10, y: 20 };
      const cloned = cloneSettings(original);
      cloned.x = 999;
      expect(original.x).toBe(10);
    });

    it('should handle empty object', () => {
      expect(cloneSettings({})).toEqual({});
    });
  });

  describe('applyCardVars', () => {
    it('should set CSS custom properties on element', () => {
      const el = document.createElement('div');
      const settings = { ...DEFAULTS };
      applyCardVars(el, settings);

      expect(el.style.getPropertyValue('--c-bg')).toBe(settings.bg);
      expect(el.style.getPropertyValue('--c-head')).toBe(settings.headC);
      expect(el.style.getPropertyValue('--c-body')).toBe(settings.bodyC);
      expect(el.style.getPropertyValue('--c-h1')).toBe(settings.h1 + 'px');
      expect(el.style.getPropertyValue('--c-h2')).toBe(settings.h2 + 'px');
      expect(el.style.getPropertyValue('--c-h3')).toBe(settings.h3 + 'px');
      expect(el.style.getPropertyValue('--c-body-fs')).toBe(settings.bodyFs + 'px');
      expect(el.style.getPropertyValue('--c-lh')).toBe(String(settings.lh));
      expect(el.style.getPropertyValue('--c-pad')).toBe(settings.pad + 'px');
      expect(el.style.getPropertyValue('--c-my')).toBe(settings.my + 'px');
      expect(el.style.getPropertyValue('--c-bw')).toBe(settings.bw + 'px');
      expect(el.style.getPropertyValue('--c-bc')).toBe(settings.bc);
      expect(el.style.getPropertyValue('--c-br')).toBe(settings.br + 'px');
    });

    it('should set watermark color dark for light backgrounds', () => {
      const el = document.createElement('div');
      const settings = { ...DEFAULTS, bg: '#ffffff' };
      applyCardVars(el, settings);
      const wmColor = el.style.getPropertyValue('--mc-watermark-c');
      expect(wmColor).toContain('rgba(0,0,0');
    });

    it('should set watermark color light for dark backgrounds', () => {
      const el = document.createElement('div');
      const settings = { ...DEFAULTS, bg: '#000000' };
      applyCardVars(el, settings);
      const wmColor = el.style.getPropertyValue('--mc-watermark-c');
      expect(wmColor).toContain('rgba(255,255,255');
    });

    it('should set watermark color dark for mid-brightness backgrounds', () => {
      const el = document.createElement('div');
      const settings = { ...DEFAULTS, bg: '#888888' };
      applyCardVars(el, settings);
      const wmColor = el.style.getPropertyValue('--mc-watermark-c');
      expect(wmColor).toContain('rgba(0,0,0');
    });
  });

  describe('availableHeight', () => {
    it('should return a positive number for portrait format', () => {
      const h = availableHeight('portrait', DEFAULTS);
      expect(h).toBeGreaterThan(0);
    });

    it('should return a value less than ph for portrait', () => {
      const h = availableHeight('portrait', DEFAULTS);
      expect(h).toBeLessThan(FORMATS.portrait.ph);
    });

    it('should decrease when padding increases', () => {
      const h1 = availableHeight('portrait', { ...DEFAULTS, pad: 10 });
      const h2 = availableHeight('portrait', { ...DEFAULTS, pad: 50 });
      expect(h1).toBeGreaterThan(h2);
    });

    it('should decrease when border width increases', () => {
      const h1 = availableHeight('portrait', { ...DEFAULTS, bw: 0 });
      const h2 = availableHeight('portrait', { ...DEFAULTS, bw: 10 });
      expect(h1).toBeGreaterThan(h2);
    });

    it('should decrease when margin (my) increases', () => {
      const h1 = availableHeight('portrait', { ...DEFAULTS, my: 2 });
      const h2 = availableHeight('portrait', { ...DEFAULTS, my: 20 });
      expect(h1).toBeGreaterThan(h2);
    });

    it('should work for all formats', () => {
      for (const fmt of Object.keys(FORMATS)) {
        const h = availableHeight(fmt, DEFAULTS);
        expect(h).toBeGreaterThan(0);
      }
    });
  });
});