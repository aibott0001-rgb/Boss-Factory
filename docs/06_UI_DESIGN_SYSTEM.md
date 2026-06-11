# Boss Factory UI Design System

> Comprehensive design token reference, component API, and usage guidelines.
> **Last updated:** 2026-05-14 | **Version:** v1.0.0

---

## Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Sizing](#spacing--sizing)
- [Shadows & Elevation](#shadows--elevation)
- [Border Radius](#border-radius)
- [Z-Index Scale](#z-index-scale)
- [Breakpoints](#breakpoints)
- [Animations & Transitions](#animations--transitions)
- [Component API Reference](#component-api-reference)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Dark/Light Mode Behavior](#darklight-mode-behavior)
- [Design Token Mapping](#design-token-mapping)

---

## Color Palette

Boss Factory uses a neon cyan/blue/purple palette against a near-black background. All colors are defined as CSS custom properties via Tailwind config and mapped to semantic tokens.

### Primary Colors

| Token Name | Hex Code | HSL | Usage |
|-----------|----------|-----|-------|
| `--colors-cyan` | `#00FFFF` | `hsl(180, 100%, 50%)` | Primary accent, headings, links |
| `--colors-blue` | `#0EA5E9` | `hsl(204, 89%, 47%)` | Secondary accent, buttons |
| `--colors-purple` | `#A855F7` | `hsl(268, 92%, 66%)` | Tertiary accent, badges |
| `--colors-neon-green` | `#39FF14` | `hsl(96, 100%, 50%)` | Success states, live indicators |
| `--colors-warning-orange` | `#FF6B00` | `hsl(27, 100%, 50%)` | Warning states |
| `--colors-danger-red` | `#EF4444` | `hsl(0, 84%, 60%)` | Error states, destructive actions |

### Neutral/Background Colors

| Token Name | Hex Code | HSL | Usage |
|-----------|----------|-----|-------|
| `--colors-bg-primary` | `#0a0a1a` | `hsl(240, 10%, 7%)` | Main page background |
| `--colors-bg-secondary` | `#111128` | `hsl(240, 10%, 10%)` | Card backgrounds, panels |
| `--colors-bg-tertiary` | `#1a1a3a` | `hsl(240, 10%, 14%)` | Input fields, modals |
| `--colors-border-subtle` | `rgba(255,255,255,0.08)` | — | Subtle borders, dividers |
| `--colors-border-accent` | `rgba(0,255,255,0.25)` | — | Focused input borders, active cards |
| `--colors-text-primary` | `#ffffff` | `hsl(0, 0%, 100%)` | Primary text, headings |
| `--colors-text-secondary` | `rgba(255,255,255,0.7)` | `hsla(0, 0%, 100%, 0.7)` | Body text, labels |
| `--colors-text-muted` | `rgba(255,255,255,0.4)` | `hsla(0, 0%, 100%, 0.4)` | Disabled text, hints |

### Gradient Definitions

```css
/* Primary brand gradient */
bg-gradient-to-br from-[#00FFFF] via-[#0EA5E9] to-[#A855F7]

/* Subtle card gradient */
bg-gradient-to-r from-white/5 to-white/[0.02]

/* Neon glow effect */
from-transparent via-[#00FFFF]/20 to-transparent
```

### Semantic Color Mapping to Tailwind Classes

| Semantic Meaning | Tailwind Class(es) | Example |
|-----------------|-------------------|---------|
| Primary text | `text-[var(--colors-text-primary)]` | Headings |
| Body text | `text-[var(--colors-text-secondary)]` | Paragraphs |
| Muted/hint | `text-[var(--colors-text-muted)]` | Placeholders |
| Primary link | `text-[var(--colors-cyan)] hover:text-[var(--colors-blue)]` | Hyperlinks |
| Accent heading | `text-[var(--colors-cyan)]` | Section titles |
| Success badge | `bg-[var(--colors-neon-green)]/10 text-[var(--colors-neon-green)] border border-[var(--colors-neon-green)]/20` | Status tags |
| Warning badge | `bg-[var(--colors-warning-orange)]/10 text-[var(--colors-warning-orange)] border border-[var(--colors-warning-orange)]/20` | Alert tags |
| Danger badge | `bg-[var(--colors-danger-red)]/10 text-[var(--colors-danger-red)] border border-[var(--colors-danger-red)]/20` | Error tags |
| Primary button | `bg-gradient-to-br from-[var(--colors-cyan)] to-[var(--colors-blue)]` | CTA buttons |
| Outline button | `border border-[var(--colors-border-accent)] text-[var(--colors-cyan)]` | Secondary actions |
| Background card | `bg-[var(--colors-bg-secondary)]` | Panel/card bg |
| Border subtle | `border border-[var(--colors-border-subtle)]` | Dividers |
| Glass effect | `backdrop-blur-xl bg-white/5 border border-white/10` | Glassmorphism panels |
| Neon glow box | `shadow-[0_0_30px_rgba(0,255,255,0.3)]` | Featured elements |

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

All typography uses Inter as the primary font, loaded via Next.js `next/font/google`.

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | `text-7xl` → `text-8xl` (6rem→7.5rem) | Bold (700) | Tight (-0.02em) | `-0.02em` | Hero section headline |
| H1 | `text-4xl` (2.25rem) | Bold (700) | Tight (-0.02em) | None | Page titles |
| H2 | `text-3xl` (1.875rem) | Bold (700) | Tight (-0.01em) | None | Section headers |
| H3 | `text-2xl` (1.5rem) | SemiBold (600) | Normal (1.5) | None | Card titles, sub-sections |
| H4 | `text-xl` (1.25rem) | SemiBold (600) | Normal (1.5) | None | Component titles |
| Body Large | `text-lg` (1.125rem) | Regular (400) | Relaxed (1.625) | None | Lead paragraphs |
| Body | `text-base` (1rem) | Regular (400) | Standard (1.5) | None | Default body text |
| Body Small | `text-sm` (0.875rem) | Regular (400) | Standard (1.428) | None | Captions, metadata |
| Overline/Label | `text-xs` (0.75rem) | Medium (500) | Standard (1.333) | `0.05em` uppercase | Badges, form labels |
| Monospace | `font-mono text-sm` | Regular (400) | Standard (1.428) | `0.05em` | Code blocks, hashes |

### Text Gradient Application

```jsx
// Hero title with gradient text
<h1 className="bg-gradient-to-br from-[var(--colors-cyan)] to-[var(--colors-purple)] bg-clip-text text-transparent">
  Autonomous Wealth Engine
</h1>
```

---

## Spacing & Sizing

### Spacing Scale

| Token | Value | px | Usage |
|-------|-------|----|-------|
| `space-1` | `0.25rem` | 4px | Tight gaps, inline spacing |
| `space-2` | `0.5rem` | 8px | Icon padding, small gaps |
| `space-3` | `0.75rem` | 12px | Form field padding |
| `space-4` | `1rem` | 16px | Standard gap |
| `space-5` | `1.25rem` | 20px | Component internal spacing |
| `space-6` | `1.5rem` | 24px | Section padding |
| `space-8` | `2rem` | 32px | Section margins |
| `space-10` | `2.5rem` | 40px | Large spacing |
| `space-12` | `3rem` | 48px | Page-level margins |
| `space-16` | `4rem` | 64px | Container padding |
| `space-20` | `5rem` | 80px | Hero section padding |
| `space-24` | `6rem` | 96px | Full-width section breaks |

### Standard Padding Values

| Context | Padding |
|---------|---------|
| Page container | `px-4 sm:px-6 lg:px-8 py-8` |
| Card internal | `p-6` (24px all sides) |
| Feature card | `p-6` + `rounded-2xl` |
| Button internal | `px-6 py-3` |
| Form input | `px-4 py-2.5` |
| Modal/dialog | `p-8` |
| Sidebar nav item | `px-4 py-2.5` |

### Max Content Widths

| Breakpoint | Max Width |
|-----------|-----------|
| Mobile (< 640px) | Full width (minus px-4) |
| Tablet (≥ 640px) | `max-w-5xl` (64rem / 1024px) |
| Desktop (≥ 1024px) | `max-w-7xl` (80rem / 1280px) |

---

## Shadows & Elevation

| Token | Shadow Definition | Usage |
|-------|-------------------|-------|
| `shadow-card` | `box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4)` | Base card elevation |
| `shadow-glow-cyan` | `box-shadow: 0 0 30px rgba(0, 255, 255, 0.3)` | Glowing accents |
| `shadow-glow-purple` | `box-shadow: 0 0 30px rgba(168, 85, 247, 0.3)` | Purple glow effects |
| `shadow-hover` | `box-shadow: 0 10px 60px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 255, 255, 0.2)` | Card hover state |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `rounded` (0.25rem / 4px) | Small badges, inputs |
| `radius-md` | `rounded-lg` (0.5rem / 8px) | Buttons, modals |
| `radius-lg` | `rounded-xl` (0.75rem / 12px) | Cards, sections |
| `radius-xl` | `rounded-2xl` (1rem / 16px) | Feature cards, containers |
| `radius-full` | `rounded-full` (9999px) | Avatar pills, status dots |

---

## Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Base | `0` | Document content |
| Floating | `10` | Tooltips, popovers |
| Nav | `50` | Sidebar navigation |
| Header | `100` | Top header bar |
| Modal backdrop | `200` | Modal overlay |
| Modal panel | `250` | Modal content |
| Toast/Notification | `300` | Alert toasts |
| Loading spinner | `999` | Global loading indicator |
| Skeleton screens | `5` | Content placeholders |

---

## Breakpoints

Based on Tailwind's default breakpoints:

| Name | Min Width | Device Target | Typical Layout Change |
|------|-----------|---------------|----------------------|
| `sm` | 640px | Large phones | Single → Multi-column |
| `md` | 768px | Tablets | Collapsed sidebar appears |
| `lg` | 1024px | Laptops | Full sidebar + main content |
| `xl` | 1280px | Desktops | Wider max-content containers |
| `2xl` | 1536px | Large screens | Maximum content width reached |

### Responsive Utility Patterns Used

```jsx
// Common responsive pattern across all components
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Sidebar collapses on mobile
className="hidden lg:block w-64 min-h-screen p-6"

// Typography scales down on mobile
className="text-7xl md:text-8xl xl:text-9xl"
```

---

## Animations & Transitions

### Transition Tokens

| Property | Duration | Easing |
|----------|----------|--------|
| Fast (hover state) | `150ms` | `ease-out` |
| Standard (interaction) | `300ms` | `ease-in-out` |
| Slow (page load) | `500ms` | `ease-out` |

### Custom Animations (Tailwind Config)

```json
{
  "keyframes": {
    "float": {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-20px)" }
    },
    "pulse-slow": {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.6" }
    },
    "gradient-shift": {
      "0%, 100%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" }
    }
  },
  "animation": {
    "float": "float 6s ease-in-out infinite",
    "float-delayed": "float 6s ease-in-out 3s infinite",
    "pulse-slow": "pulse-slow 4s ease-in-out infinite",
    "gradient-shift": "gradient-shift 6s ease infinite"
  }
}
```

### Animation Classes Reference

| Class | Animation | Duration | Use Case |
|-------|-----------|----------|----------|
| `animate-float` | translateY oscillation | 6s infinite | Background decorative orbs |
| `animate-float-delayed` | Same as float, offset by 3s | 6s infinite | Secondary floating element |
| `animate-pulse-slow` | Opacity pulse | 4s infinite | Live indicators, heartbeat |
| `animate-gradient-shift` | Background position shift | 6s infinite | Gradient text/backgrounds |
| *(none)* | Hover scale+glow | 300ms | Card hover transitions |

### Hover Effects Pattern

```jsx
// Standard card hover
className="card hover:scale-[1.02] hover:shadow-glow hover:border-[var(--colors-border-accent)] transition-all duration-300"

// Standard button hover
className="button hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] hover:brightness-110 transition-all duration-300"
```

---

## Component API Reference

### Card Component

**Props Interface:**

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: "default" | "neon" | "glass"; // default = bordered, neon = glowing, glass = transparent
  hoverable?: boolean; // applies hover scale + shadow
  className?: string;
  onClick?: () => void;
  icon?: ReactNode; // Left-aligned icon before title
}
```

**Variants:**

| Variant | Background | Border | Shadow | Best For |
|---------|-----------|--------|--------|----------|
| `default` | `bg-[var(--colors-bg-secondary)]` | `border [var(--colors-border-subtle)]` | `shadow-card` | Standard info cards |
| `neon` | `bg-[var(--colors-bg-secondary)]` | `border [var(--colors-border-accent)]` | `shadow-glow-cyan` | Featured/highlight items |
| `glass` | `bg-white/5 backdrop-blur-xl` | `border white/10` | none | Overlay panels, modals |

### Button Component

**Props Interface:**

```typescript
type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean; // shows spinner instead of text
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  href?: string; // if provided, renders as <Link>
  icon?: ReactNode; // Left-aligned before text
}
```

**Size Variants:**

| Size | Padding | Font Size |
|------|---------|-----------|
| `sm` | `px-3 py-1.5` | `text-sm` |
| `md` | `px-6 py-3` | `text-base` |
| `lg` | `px-8 py-4` | `text-lg` |

**Visual Variants:**

| Variant | BG | Text | Border | Glow |
|---------|----|----|--------|------|
| `primary` | Gradient (cyan→blue) | White | none | On hover: cyan glow |
| `outline` | Transparent | Cyan | `border [var(--colors-border-accent)]` | Subtle on hover |
| `ghost` | Transparent | White/70 | none | None |
| `danger` | Red/10 | Red | `border red/20` | None |

### Badge/Tag Component

**Props Interface:**

```typescript
type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}
```

**Variant Styles:**

| Variant | BG | Text | Border |
|---------|----|------|--------|
| `success` | `green/10` | `green` | `green/20` |
| `warning` | `orange/10` | `orange` | `orange/20` |
| `danger` | `red/10` | `red` | `red/20` |
| `info` | `cyan/10` | `cyan` | `cyan/20` |
| `neutral` | `white/5` | `white/70` | `white/10` |

### Input Component

**Props Interface:**

```typescript
interface InputProps extends Omit<HTMLInputElement, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "default" | "floating";
}
```

**States:**

| State | Border | Shadow | Text Color |
|-------|--------|--------|------------|
| Default | `white/10` | none | `white` |
| Focus | `cyan/50` | `0 0 0 2px rgba(0,255,255,0.2)` | `white` |
| Error | `red/50` | `0 0 0 2px rgba(239,68,68,0.2)` | `white` |
| Disabled | `white/5` | none | `white/40` |

### Sidebar Navigation

**Structure:**

```tsx
<Sidebar>
  <SidebarBrand />         {/* Logo + "BOSS FACTORY" text */}
  <SidebarNav items={...} /> {/* Nav items with icons */}
  <SidebarFooter />        {/* User profile or logout */}
</Sidebar>
```

**NavItem Props:**

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon; // Lucide-react icon component
  badge?: number | string; // Optional count/badge
  dividerAfter?: boolean;
  children?: NavItem[]; // Nested submenu
}
```

### Stats Counter Component

**Props Interface:**

```typescript
interface StatsCounterProps {
  value: number | string;
  label: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
}
```

### Skeleton Loader Component

**Props Interface:**

```typescript
interface SkeletonProps {
  className?: string;
  lines?: number; // For multi-line skeleton
  variant?: "rect" | "circle" | "text";
}
```

---

## Accessibility Guidelines

### Contrast Ratios (WCAG 2.1 AA Compliance)

| Combination | Ratio | Passes? | Notes |
|-------------|-------|---------|-------|
| `#ffffff` on `#0a0a1a` | 18.1:1 | ✅ AAA | Pure white on dark bg |
| `rgba(255,255,255,0.7)` on `#0a0a1a` | 9.2:1 | ✅ AAA | Secondary text |
| `#00FFFF` on `#0a0a1a` | 12.6:1 | ✅ AAA | Cyan accent |
| `#A855F7` on `#0a0a1a` | 6.2:1 | ✅ AA | Purple accent (just passes) |
| `rgba(255,255,255,0.4)` on `#0a0a1a` | 4.6:1 | ✅ AA | Muted text (minimum) |
| `#00FFFF` on `#111128` | 9.8:1 | ✅ AAA | Cyan on card bg |

> ⚠️ **Never use purple text for body copy** — it fails WCAG AA on dark backgrounds. Reserve purple for decorative accents only.

### Focus States

All interactive elements must have visible focus indicators:

```css
/* Default focus ring applied globally */
*:focus-visible {
  outline: 2px solid #00FFFF;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.15);
}
```

**Exceptions:** Elements with custom focus management (modals, dropdowns) manage their own focus rings internally.

### ARIA Labels

| Element | Required Attributes |
|---------|--------------------|
| Buttons without text | `aria-label="descriptive name"` |
| Input fields | `aria-describedby` linking to helper text or error |
| Skip links | `href="#main-content"` |
| Loading spinners | `role="status" aria-live="polite"` |
| Modal dialogs | `role="dialog" aria-modal="true" aria-labelledby="modal-title"` |
| Interactive cards | `role="button" tabindex="0" aria-label="..."` |
| Dropdown menus | `role="menu" aria-haspopup="true"` |
| Progress bars | `role="progressbar" aria-valuenow` aria-valuemin aria-valuemax |

### Keyboard Navigation

- All interactive elements reachable via `Tab` order
- Enter/Space activates buttons and links
- Escape closes modals, dropdowns, sidebars
- Arrow keys navigate within grouped controls (tabs, radio groups)
- Focus trapping inside modal dialogs

### Screen Reader Considerations

- Use `sr-only` utility class for visually hidden labels:
  ```jsx
  <label className="sr-only">Email address</label>
  ```
- Announce dynamic changes with `aria-live`:
  ```jsx
  <div aria-live="polite" role="status">{isLoading ? "Loading..." : `${count} results found`}</div>
  ```
- Decorative images should have `alt=""` (empty alt)

---

## Dark/Light Mode Behavior

### Current Implementation

Boss Factory operates in **dark mode exclusively**. There is no light mode toggle yet.

### Planned Light Mode Variables

When light mode is added, these mappings will be used:

| Dark Token | Light Equivalent | Rationale |
|-----------|-----------------|-----------|
| `#0a0a1a` (bg-primary) | `#f5f5f5` | Light neutral background |
| `#111128` (bg-secondary) | `#ffffff` | Card surface |
| `#00FFFF` (cyan) | `#0891b2` | Darker cyan for contrast on white |
| `#A855F7` (purple) | `#9333ea` | Standard purple, works on both |
| `#ffffff` (text-primary) | `#111827` | Near-black text |
| `rgba(255,255,255,0.7)` (text-secondary) | `rgba(0,0,0,0.6)` | Gray body text |
| `rgba(255,255,255,0.4)` (text-muted) | `rgba(0,0,0,0.4)` | Subdued text |
| `rgba(0,255,255,0.3)` (glow) | `rgba(0,255,255,0.15)` | Softer glow |

### CSS Media Query Hook for Future Light Mode

```css
@media (prefers-color-scheme: light) {
  :root {
    --background: #f5f5f5;
    --foreground: #111827;
    /* ... more overrides */
  }
}
```

---

## Design Token Mapping

This table maps every Tailwind custom color to its actual CSS variable and hex code for quick reference during development.

### Custom Theme Colors (from `tailwind.config.ts`)

| Tailwind Config Path | CSS Variable | Hex Value | Usage in JSX |
|---------------------|-------------|-----------|--------------|
| `colors.bg.primary` | `var(--colors-bg-primary)` | `#0a0a1a` | `bg-[var(--colors-bg-primary)]` |
| `colors.bg.secondary` | `var(--colors-bg-secondary)` | `#111128` | `bg-[var(--colors-bg-secondary)]` |
| `colors.bg.tertiary` | `var(--colors-bg-tertiary)` | `#1a1a3a` | `bg-[var(--colors-bg-tertiary)]` |
| `colors.border.subtle` | `var(--colors-border-subtle)` | `rgba(255,255,255,0.08)` | `border border-[var(--colors-border-subtle)]` |
| `colors.border.accent` | `var(--colors-border-accent)` | `rgba(0,255,255,0.25)` | `border border-[var(--colors-border-accent)]` |
| `colors.neon.cyan` | `var(--colors-neon-cyan)` | `#00FFFF` | `text-[var(--colors-neon-cyan)]` |
| `colors.neon.blue` | `var(--colors-neon-blue)` | `#0EA5E9` | `text-[var(--colors-neon-blue)]` |
| `colors.neon.purple` | `var(--colors-neon-purple)` | `#A855F7` | `text-[var(--colors-neon-purple)]` |
| `colors.text.primary` | `var(--colors-text-primary)` | `#ffffff` | `text-[var(--colors-text-primary)]` |
| `colors.text.secondary` | `var(--colors-text-secondary)` | `rgba(255,255,255,0.7)` | `text-[var(--colors-text-secondary)]` |
| `colors.text.muted` | `var(--colors-text-muted)` | `rgba(255,255,255,0.4)` | `text-[var(--colors-text-muted)]` |

### How to Use Custom Colors in JSX

```jsx
// Correct: Use CSS variable syntax with bracket notation
<div className="bg-[var(--colors-bg-secondary)] border border-[var(--colors-border-subtle)]">
  <h2 className="text-[var(--colors-neon-cyan)]">Feature Title</h2>
  <p className="text-[var(--colors-text-secondary)]">Description text.</p>
</div>

// Incorrect: Don't try to use the Tailwind config names directly
// <div className="bg-bg-primary"> ❌ Won't work
```

### Creating Custom Gradients

Gradients can be defined using Tailwind's arbitrary value syntax or by adding them to `tailwind.config.ts`:

```jsx
// Inline gradient (quick use)
<div className="bg-gradient-to-br from-[var(--colors-neon-cyan)] to-[var(--colors-neon-purple)]">

// Or using raw hex values in gradient stops
<div className="bg-gradient-to-r from-[#00FFFF] via-[#0EA5E9] to-[#A855F7]">
```

---

## Quick Reference Cheat Sheet

### Most Common Patterns

```jsx
// Card
<div className="bg-[var(--colors-bg-secondary)] border border-[var(--colors-border-subtle)] rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300">
  
// Neon card (featured)
<div className="bg-[var(--colors-bg-secondary)] border border-[var(--colors-border-accent)] rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] transition-all duration-300">

// Glass panel
<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">

// Gradient heading
<h1 className="bg-gradient-to-br from-[var(--colors-neon-cyan)] to-[var(--colors-neon-purple)] bg-clip-text text-transparent">

// Neon text
<span className="text-[var(--colors-neon-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">

// Button
<button className="bg-gradient-to-br from-[var(--colors-neon-cyan)] to-[var(--colors-neon-blue)] text-white font-semibold px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] hover:scale-[1.02] transition-all duration-300">

// Input
<input className="w-full bg-[var(--colors-bg-tertiary)] border border-[var(--colors-border-subtle)] rounded-lg px-4 py-2.5 text-white placeholder-[var(--colors-text-muted)] focus:border-[var(--colors-border-accent)] focus:ring-2 focus:ring-[var(--colors-border-accent)] focus:ring-opacity-20 outline-none transition-colors duration-150" />

// Badge
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--colors-neon-green)]/10 text-[var(--colors-neon-green)] border border-[var(--colors-neon-green)]/20">Live</span>
```

---

*This document was populated based on actual code analysis of `tailwind.config.ts`, `src/app/globals.css`, and all existing UI components.*
