# Contributing to MDCard

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check the [issue tracker](https://github.com/rouguangruye/MDCard/issues) to see if the bug has already been reported.
2. If not, [open a new issue](https://github.com/rouguangruye/MDCard/issues/new/choose) using the **Bug Report** template.
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS version
   - Screenshots if applicable

### Suggesting Features

1. Check the [issue tracker](https://github.com/rouguangruye/MDCard/issues) to see if the feature has already been suggested.
2. If not, [open a new issue](https://github.com/rouguangruye/MDCard/issues/new/choose) using the **Feature Request** template.
3. Describe the problem your feature would solve and how it would work.

### Pull Requests

1. Fork the repository and create a branch from `main`.
2. If you've added code, add tests where appropriate.
3. Ensure the test suite passes: `npm test`
4. Ensure linting passes: `npm run lint`
5. Update documentation if needed.
6. Open a pull request using the PR template.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MDCard.git
cd MDCard

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## Project Structure

```
src/
├── index.html            # Entry page
├── styles/
│   ├── main.css          # Global styles & theme variables
│   ├── tokens.css        # Design tokens
│   ├── layout.css        # Layout styles
│   └── components.css    # Component styles
└── app/
    ├── main.js            # App entry & event bindings
    ├── config.js          # Format & defaults
    ├── dom.js             # DOM element references
    ├── store.js           # Reactive state store
    ├── storage.js         # localStorage persistence
    ├── draft.js           # IndexedDB draft management
    ├── i18n.js            # Internationalization
    ├── analytics.js       # Vercel analytics
    ├── image-upload.js    # Image paste/drop handling
    ├── palettes.js        # 10 curated palette data
    ├── settings.js        # Settings read/write & CSS variable mapping
    ├── templates.js       # Layout templates
    ├── paginator.js       # Markdown pagination algorithm
    ├── renderer.js        # dom-to-image-more rendering & download
    ├── toast.js           # Toast notifications
    └── ui/
        ├── toolbar.js     # Toolbar event bindings
        ├── drawer.js      # Settings drawer
        ├── preview.js     # Live preview
        ├── sheet.js       # Mobile bottom sheet
        └── drafts-panel.js # Drafts management panel
```

## Coding Style

- JavaScript (ES Modules) for application logic
- CSS custom properties for theming
- 2-space indentation
- Prettier for formatting, ESLint for linting

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Fix bug" not "Fixes bug")
- Keep the first line under 72 characters
- Reference issues and pull requests where applicable

## Questions?

Feel free to open an issue with the question label or reach out to the maintainer.