# Contributing to Tourism Intel

Thank you for contributing! This document describes the simple workflow for team members.

---

## Getting Started

1. **Fork or clone** the repository (if you have direct access, clone the team repo directly).
2. **Follow the setup instructions** in [README.md](./README.md) to get the project running locally.
3. **Never commit your `.env`** file. Use `.env.example` as the template.

---

## Branching Strategy

Always branch off from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

Branch naming convention:

| Prefix | Purpose |
|---|---|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Config, build, or tooling changes |
| `docs/` | Documentation updates only |

---

## Making Changes

- Keep commits small and focused on one concern.
- Use clear commit messages:
  ```
  feat: add offline sync status indicator
  fix: resolve 180m deviation false positive on route start
  docs: update Google Maps setup instructions
  ```
- Run the backend test suite before opening a PR:
  ```bash
  python backend/test_backend.py
  ```
- Run a production build check before opening a PR:
  ```bash
  npm run build
  ```

---

## Opening a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request on GitHub: `feature/your-feature-name` → `main`
3. Fill in a clear description of what changed and why.
4. Request a review from at least one team member.
5. Address review comments before merging.

---

## What NOT to Do

- ❌ Do not commit `node_modules/`, `dist/`, `venv/`, or `*.db` files
- ❌ Do not commit `.env` or any file containing real API keys or passwords
- ❌ Do not push directly to `main` without a pull request
- ❌ Do not include hardcoded credentials anywhere in source code

---

## Code Style

- **Frontend**: JSX with functional components and hooks. Follow existing component patterns.
- **Backend**: PEP 8 Python style. Keep routes thin — business logic in services.
- **CSS**: Tailwind utility classes using the existing `ocean-*` design token system.

---

## Questions?

Reach out to the team in your shared communication channel before starting large changes. It avoids duplicate work and keeps the codebase consistent.
