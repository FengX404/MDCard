import { describe, it, expect } from 'vitest';
import PALETTES from '../src/app/palettes.js';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

describe('palettes', () => {
  it('should have exactly 10 palettes', () => {
    expect(PALETTES).toHaveLength(10);
  });

  it('should have unique names', () => {
    const names = PALETTES.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  describe('each palette', () => {
    for (const p of PALETTES) {
      it(`${p.name} should have required keys`, () => {
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('bg');
        expect(p).toHaveProperty('head');
        expect(p).toHaveProperty('body');
      });

      it(`${p.name} should have valid hex color for bg`, () => {
        expect(p.bg).toMatch(HEX_RE);
      });

      it(`${p.name} should have valid hex color for head`, () => {
        expect(p.head).toMatch(HEX_RE);
      });

      it(`${p.name} should have valid hex color for body`, () => {
        expect(p.body).toMatch(HEX_RE);
      });

      it(`${p.name} should have non-empty name`, () => {
        expect(p.name.length).toBeGreaterThan(0);
      });
    }
  });

  describe('dark vs light palette groups', () => {
    const hexToRgb = (hex) => {
      const s = hex.replace('#', '');
      return {
        r: parseInt(s.slice(0, 2), 16),
        g: parseInt(s.slice(2, 4), 16),
        b: parseInt(s.slice(4, 6), 16),
      };
    };

    const luminance = (hex) => {
      const { r, g, b } = hexToRgb(hex);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    it('first 5 palettes should have dark backgrounds', () => {
      for (let i = 0; i < 5; i++) {
        expect(luminance(PALETTES[i].bg)).toBeLessThan(0.5);
      }
    });

    it('last 5 palettes should have light backgrounds', () => {
      for (let i = 5; i < 10; i++) {
        expect(luminance(PALETTES[i].bg)).toBeGreaterThan(0.5);
      }
    });
  });
});