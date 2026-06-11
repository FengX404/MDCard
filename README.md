# 🃏 MDCard

Turn Markdown into beautiful shareable card images.

Write Markdown, pick a theme, export as images — ideal for tech articles, reading notes, opinion cards, and social media long-form graphics.

MDCard features a Glassmorphism design language with dark / light / system appearance modes, 10 curated color palettes, four aspect ratios, and fully customizable typography.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/rouguangruye/MDCard/actions/workflows/ci.yml/badge.svg)](https://github.com/rouguangruye/MDCard/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rouguangruye/MDCard/actions/workflows/codeql.yml/badge.svg)](https://github.com/rouguangruye/MDCard/actions/workflows/codeql.yml)

**[Live Demo](https://mdcard.rouguang.top/)** · **[Changelog](https://github.com/rouguangruye/MDCard/releases)**

Read this in: [简体中文](./README.zh-CN.md)

## Features

- **Smart Markdown Pagination** — Auto-paginate at line boundaries, never truncate mid-line. Use `---` for manual page breaks
- **10 Curated Palettes** — One-click theme switching across dark and light styles, all WCAG AA compliant
- **Four Aspect Ratios** — 3:4 portrait / 9:16 story / 1:1 square / 16:9 wide
- **Dark / Light / System** — Three appearance modes, toggle from the toolbar
- **Glassmorphism UI** — Modern frosted-glass design language
- **Custom Typography** — Heading sizes, body font size, line height, spacing, and borders — all adjustable
- **Watermark** — Custom watermark text; leave blank to disable
- **Shareable Config** — One-click config link generation; anyone can reproduce your exact style
- **ZIP Batch Export** — Auto-package 3+ pages into a ZIP download

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Output goes to the `dist/` directory.

## Docker Deployment

### Option 1: docker-compose (Recommended)

```bash
docker-compose up -d
```

Visit http://localhost:8080

### Option 2: Manual Build

```bash
docker build -t mdcard:latest .
docker run -d -p 8080:80 --name mdcard mdcard:latest
```

### Option 3: Pre-built Image

```bash
docker run -d -p 8080:80 --name mdcard ghcr.io/rouguangruye/mdcard:latest
```

> If you fork the project and build your own image, replace `rouguangruye` with your GitHub username.

## Usage

1. Type Markdown in the left editor
2. Click the **Style** button to open the settings panel
3. Pick a theme or customize colors, typography, and spacing
4. Click **PNG** or **JPG** to export

### Pagination

- Content exceeding a single page height is automatically paginated at line boundaries
- Use `---` (three dashes) on its own line to force a page break

### Export

- 1–2 cards: downloaded individually
- 3+ cards: auto-packaged as a ZIP file

### Appearance

Three buttons in the toolbar:

| Button | Mode |
|--------|------|
| 🌙 | Dark |
| ☀️ | Light |
| 🖥 | System |

Your preference persists in localStorage.

### Shareable Config

Click the **Share Config** button in the settings panel. Your current style configuration is encoded into the URL hash — anyone opening the link sees exactly the same settings.

## Tech Stack

- [Vite](https://vitejs.dev/) — Build tool
- [marked](https://marked.js.org/) — Markdown parser
- [dom-to-image-more](https://github.com/1904labs/dom-to-image-more) — DOM to image
- [JSZip](https://stuk.github.io/jszip/) — ZIP packaging

## Project Structure

```
src/
├── index.html            # Entry page
├── styles/
│   └── main.css          # Global styles & theme variables
└── app/
    ├── main.js            # App entry & event bindings
    ├── config.js          # Format & defaults
    ├── palettes.js        # 10 curated palette data
    ├── settings.js        # Settings read/write & CSS variable mapping
    ├── paginator.js       # Markdown pagination algorithm
    ├── renderer.js        # dom-to-image-more rendering & download
    └── toast.js           # Toast notifications
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### CI Pipeline

| Stage | Description |
|-------|-------------|
| `audit` | Dependency vulnerability scanning |
| `lint` | ESLint + Prettier format check |
| `test` | Unit tests (vitest + jsdom) |
| `build` | Production bundle |
| `e2e` | Browser E2E tests (Playwright) |

On every pull request and push to `main`, all stages run automatically. Docker images are built and pushed to GHCR on tag pushes.

## 关注作者

| 博客 | 小红书 | X | 公众号 |
|:---:|:---:|:---:|:---:|
| [![博客](./assets/blog-qr.png)](https://fengx404.com/blog/) | [![小红书](./assets/xiaohongshu-qr.png)](https://www.xiaohongshu.com/user/profile/5fa9ed6d000000000100a8be) | [![X](./assets/x-qr.png)](https://x.com/FengX404) | ![公众号](./assets/wechat-qr.jpg) |
| [fengx404.com/blog](https://fengx404.com/blog/) | [FengX](https://www.xiaohongshu.com/user/profile/5fa9ed6d000000000100a8be) | [@FengX404](https://x.com/FengX404) | FengX |

## License

[MIT](LICENSE)
