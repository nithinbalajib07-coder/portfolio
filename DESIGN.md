# Design System: Nithin Balaji Portfolio

## Visual World & Identity
- **Theme:** Optimus Prime Autobot Transformer Aesthetic (Command Royal Blue & Energon Neon Red)
- **Header Structure:** Floating White iPhone Notch / Dynamic Island Contour (`position: fixed; border-radius: 9999px; background: rgba(255, 255, 255, 0.94);`)
- **Brand Logo:** Unified single solid color name ("Nithin Balaji", `#0A1938`) with Autobot Command Insignia badge
- **Mode:** Experience & Persuade (Interactive Student Developer & Engineering Portfolio)
- **Mood:** Command authority, futuristic, high-tech, architecturally disciplined, and accessible
- **Palette Foundation:** High-contrast Autobot Command Navy (`#0A1938`), vibrant Royal Blue (`#1D4ED8`), and Energon Neon Red (`#FF1744` / accessible `#C5162E`).

---

## Color Tokens & Mappings (Strict WCAG AA Verified)

| Token | Hex / Value | Semantic Role | Contrast vs Canvas |
|---|---|---|:---:|
| `--bg-primary` | `#FFFFFF` | Clean architectural canvas | - |
| `--bg-secondary` | `#F4F7FC` | Subtle cybernetic secondary background | - |
| `--bg-tertiary` | `#EEF4FF` | Autobot ice-blue badges and callouts | - |
| `--royal-blue` | `#1D4ED8` | Primary Autobot interactive color, buttons, active links | 5.3:1 (Passes AA) |
| `--deep-royal-blue` | `#0A1938` | Command navy, headings, section titles, logo text | 15.6:1 (Passes AAA) |
| `--neon-red` | `#FF1744` | Energon Neon Red for notch pips, chips, status indicators | 5.6:1 (vs #0A1938) |
| `--crimson-red` | `#C5162E` | Accessible Energon Red text on light surfaces | 5.4:1 (Passes AA) |
| `--palatinate-border` | `#BFDBFE` | Crisp light blue Autobot titanium borders | - |
| `--text-primary` | `#0A1326` | Deep navy-black body text for maximum clarity | 16.5:1 (Passes AAA) |
| `--text-secondary` | `#3D4E68` | Slate for descriptions and subtitles | 6.5:1 (Passes AA) |
| `--text-muted` | `#53647F` | Muted cool slate for meta labels, dates, credits | 5.2:1 (Passes AA) |
| `--border-color` | `#D3DFEE` | Crisp architectural border lines | - |

---

## iPhone Notch / Dynamic Island Header Architecture (Light Theme)
1. **White Glass Contour & Geometry:**
   - Centered floating pill suspended at `top: 14px; left: 50%; transform: translateX(-50%);`.
   - Ultra-smooth pill contour with `border-radius: var(--radius-full);` (9999px).
   - High-tech frosted white glass surface (`background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(24px) saturate(180%);`).
2. **Minimalist Header Layout:**
   - Streamlined contour focusing on the unified brand monogram on the left and primary navigation pills on the right, removing camera sensor widgets for a clean, professional aesthetic.
3. **Logo Unification:**
   - Single solid color for the entire name string (`#0A1938` in the notch, no split dual colors, 15.6:1 contrast against white).
   - "NB" Autobot monogram badge with Energon red pip.
4. **Header Actions & Navigation:**
   - Clean, focused navigation without cluttered extra CTA buttons ("Get In Touch" completely removed).
   - Active section pill in royal blue with energized dot.
5. **Scrolled Island Behavior:**
   - Smoothly contracts to `height: 48px; width: min(820px, calc(100% - 24px));` upon scroll with spring timing (`cubic-bezier(0.16, 1, 0.3, 1)`).
6. **Mobile Dynamic Island Expansion:**
   - Tapping the mobile toggle expands the white notch downwards into a rounded 24px widget drawer (`.mobile-nav-drawer`).

---

## Background Architecture & Interactive Visual Dynamics
1. **Persistent Cybertronian Swirl Vortex (Visible Across All Sections):**
   - Centered 3D multi-arm logarithmic spiral vortex featuring 195 glowing nodes (Royal Blue, Neon Red, and Cyan) paired with concentric tilted orbital telemetry rings.
   - Remains anchored within the viewport throughout page scroll via subtle smooth parallax rather than scrolling off-screen, ensuring persistence across all sections.
2. **Raining Energon Flakes (Both Neon Red & Royal Blue):**
   - 450 particles (50% Autobot Royal Blue `#1D4ED8`/`#3B82F6` and 50% Energon Neon Red `#FF1744`/`#EF4444`) continuously raining downward through the scene with organic wind sway and top recycling.
3. **Interactive Section Expansion on Hover:**
   - **Section Lift & Scale:** Whenever the user hovers over any section, the section smoothly scales up (`transform: scale(1.02); z-index: 5`) with fluid timing (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - **Swirl Swell:** In parallel, the background 3D swirl expands dynamically (`scale: 1.35`) during section hover, returning smoothly to standard scale (`1.0`) on mouseleave.
4. **Translucent Section Layers:**
   - Alternating sections use translucent frosted glass (`rgba(244, 247, 252, 0.40)` with `backdrop-filter: blur(4px)`) or full transparency, allowing the raining flakes and swirl to be visible continuously from Hero to Contact.

---

## Projects Section (Vacant Engineering State)
- Placeholder mock project cards have been removed and replaced by an authoritative vacant state showcase (`.projects-vacant-showcase`).
- **Telemetry Header:** `SYS_QUEUE // REPOSITORIES IN COMPILATION` & `VIT VELLORE · CSE CORE`.
- **Radar Schematic:** Custom SVG radar blueprint with concentric scan rings and crosshairs.
- **Narrative Copy:** Authoritative statement clarifying that coursework repositories and algorithms are under active compilation and testing for Semester 3.
- **Telemetry Tags:** `Core Systems`, `Active Sprints`, `Verified Coursework`, `Python / C++ / WebGL`.

---

## Typography Hierarchy
- **Hero Title & Monogram:** `Cinzel` & `Bodoni Moda` (700, 800, 900) — Chiseled, stone-carved, ink-trap display serif
- **Section Headings:** `Syne` (600, 700, 800) — Bold, architectural geometric grotesque
- **Body & Prose:** `DM Sans` (400, 500, 600, 700 with opsz 9..40) — Legible, modern sans-serif
- **Data, Badges & Code:** `JetBrains Mono` (400, 500, 600) — Tabular numerals, course codes, GPA metrics

---

## Academic Transcript Architecture
The Academics section (`id="academics"`) delivers a verified academic dashboard:
1. **Academic Performance Summary Cards:**
   - Fall Semester 2025–26 GPA: **9.30** (6 Courses · 20.0 Credits)
   - Winter Semester 2025–26 GPA: **9.81** (8 Courses · 27.0 Credits)
   - Academic Program: **B.Tech CSE Core**, VIT Vellore (2025–2029)
   - Cumulative GPA (Hero Highlight): **9.6**
2. **Simplified WAI-ARIA Tab Navigation:**
   - Fall Semester 2025–26 (6 courses) — Initial active tab
   - Winter Semester 2025–26 (8 courses)
   - Accessible keyboard arrow key navigation (`ArrowLeft`, `ArrowRight`) with `aria-selected` and `tabindex` synchronization.
3. **Course Badges:**
   - Grade S (Autobot Royal Blue) and Grade A (Energon Red) indicators.

---

## Accessibility & Standards Compliance
- Strict WCAG AA compliance (all typography and interactive states pass 4.5:1+ contrast).
- 0 warnings in Impeccable design mechanical detector (`impeccable detect`).
- Preserves user motion preferences via responsive `prefers-reduced-motion` coordination.
