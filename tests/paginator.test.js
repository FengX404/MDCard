import { describe, it, expect } from 'vitest';
import { DEFAULTS } from '../src/app/config.js';

function createMockSettings(overrides = {}) {
  return { ...DEFAULTS, ...overrides };
}

describe('paginator', () => {
  describe('paginateMarkdown - empty / whitespace', () => {
    it('should return empty array for empty string', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('', 'portrait', createMockSettings());
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('   \n  \t\n  ', 'portrait', createMockSettings());
      expect(result).toEqual([]);
    });
  });

  describe('paginateMarkdown - single page content', () => {
    it('should return one page for a short heading', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('# Hello', 'portrait', createMockSettings());
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Hello');
    });

    it('should return one page for short paragraph', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('A short paragraph.', 'portrait', createMockSettings());
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('short paragraph');
    });
  });

  describe('paginateMarkdown - `===` section separator', () => {
    it('should split into two pages with === separator', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const content = '# Page 1\n\nSome content\n\n===\n\n# Page 2\n\nMore content';
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle trailing ===', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('# Test\n\n===\n\n', 'portrait', createMockSettings());
      expect(result.length).toBe(1);
    });
  });

  describe('paginateMarkdown - long content', () => {
    it('should handle large input without crashing', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const paragraphs = Array.from({ length: 200 }, (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation.`);
      const content = '# Long Article\n\n' + paragraphs.join('\n\n');
      expect(() => {
        const result = paginateMarkdown(content, 'portrait', createMockSettings());
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(typeof result[0]).toBe('string');
      }).not.toThrow();
    });
  });

  describe('paginateMarkdown - unsplittable elements', () => {
    it('should not split headings (H1-H6)', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('# Not Splittable Heading', 'portrait', createMockSettings());
      expect(result.length).toBe(1);
    });

    it('should not split HR elements', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const result = paginateMarkdown('Text above\n\n---\n\nText below', 'portrait', createMockSettings());
      expect(result.length).toBe(1);
    });
  });

  describe('paginateMarkdown - list pagination', () => {
    it('should handle a long ordered list', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const items = Array.from({ length: 60 }, (_, i) => `${i + 1}. Item ${i + 1} with some descriptive text to make it longer`);
      const content = '# Checklist\n\n' + items.join('\n');
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(1);
      const allHTML = result.join('');
      expect(allHTML).toContain('Item 1');
      expect(allHTML).toContain('Item 60');
    });

    it('should handle a long unordered list', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const items = Array.from({ length: 60 }, (_, i) => `- Bullet ${i + 1} with some descriptive text to make it longer`);
      const content = '# Bullets\n\n' + items.join('\n');
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('paginateMarkdown - table pagination', () => {
    it('should handle a table that may need pagination', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const header = '| Col A | Col B | Col C |\n|-------|-------|-------|\n';
      const rows = Array.from({ length: 40 }, (_, i) => `| Row ${i + 1} | Value ${i + 1} | Data ${i + 1} |`).join('\n');
      const content = '# Table Test\n\n' + header + rows;
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('paginateMarkdown - code block pagination', () => {
    it('should handle a long code block', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const lines = Array.from({ length: 100 }, (_, i) => `line_${i + 1} = "some code here for testing"`);
      const content = '# Code\n\n```\n' + lines.join('\n') + '\n```';
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('paginateMarkdown - blockquote pagination', () => {
    it('should handle a long blockquote with multiple paragraphs', async () => {
      const { paginateMarkdown } = await import('../src/app/paginator.js');
      const quotes = Array.from({ length: 30 }, (_, i) => `> Quote paragraph ${i + 1}: some text here to fill the blockquote block.`);
      const content = '# Quotes\n\n' + quotes.join('\n>\n');
      const result = paginateMarkdown(content, 'portrait', createMockSettings());
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('paginateMarkdown - all formats', () => {
    const formats = ['portrait', 'story', 'square', 'wide'];

    for (const fmt of formats) {
      it(`should produce valid output for ${fmt} format`, async () => {
        const { paginateMarkdown } = await import('../src/app/paginator.js');
        const result = paginateMarkdown('# Test\n\nHello world', fmt, createMockSettings());
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(typeof result[0]).toBe('string');
        expect(result[0].length).toBeGreaterThan(0);
      });
    }
  });
});
