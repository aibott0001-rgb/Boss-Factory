# Contributing to Boss Factory

> Welcome! This guide will help you get started contributing to Boss Factory — the Autonomous Wealth Engine.
> **Last updated:** 2026-05-14 | **Version:** v1.0.0

---

## Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠 Development Environment Setup](#-development-environment-setup)
- [💻 Running Locally](#-running-locally)
- [📐 Project Structure](#-project-structure)
- [🌿 Git Workflow](#-git-workflow)
- [✍️ Commit Conventions](#️commit-conventions)
- [🎨 Code Style & Guidelines](#-code-style--guidelines)
- [🧪 Testing](#-testing)
- [🗄 Database Changes](#-database-changes)
- [🔌 Adding a New API Route](#-adding-a-new-api-route)
- [🖥 Adding a New Page](#-adding-a-new-page)
- [📖 Documentation](#-documentation)
- [🐛 Reporting Bugs](#-reporting-bugs)
- [💡 Suggesting Features](#-suggesting-features)
- [🤝 Review Process](#-review-process)

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/boss-factory.git
cd boss-factory

# 2. Install dependencies
bun install        # or: npm install / yarn install / pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Groq credentials

# 4. Run migrations
npx supabase db push   # pushes to Supabase cloud
# OR follow "Local Supabase" section below for local DB

# 5. Start dev server
bun run dev
```

Visit `http://localhost:3000` to see the app.

---

## 🛠 Development Environment Setup

### Prerequisites

| Tool | Minimum Version | Recommended | How to Check |
|------|----------------|-------------|--------------|
| Node.js | 18.x | 20.x LTS | `node --version` |
| Bun | — | 1.0+ | `bun --version` |
| Supabase CLI | 2.0+ | Latest | `supabase --version` |
| Git | 2.30+ | Latest | `git --version` |
| PostgreSQL (for local) | 15+ | 16 | `psql --version` |

### IDE Recommendations

- **VS Code** (with these extensions):
  - ESLint (`dbaeumer.vscode-eslint`)
  - Prettier (`esbenp.prettier-vscode`)
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
  - TypeScript Hero (`renanato.typescript-hero`)
  - Error Lens (`sleistner.vscode-error-lens`)

### Environment Variables

Create `.env.local` from `.env.example`:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...         # Public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Admin service role key (keep secret!)

# Groq AI Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxx    # From console.groq.com

# Optional: GitHub + Vercel Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx    # For Octokit integration
VERCEL_TOKEN=vtk_xxxxxxxxxxxxx    # For deployment automation
ENCRYPTION_KEY=your-32-char-key!! # For encrypting secrets in DB

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_ANALYSES_PER_DAY=5
```

> ⚠️ **Never commit `.env.local`** — it's already in `.gitignore`.

---

## 💻 Running Locally

### Option A: Cloud Supabase (Recommended for most developers)

```bash
# Start Next.js dev server (auto-watches file changes)
bun run dev

# Build static export (for preview/testing production build)
bun run build
bun run start   # or: npx serve out
```

### Option B: Local Supabase Instance

```bash
# Start local Supabase stack (PostgreSQL + Auth + Storage + REST API)
supabase start

# Apply migrations locally
supabase db push

# Open Supabase Dashboard locally
supabase open

# Stop local Supabase when done
supabase stop

# Reset everything (destructive!)
supabase db reset
```

Update `.env.local` to use local URLs:

```ini
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Find the keys by running `supabase status` after starting the local instance.

---

## 📐 Project Structure

See the full structure overview in our docs index at [docs/README.md](./README.md).

```
boss-factory/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (backend)
│   │   ├── dashboard/            # Dashboard page (+ layout.tsx)
│   │   ├── login/                # Login form
│   │   ├── signup/               # Signup form
│   │   ├── globals.css           # Global styles (Tailwind import)
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── lib/
│   │   ├── utils.ts              # cn() utility (clsx + twMerge)
│   │   └── supabase/             # Supabase client modules
│   └── types/                    # Global TypeScript declarations
├── scripts/                      # Utility scripts
├── supabase/                     # Supabase configurations
│   └── migrations/               # SQL migration files
├── docs/                         # Complete documentation system (see docs/README.md)
├── middleware.ts                 # Supabase auth middleware
├── tailwind.config.ts            # Custom theme + design tokens
├── next.config.js                # Static export config + rewrites
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies + scripts
└── .env.example                  # Template environment variables
```

---

## 🌿 Git Workflow

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<name>` | `feature/dashboard-analytics` |
| Bugfix | `bugfix/<issue-number>-<description>` | `bugfix/14-login-redirect-loop` |
| Hotfix | `hotfix/<description>` | `hotfix/rate-limit-fix` |
| Docs | `docs/<description>` | `docs/api-reference` |
| Release | `release/<version>` | `release/v1.2.0` |

### Branch Strategy (GitHub Flow)

1. **Main branch** is always deployable — no release branches in production
2. Create a branch from `main` for your work
3. Make commits (following conventions below)
4. Push and open a Pull Request targeting `main`
5. CI checks must pass before merging
6. Squash merge PRs into main

### Creating a PR

1. **Title:** Follow convention: `[type]: short description`
   - Good: `feat: add venture deployment tracking webhook`
   - Bad: `update stuff`
2. **Description template:** Fill in all sections
   ```markdown
   ## What does this PR do?
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Manually tested in browser
   
   ## Screenshots (if UI changes)
   
   ## Related Issues
   Fixes #123
   ```

---

## ✍️ Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, semicolons, etc. (no logic change) |
| `refactor` | Code refactor without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Config, deps, CI/pipeline changes |
| `ci` | GitHub Actions / CI config |
| `build` | Build system changes (webpack, next config, etc.) |

### Examples

```bash
feat(api): add template matching algorithm
fix(middleware): correct JWT expiration check
docs: update API reference for sync-secrets endpoint
perf(db): optimize brain_dumps query with index
refactor(components): extract Card component from dashboard
test(api): add contract tests for venture endpoints
chore(deps): upgrade next to 15.1.0
```

---

## 🎨 Code Style & Guidelines

### ESLint & Prettier

Configuration lives in `.eslintrc.json`, `eslint.config.mjs`, and `.prettierrc`.

**Always format before committing:**
```bash
bun run lint:fix    # auto-fix ESLint issues
```

### TypeScript Rules

- ✅ Always use TypeScript — no `any` unless absolutely necessary with a comment
- ✅ Use interfaces for object shapes, type aliases for unions
- ✅ Prefer `as const` over manual typing for literal arrays/objects
- ❌ Avoid non-null assertion (`!`) — handle nullability properly
- ✅ Export types used across components/APIs from dedicated `types/` files

### Tailwind CSS Rules

- ✅ Sort classes logically (grouping by purpose)
- ✅ Use `cn()` (the inline utility) for conditional classes
- ✅ Custom theme variables live in `tailwind.config.ts` — don't hardcode colors
- ❌ Don't use arbitrary values (`w-[500px]`) unless absolutely necessary

### React Patterns

- ✅ Use functional components with hooks
- ✅ Prefer `use server` directives for server actions
- ✅ Extract reusable logic into custom hooks
- ✅ Keep components under ~150 lines; split if longer
- ✅ Use React Server Components where possible (default in Next.js App Router)

### API Route Patterns

- ✅ Validate all input data before processing
- ✅ Return consistent JSON responses: `{ success: boolean, data?: T, error?: string }`
- ✅ Handle errors gracefully with appropriate HTTP status codes
- ✅ Log errors but never expose internal details to clients
- ✅ Use `supabase.auth.getUser(req)` for user authentication

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run in watch mode
bun test --watch

# Run specific test file
bun test src/app/api/ventures.test.ts

# With coverage report
bun test --coverage
```

### Test Categories

| Category | Location | Tools | Target Coverage |
|----------|----------|-------|-----------------|
| Unit tests | Co-located with source | Vitest | 80%+ for lib/ |
| Contract tests | `tests/contract/` | Vitest + Supabase mock | All API routes |
| Integration tests | `tests/integration/` | Vitest + Supabase test client | Critical paths |
| Component tests | `tests/components/` | Vitest + RTL | Core UI components |

See each test file for setup instructions. All tests use the Supabase test client mock pattern.

---

## 🗄 Database Changes

### Making Schema Changes

1. Create a new migration file:
   ```bash
   supabase migration new add_user_preferences_table
   ```
   This creates `supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences_table.sql`

2. Write your migration SQL (see `supabase/migrations/001_initial_schema.sql` for examples).

3. Test locally:
   ```bash
   supabase db push
   ```

4. Push to production:
   ```bash
   supabase db push
   ```

### Migration Rules

- Never write a down migration that drops data
- Never alter columns in ways that could cause downtime
- Always enable RLS on new tables
- Use `gen_random_uuid()` for primary keys
- Include `created_at TIMESTAMPTZ DEFAULT now()` on every table
- Document breaking changes in the migration comment header

---

## 🔌 Adding a New API Route

1. **Create the directory and route file:**
   ```bash
   mkdir -p src/app/api/my-new-endpoint
   touch src/app/api/my-new-endpoint/route.ts
   ```

2. **Follow the standard pattern:**
   ```typescript
   import { NextRequest } from "next/server";
   import { createClient } from "@/lib/supabase/server";

   export async function POST(request: NextRequest) {
     try {
       // 1. Authenticate user
       const supabase = await createClient();
       const {
         data: { user },
       } = await supabase.auth.getUser();
       
       if (!user) {
         return Response.json({ error: "Unauthorized" }, { status: 401 });
       }

       // 2. Parse & validate request body
       const body = await request.json();
       if (!body.requiredField) {
         return Response.json(
           { error: "Missing required field: requiredField" },
           { status: 400 }
         );
       }

       // 3. Business logic
       const result = await someOperation(body);

       // 4. Return standardized response
       return Response.json({ success: true, data: result });
     } catch (error) {
       console.error("[my-new-endpoint] Error:", error);
       return Response.json(
         { error: "Internal server error", details: process.env.NODE_ENV === "development" ? String(error) : undefined },
         { status: 500 }
       );
     }
   }
   ```

3. **Add to API Reference doc** ([docs/API_REFERENCE.md](./API_REFERENCE.md))
4. **Add contract test** (`tests/contract/my-new-endpoint.test.ts`)

---

## 🖥 Adding a New Page

1. **Create the page directory:**
   ```bash
   mkdir -p src/app/my-page
   touch src/app/my-page/page.tsx
   ```

2. **Use existing patterns:**
   - Import from `@/components/*` for reusable parts
   - Use `cn()` for conditional classes
   - Follow the cyan/blue/purple neon color palette (see [06_UI_DESIGN_SYSTEM.md](./06_UI_DESIGN_SYSTEM.md))
   - Mobile-first responsive design

3. **Protect routes in [`middleware.ts`](../../middleware.ts)** if the page requires auth

4. **Add navigation link** in the sidebar/header nav component

---

## 📖 Documentation System

Boss Factory uses an indexed documentation system with numbered documents (00–17) plus unnumbered reference docs. See **[docs/README.md](./README.md)** for the full index, dependency graph, and quick-navigation map.

### Writing Effective Docs

- Use Markdown with proper headings, code blocks, and tables
- Keep sentences concise; avoid fluff
- Include examples wherever possible
- Cross-link related documents
- Update docs alongside code changes
- Mark TODO items clearly with `[TODO: ...]` tags

---

## 🐛 Reporting Bugs

Before filing an issue:

1. Search existing issues to avoid duplicates
2. Try reproducing on `main` branch
3. Check console output and network tab for errors
4. Note browser version and OS

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what happened.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What should have happened.

**Actual behavior**
What actually happened.

**Environment**
- Browser: [e.g., Chrome 125]
- OS: [e.g., macOS 14]
- Affected pages: [/dashboard, /login]

**Screenshots/Logs**
If applicable, add screenshots or relevant log output.
```

---

## 💡 Suggesting Features

Feature suggestions are welcome! Please include:

- Problem statement (what pain point does this solve?)
- Proposed solution (high-level approach)
- Alternatives considered
- Impact assessment (who benefits, how much?)

---

## 🤝 Review Process

### For Maintainers

When reviewing a PR:

1. **Functionality:** Does it work correctly?
2. **Code quality:** Is it readable, maintainable, well-tested?
3. **Security:** Are there any vulnerabilities introduced?
4. **Performance:** Any regression risks?
5. **Documentation:** Are docs updated?
6. **Testing:** Do tests pass? Are new tests adequate?

### For Contributors

Before submitting:

- [ ] Self-reviewed my own code
- [ ] Tested in browser / ran full test suite
- [ ] Updated documentation accordingly
- [ ] Added comments where logic is complex
- [ ] No debug statements or console.logs (except intentional)
- [ ] Checked for sensitive data leaks

---

Thank you for contributing to Boss Factory! 🚀
