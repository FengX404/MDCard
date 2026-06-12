# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.1.x   | :white_check_mark: |
| < 1.1.0 | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in MDCard, please **do not** open a public issue.

Instead, report it via one of these channels:

1. Email the maintainer directly
2. Use GitHub's [private vulnerability reporting](https://github.com/FengX404/MDCard/security/advisories/new) feature

Please include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## What to Expect

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 5 business days
- **Fix**: We aim to release a patch within 30 days for confirmed vulnerabilities

We appreciate responsible disclosure and will credit researchers who report valid vulnerabilities (unless they wish to remain anonymous).

## Scope

MDCard is a client-side web application. Security concerns typically involve:

- XSS (Cross-Site Scripting) via Markdown input
- DOM-based vulnerabilities
- Dependency vulnerabilities
- Data leakage in shared config URLs

## Best Practices for Users

- Keep your deployment up to date with the latest release
- Review shared config URLs before sharing them publicly
- Deploy behind a reverse proxy (nginx) as recommended in the Docker setup