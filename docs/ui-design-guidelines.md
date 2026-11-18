# GreenQuest Mobile UI Design Guidelines

> **Status:** Active MVP Style Guide (for Jira / Engineering & Design Handoff)  
> **Target Platform:** Expo / React Native (`greenquest-nova`, Expo SDK 58, NativeWind v4)  
> **Baseline Viewport:** `390 × 844 px` (portrait, Android-first)

This document defines the shared design tokens, core component patterns, screen naming, interaction states, responsive layout rules, and accessibility standards for GreenQuest so all six team members can build consistent mobile screens.

---

## 1. Design Tokens

### 1.1 Color Palette (Implemented NOVA System)

The implemented app uses the **NOVA** palette defined in `tailwind.config.js`, `lib/theme.ts`, and `global.css`:

| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Night** | `#12142E` | `bg-nova-night` / `text-nova-night` | Dark screen backgrounds, primary text on light surfaces |
| **Card (Dark)** | `#23264D` | `bg-nova-card` | Elevated surfaces & cards on dark screens |
| **Muted (Dark)** | `#3A3D6B` | `bg-nova-muted` | Borders, inactive tracks, active tab pill on dark screens |
| **Violet (Primary)** | `#795BF3` | `bg-nova-violet` / `bg-primary` | Primary CTAs, active tab icon/label (light), focus rings |
| **Tint** | `#EDE9FE` | `bg-nova-tint` / `bg-secondary` | Secondary surfaces, active tab pill (light), light progress track |
| **Coral (Accent)** | `#FF758A` | `bg-nova-coral` / `bg-destructive` | High-emphasis setup CTA, alerts, destructive/error accents |
| **Coral Tint** | `#FEE2E2` | `bg-nova-coralTint` | Soft error/alert badge backgrounds |
| **Gold (Reward)** | `#FFD46B` | `text-nova-gold` | Progress ring arc, GreenPoints highlights, dark active tab icon |
| **Gold Tint** | `#FEF3C7` | `bg-nova-goldTint` | Soft reward/badge backgrounds |
| **Cyan** | `#67D4F6` | `text-nova-cyan` | Secondary accent & decorative highlights |
| **Cloud (Light BG)** | `#F6F4FB` | `bg-nova-cloud` | Light screen backgrounds |
| **White** | `#FFFFFF` | `bg-nova-white` / `bg-card` | Light cards, popovers, text on dark surfaces |
| **Cream** | `#FFF8E7` | `bg-nova-cream` | Warm highlight card surface |

#### Brand & Wireframe Palette Note
The app icon, adaptive launcher (`app.json`), splash screen (`#F2F7EE`), and original SVG wireframes (`requirements/README_IMPORT.md`) use the GreenQuest forest palette (`#2E7D32` Forest Green, `#173820` Deep Forest, `#66BB6A` Leaf Green, `#F2F7EE` Warm Ivory, `#FFC107` Golden Reward, `#358C3B` → `#19611E` launcher gradient). In-app screens use the **NOVA** tokens above; keep launcher/splash assets in the forest palette.

### 1.2 Contrast Rules (WCAG AA)
- Maintain at least **4.5:1** contrast for body text and **3:1** for large text (`>= 18px` bold / `>= 24px`) and UI icons.
- **On Dark (`#12142E` / `#23264D`):** Use `#FFFFFF` (`text-white`), `#F6F4FB`, or `#FFD46B` (`text-nova-gold`) for primary content; muted captions use `text-white/55`–`text-white/60` only for non-critical metadata.
- **On Light (`#F6F4FB` / `#FFFFFF`):** Use `#12142E` (`text-nova-night`) for primary text and `text-nova-night/70` for body descriptions.
- **On Coral (`#FF758A`) & Cloud (`#F6F4FB`) Buttons:** Always use dark text (`text-nova-night`) — never white text on coral or gold.
- **On Violet (`#795BF3`) & Night (`#12142E`) Buttons:** Use `#FFFFFF` (`text-white`).

### 1.3 Typography Hierarchy

Defined in `components/ui/text.tsx` and `components/nova/Screens.tsx`:

| Variant / Pattern | Size / Weight | Role / Semantics | Usage |
| :--- | :--- | :--- | :--- |
| `h1` | `text-4xl` (36px), `font-extrabold`, `tracking-tight` | `role="heading"`, `aria-level="1"` | Hero / Welcome titles |
| `h2` | `text-3xl` (30px), `font-semibold`, `tracking-tight` | `role="heading"`, `aria-level="2"` | Major section titles |
| `h3` | `text-2xl` (24px), `font-semibold`, `tracking-tight` | `role="heading"`, `aria-level="3"` | Screen headers |
| `h4` | `text-xl` (20px), `font-semibold`, `tracking-tight` | `role="heading"`, `aria-level="4"` | Card / modal titles |
| `large` | `text-lg` (18px), `font-semibold` | — | Prominent subheadings |
| `default` | `text-base` (16px), regular | — | Standard body copy & inputs |
| `small` | `text-sm` (14px), `font-medium` | — | Button labels, secondary body |
| `muted` | `text-sm` (14px), `text-muted-foreground` | — | Helper & supporting text |
| **Eyebrow** | `text-[11px]`, `font-bold`, `tracking-[1.4px]` | Uppercase label | Screen/section category kicker |
| **Tab Label** | `text-[10px]`, `font-semibold` | Tab caption | `BottomNav` item labels |
| **Ring Metric** | `text-[28px]`, `font-extrabold` | — | `ProgressRing` percentage |

### 1.4 Spacing Scale & Border Radii

- **Base Grid:** `4px` (`1` Tailwind unit = `4px`).
  - Tight / inline gaps: `6px` (`gap-1.5`), `8px` (`gap-2`)
  - Compact padding: `12px` (`p-3` / `px-3`)
  - Standard screen horizontal gutter: `16px` (`px-4`) to `24px` (`px-6`)
  - Card internal spacing: `24px` (`px-6`, `py-6`, `gap-6`)
- **Border Radii:**
  - Base `--radius`: `14px` (`0.875rem`, `lib/theme.ts` & `global.css`)
  - Inputs & small buttons: `rounded-md` (`6px`–`10px`)
  - Cards & Glass surfaces: `rounded-xl` (`12px`–`14px`)
  - Primary CTAs & alert banners: `rounded-2xl` (`16px`)
  - Badges, avatars, icon circles, nav pills: `rounded-full`

### 1.5 Reusable Icons & Illustrations
- **Icon Library:** `lucide-react-native` (`^1.73.0`). Standardize on:
  - Navigation: `Home`, `Compass`, `SquareCheck`, `ChartNoAxesColumn` (`size={19}`, `strokeWidth={2}` inactive / `2.4` active)
  - Actions & Status: `ArrowRight` (`size={19}`, `strokeWidth={2.5}`), `ChevronLeft`, `Check`, `CheckCircle2`, `X` (`size={15}`), `Search`, `Camera`, `CircleHelp` (`size={16}`)
  - Domain & Rewards: `Bike`, `Footprints`, `Utensils`, `Zap`, `Activity`, `Clock3`, `CalendarDays`, `Trophy`, `Award`, `Star`, `Sparkles`, `Heart`
- **Custom Vectors & Avatars:** `AnimalAvatar` (`components/nova/AnimalAvatar.tsx`) for anonymous profiles and `react-native-svg` (`SvgCircle`) for `ProgressRing`.

---

## 2. Core Component Specifications

All primitives live in `components/ui/` and composite NOVA patterns in `components/nova/`.

| Component | Source | Variants / Configuration | Behavior & Rules |
| :--- | :--- | :--- | :--- |
| **Button & PrimaryCta** | `components/ui/button.tsx`, `Screens.tsx` | `Button` variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; sizes: `default` (`h-10`), `sm` (`h-9`), `lg` (`h-11`), `icon` (`h-10 w-10`). `PrimaryCta` (`h-14`, `rounded-2xl`): `violet`, `coral`, `night`, `light`. | `active:scale-[0.98]`; `disabled` applies `opacity-50`. `PrimaryCta` includes trailing circular `ArrowRight` icon. |
| **Input Fields** | `components/ui/input.tsx`, `Screens.tsx` | `Input` (`h-10`, `rounded-md`, `border-input`), `@react-native-community/slider`, and selectable radio option rows. | Supports `editable={false}` (`opacity-50`), web `focus-visible:ring-[3px]`, and `aria-invalid` error border. |
| **Cards & GlassSurface** | `components/ui/card.tsx`, `Screens.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. `GlassSurface` uses `expo-blur` `BlurView` (`intensity={12}`). | `Card` uses `rounded-xl border py-6 gap-6 shadow-sm`. `GlassSurface` falls back to solid container when `enabled={false}`. |
| **Navigation Tabs** | `Screens.tsx` (`BottomNav`), `RouteLayout.tsx` | 4 tabs: **Home** (`/home`), **Explore** (`/recommendations`), **Active** (`/active`), **Impact** (`/insights`). | Pill highlight (`bg-nova-tint` light / `bg-nova-muted` dark), `min-w-[72px]`, `accessibilityRole="tab"`, `accessibilityState={{ selected }}`. |
| **Badges** | `components/ui/badge.tsx` | `default`, `secondary`, `destructive`, `outline` (`rounded-full px-2 py-0.5 text-xs font-medium`). | Use for challenge categories, difficulty, points, and status tags. |
| **Progress Indicators** | `Screens.tsx` (`ProgressRing`), `app/_layout.tsx` | `ProgressRing` (`size={138 | 150 | 174}`, `strokeWidth={11 | 13}`, `COLORS.gold` arc); `ActivityIndicator` for hydration. | Rotated `-90deg` with rounded stroke caps (`strokeLinecap="round"`) and centered `% COMPLETE` label. |
| **Feedback Messages** | `Screens.tsx`, `app/_layout.tsx` | Floating alert toast (`border-l` coral accent, `CircleHelp` icon, dismiss `X`), inline field errors, and full-screen retry state. | Toast uses `FadeInDown` (`220ms`), `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`. |

---

## 3. Screen Naming, Theme Mapping & States

### 3.1 Screen Inventory & Wireframe Mapping

| Wireframe (`requirements/`) | App Route (`app/`) | `ScreenId` (`useAppStore.ts`) | Surface Mode | Bottom Tabs |
| :--- | :--- | :--- | :--- | :--- |
| `01_Welcome.svg` | `/` (`app/index.tsx`) | `welcome` | Dark (`#12142E`) | No |
| — (Profile Setup) | `/profile` (`app/profile.tsx`) | `profile` | Light (`#F6F4FB`) | No |
| `02_Home.svg` | `/home` (`app/home.tsx`) | `home` | Light (`#F6F4FB`) | Yes |
| `03_Lifestyle_Assessment.svg` | `/assessment` (`app/assessment.tsx`) | `assessment` | Light (`#F6F4FB`) | No |
| — (Activity Inputs) | `/activity` (`app/activity.tsx`) | `activity` | Light (`#F6F4FB`) | No |
| `04_Carbon_Insight.svg` | `/insights` (`app/insights.tsx`) | `insights` | Light (`#F6F4FB`) | Yes |
| `05_Smart_Recommendations.svg` | `/recommendations` (`app/recommendations.tsx`) | `recommendations` | Dark (`#12142E`) | Yes |
| `06_Challenge_Library.svg` | `/library` (`app/library.tsx`) | `library` | Light (`#F6F4FB`) | Yes |
| `07_Challenge_Details.svg` | `/details/[id]` (`app/details/[id].tsx`) | `details` | Light / Detail | No |
| `BONUS_08_Active_Progress_Variant.svg` | `/active` (`app/active.tsx`) | `active` | Dark (`#12142E`) | Yes |
| `08_Challenge_Progress_Completed.svg` | `/completed` (`app/completed.tsx`) | `completed` | Dark (`#12142E`) | Yes |

### 3.2 Standard Component & Screen States
Every interactive screen and component must handle four states:
1. **Normal:** Default resting state with clear visual hierarchy and active contrast.
2. **Disabled:** `disabled={true}` or `editable={false}` renders at `opacity-50` with non-interactive pointer/press behavior.
3. **Error:**
   - **Field-level:** Inline validation message below the input + `aria-invalid` border.
   - **Action/Form-level:** Dismissible alert toast (`accessibilityRole="alert"`).
   - **Storage/Boot-level:** Centered error message with `Retry` button (`app/_layout.tsx`).
4. **Loading:**
   - **App Hydration:** Centered `ActivityIndicator` + `"Loading your saved progress…"` (`app/_layout.tsx`).
   - **Async Save:** Disable submit CTA (`disabled={saving}`) to prevent duplicate submissions.

---

## 4. Responsive Layout & Accessibility Guidelines

### 4.1 Phone Sizes & Safe Areas
- **Design Baseline:** `390 × 844 px`; verify layouts down to `360 px` wide (compact Android) and up to `430 px`+ (large phones) and web/tablet (`max-w-[420px]` for floating banners).
- **Safe Areas:** Always wrap screens in `RouteLayout` (`SafeAreaView` with `edges={["top", "left", "right", "bottom"]}`).
- **Scrollability:** Wrap long forms and content lists in `ScrollView` so small viewports never clip primary CTAs or inputs.

### 4.2 Touch Targets, Keyboard & Accessibility
- **Touch Targets:** Minimum **44 × 44 dp** for all tappable controls (`PrimaryCta` is `56px` tall; `BottomNav` tabs are `min-w-[72px]`; icon buttons should be at least `40–44px` or use `hitSlop`).
- **Screen Reader Semantics:**
  - Buttons: `accessibilityRole="button"` + descriptive `accessibilityLabel` for icon-only buttons (e.g., `"Go back"`, `"Dismiss notification"`).
  - Tabs & Radios: `accessibilityRole="tab"` / `"radio"` with `accessibilityState={{ selected }}` / `{{ checked }}`.
  - Numeric Inputs: Include `accessibilityUnits` where applicable (e.g., `"years"`).
  - Headings: Use `Text` `variant="h1".."h4"` or `CardTitle` so `role="heading"` and `aria-level` are set automatically.
- **Keyboard & Motion:**
  - Dismiss keyboard on form submit (`Keyboard.dismiss()`) and support `focus-visible` rings on web/keyboard navigation.
  - Respect system reduced motion via `ReduceMotion.System` (`react-native-reanimated`) and `@media (prefers-reduced-motion: reduce)` (`global.css`).

---

## 5. Figma & Engineering Handoff

- **Figma Import:** Follow `requirements/README_IMPORT.md` to drag `requirements/01_*.svg`–`08_*.svg` into your shared Figma file, organize frames `01`–`08`, and convert text layers to native Figma text styles matching Section 1.3.
- **Code Implementation:** Always import primitives from `@/components/ui/*`, wrap screens in `RouteLayout`, and use `nova-*` or semantic Tailwind tokens (`bg-background`, `text-foreground`, `bg-primary`) rather than hardcoded hex values.
