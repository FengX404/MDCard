# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Vite root is src/, not project root)
npm run build        # Production build to dist/
npm test             # Vitest (jsdom)
npx vitest tests/foo # Single test file
npm run test:e2e     # Playwright
npm run lint         # ESLint
npm run format       # Prettier
```

## Rendering pipeline

```
Markdown input → marked.parse() → paginateMarkdown() → HTML strings
→ DOM injection → applyCardVars() (CSS custom props) → dom-to-image-more → PNG
```

## Pagination (`paginator.js`)

The paginator creates an off-screen probe DOM element styled identically to output cards, then streams parsed children into pages using real `scrollHeight` measurement. Three tiers:

1. Section split on `===`, then child-by-child height check
2. Element-level binary search on character count (paragraphs), line count (pre/code), or item/row count (lists/tables)
3. Recursive overflow splitting for elements exceeding one page

Key constraints: headings (`h1`-`h6`), `hr`, and image wrappers are unspittable. Ordered list splitting preserves `start` attribute and CSS counter on the remainder.

## Level system (`config.js`)

All style values use a discrete 0–10 integer level mapped to real CSS values via `LEVELS` lookup tables. UI sliders operate on levels, not raw px. Motivation: discrete jumps produce more predictable visual results than continuous px sliders, and it guarantees values stay on a tested grid.

## Image placeholders (`image-upload.js`)

Pasted/dropped images are stored as data URLs in a `Map<id, dataURL>`. The Markdown gets `![alt](img:ID)` placeholders — the real data URL is substituted by `resolveMarkdown()` just before rendering. Keeps data URLs out of the textarea and draft storage until export time.
