import { describe, it, expect } from 'vitest';
import PALETTES from '../src/app/palettes.js';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function linearize(c) {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relLum(hex) {
    const s = hex.replace('#', '');
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(a, b) {
    const l1 = relLum(a);
    const l2 = relLum(b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

describe('palettes', () => {
    it('should have exactly 10 palettes', () => {
        expect(PALETTES).toHaveLength(10);
    });

    describe('each palette', () => {
        for (let i = 0; i < PALETTES.length; i++) {
            const p = PALETTES[i];

            it(`palette[${i}] should have required keys`, () => {
                expect(p).toHaveProperty('bg');
                expect(p).toHaveProperty('head');
                expect(p).toHaveProperty('body');
            });

            it(`palette[${i}] should not have deprecated name key`, () => {
                expect(p).not.toHaveProperty('name');
            });

            it(`palette[${i}] should have valid hex color for bg`, () => {
                expect(p.bg).toMatch(HEX_RE);
            });

            it(`palette[${i}] should have valid hex color for head`, () => {
                expect(p.head).toMatch(HEX_RE);
            });

            it(`palette[${i}] should have valid hex color for body`, () => {
                expect(p.body).toMatch(HEX_RE);
            });

            it(`palette[${i}] body text should pass WCAG AA contrast (≥4.5:1)`, () => {
                const cr = contrastRatio(p.bg, p.body);
                expect(cr).toBeGreaterThanOrEqual(4.5);
            });

            it(`palette[${i}] heading should pass WCAG AA contrast (≥4.5:1)`, () => {
                const cr = contrastRatio(p.bg, p.head);
                expect(cr).toBeGreaterThanOrEqual(4.5);
            });
        }
    });

    describe('dark vs light palette groups', () => {
        const luminance = (hex) => {
            const s = hex.replace('#', '');
            return (0.299 * parseInt(s.slice(0, 2), 16) + 0.587 * parseInt(s.slice(2, 4), 16) + 0.114 * parseInt(s.slice(4, 6), 16)) / 255;
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

        it('palette[0] (dark classic) should use design system gray scale', () => {
            expect(PALETTES[0].head).toBe('#F5F5F5');
            expect(PALETTES[0].body).toBe('#B0B0B0');
        });

        it('palette[5] (warm beige) should use design system warm bg', () => {
            expect(PALETTES[5].bg).toBe('#faf7f0');
            expect(PALETTES[5].head).toBe('#1A1A1A');
            expect(PALETTES[5].body).toBe('#666666');
        });
    });
});