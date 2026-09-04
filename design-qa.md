# Talent Lab App Shell Design QA

Date: 2026-09-04

## Comparison Target

- Source visual truth:
  - `/var/folders/_c/_4ddl43544nfwhhbzkntklpw0000gn/T/codex-clipboard-890cb121-b454-4d66-93e6-fb895210433f.png` (928 x 1114 px, expanded application shell reference).
  - `/var/folders/_c/_4ddl43544nfwhhbzkntklpw0000gn/T/codex-clipboard-4aa922f8-6b3f-4dc1-ba3a-13c746dfa095.png` (399 x 1407 px, collapsed icon rail reference).
- Implementation: `http://127.0.0.1:5174/`.
- Browser-rendered comparison evidence:
  - `http://127.0.0.1:8898/` for the expanded shell.
  - `http://127.0.0.1:8897/` for the collapsed rail.
  - Codex in-app Browser captures were reviewed inline in the task.
- Desktop viewport: 1440 x 900 CSS px, device pixel ratio 1. Implementation capture: 1440 x 900 px.
- Mobile viewport: 375 x 812 CSS px, device pixel ratio 1. Implementation capture: 375 x 812 px.
- State: authenticated empty workspace, light theme for primary comparison; dark theme checked separately.
- Normalization: the references are promotional crops rather than a Talent Lab screen, so comparison is limited to the user-selected form language: rounded outer window, integrated left navigation, compact rail, surface separation, spacing hierarchy, and floating mobile navigation. Reference color, copy, imagery, and product content are intentionally excluded.

## Full-view Comparison Evidence

The expanded reference and live Talent Lab screen were rendered together in one browser comparison view. Both use a large rounded application window, an integrated left navigation region, a clearly separated content canvas, generous page insets, and restrained elevation. Talent Lab keeps its existing warm walnut palette and business content as requested.

The collapsed reference and live collapsed Talent Lab rail were also rendered together. The implementation preserves the narrow icon-only rail, divider, active navigation state, bottom utilities, and a collapse control anchored to the rail/content boundary. The number of icons differs because Talent Lab has three primary routes; this is an intentional information-architecture constraint.

## Focused Region Evidence

- Desktop navigation: expanded width 224px; collapsed width 72px; no horizontal scrollbar or clipped custom tooltip.
- Mobile navigation: one 44px floating trigger at the top left; menu begins at 68px, is 280px wide with a 20px radius, and has no duplicated close button or duplicated header chrome.
- Mobile content: 80px top inset protects the page title from the floating trigger.
- Responsive widths: 375, 768, 1024, and 1440 px all reported equal body client and scroll widths; no page-level horizontal overflow.

## Findings

No actionable P0, P1, or P2 issues remain for the agreed scope.

- Typography: Inter remains the UI font and the existing editorial serif remains limited to brand and page-level headings. Weight, wrapping, and hierarchy remained legible at all checked widths.
- Spacing and layout: shell, rail, cards, controls, and pills now use distinct 28px, 16px, 10px, and pill radius tiers. Desktop and mobile page insets remain stable.
- Colors and tokens: the existing semantic walnut tokens were preserved. Light and dark contrast checks pass; the outer muted field, card sidebar, and background content canvas now read as separate surfaces.
- Image quality and assets: the application shell contains no product imagery requiring recreation. Functional icons use the existing Lucide library; reference promotional imagery was intentionally not copied.
- Copy and content: existing product labels and routes remain unchanged. The new dashboard empty-state sentence has an English translation.
- Accessibility: icon buttons have labels, collapsed navigation links have accessible names, the mobile dialog traps focus, Escape closes it and restores focus, and the underlying main scroller is locked while open.

## Comparison History

### Iteration 1

- P1: mobile retained a full-width Header and duplicated close/brand controls inside the menu.
- P2: the collapsed desktop tooltip expanded the scrolling rail horizontally.
- P2: shell/background contrast was too weak and global rounding flattened the hierarchy.
- P2: the empty dashboard rendered blank chart regions instead of a useful next step.
- P2: mobile job filters were cramped into one row.

Fixes: removed the Header component, made the floating mobile trigger the sole close control, replaced clipped tooltips with native titled accessible links, strengthened shell elevation and surface separation, restored radius tiers, added an actionable empty dashboard, and stacked mobile job filters.

Post-fix evidence: expanded-shell comparison, collapsed-rail comparison, 375px closed/open navigation captures, dark-theme capture, and overflow measurements at four breakpoints. No P0/P1/P2 finding remained after the second comparison pass.

## Primary Interactions Tested

- Desktop sidebar expand and collapse.
- Mobile menu open and close.
- Escape close with focus restoration to the trigger.
- Mobile main-scroll lock while the dialog is open.
- Navigation from Jobs to Resumes with the menu closing.
- Light/dark theme toggle.
- Dashboard empty-state call to action present.
- Browser console errors checked: none.

## Follow-up Polish

- P3: consider persisting the desktop collapsed preference if repeated sessions make that valuable.

final result: passed
