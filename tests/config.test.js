import { describe, it, expect } from 'vitest';
import {
  FORMATS,
  LEVELS,
  levelToValue,
  valueToLevel,
  DEFAULTS,
} from '../src/app/config.js';

describe('config', () => {
  describe('FORMATS', () => {
    it('should have four aspect ratios', () => {
      expect(Object.keys(FORMATS)).toHaveLength(4);
      expect(FORMATS).toHaveProperty('portrait');
      expect(FORMATS).toHaveProperty('story');
      expect(FORMATS).toHaveProperty('square');
      expect(FORMATS).toHaveProperty('wide');
    });

    it('should have valid dimensions for portrait', () => {
      expect(FORMATS.portrait.w).toBe(1080);
      expect(FORMATS.portrait.h).toBe(1440);
      expect(FORMATS.portrait.w / FORMATS.portrait.h).toBeCloseTo(0.75, 1);
    });

    it('should have valid dimensions for square', () => {
      expect(FORMATS.square.w).toBe(1080);
      expect(FORMATS.square.h).toBe(1080);
    });

    it('should have valid dimensions for wide', () => {
      expect(FORMATS.wide.w).toBe(1920);
      expect(FORMATS.wide.h).toBe(1080);
      expect(FORMATS.wide.w / FORMATS.wide.h).toBeCloseTo(1.778, 1);
    });
  });

  describe('LEVELS', () => {
    it('should have 11 levels for each key', () => {
      for (const key of Object.keys(LEVELS)) {
        expect(LEVELS[key]).toHaveLength(11);
      }
    });

    it('should have ascending values for each key', () => {
      for (const [key, values] of Object.entries(LEVELS)) {
        for (let i = 1; i < values.length; i++) {
          expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
        }
      }
    });
  });

  describe('levelToValue', () => {
    it('should return correct value for level 0', () => {
      expect(levelToValue('h1', 0)).toBe(LEVELS.h1[0]);
      expect(levelToValue('bodyFs', 0)).toBe(LEVELS.bodyFs[0]);
    });

    it('should return correct value for level 5', () => {
      expect(levelToValue('h1', 5)).toBe(LEVELS.h1[5]);
    });

    it('should return correct value for level 10', () => {
      expect(levelToValue('h1', 10)).toBe(LEVELS.h1[10]);
    });

    it('should clamp values below 0', () => {
      expect(levelToValue('h1', -5)).toBe(LEVELS.h1[0]);
    });

    it('should clamp values above 10', () => {
      expect(levelToValue('h1', 15)).toBe(LEVELS.h1[10]);
    });

    it('should round non-integer levels', () => {
      const val = levelToValue('h1', 5.7);
      expect(val).toBe(LEVELS.h1[6]);
    });

    it('should return level unchanged for unknown key', () => {
      expect(levelToValue('unknown', 5)).toBe(5);
    });
  });

  describe('valueToLevel', () => {
    it('should return 0 for the minimum value', () => {
      expect(valueToLevel('h1', LEVELS.h1[0])).toBe(0);
    });

    it('should return 10 for the maximum value', () => {
      expect(valueToLevel('h1', LEVELS.h1[10])).toBe(10);
    });

    it('should return 5 for the default h1 value', () => {
      const idx = valueToLevel('h1', DEFAULTS.h1);
      expect(LEVELS.h1[idx]).toBe(DEFAULTS.h1);
    });

    it('should find nearest level for intermediate value', () => {
      const midValue = (LEVELS.h1[3] + LEVELS.h1[4]) / 2;
      const level = valueToLevel('h1', midValue);
      expect(level).toBeGreaterThanOrEqual(3);
      expect(level).toBeLessThanOrEqual(4);
    });
  });

  describe('DEFAULTS', () => {
    it('should have all required keys', () => {
      expect(DEFAULTS).toHaveProperty('h1');
      expect(DEFAULTS).toHaveProperty('h2');
      expect(DEFAULTS).toHaveProperty('h3');
      expect(DEFAULTS).toHaveProperty('bodyFs');
      expect(DEFAULTS).toHaveProperty('lh');
      expect(DEFAULTS).toHaveProperty('bg');
      expect(DEFAULTS).toHaveProperty('headC');
      expect(DEFAULTS).toHaveProperty('bodyC');
      expect(DEFAULTS).toHaveProperty('pad');
      expect(DEFAULTS).toHaveProperty('my');
      expect(DEFAULTS).toHaveProperty('bw');
      expect(DEFAULTS).toHaveProperty('bc');
      expect(DEFAULTS).toHaveProperty('br');
      expect(DEFAULTS).toHaveProperty('watermark');
    });

    it('should have valid default values', () => {
      expect(DEFAULTS.h1).toBe(20);
      expect(DEFAULTS.h2).toBe(18);
      expect(DEFAULTS.h3).toBe(15);
      expect(DEFAULTS.bodyFs).toBe(14);
      expect(DEFAULTS.lh).toBe(1.25);
      expect(DEFAULTS.watermark).toBe('MDCard');
    });
  });
});