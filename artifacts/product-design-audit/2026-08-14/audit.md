# Talent Lab product design audit

Date: 2026-08-14

## Scope

- Product: Talent Lab local development build.
- User goal: Sign in, understand the workload, find a candidate, inspect candidate fit, manage job opportunities, and upload resumes.
- Surfaces: Desktop default viewport and a 390 x 844 mobile viewport.
- Mode: Combined UX and accessibility review.

## Overall verdict

The product already has a coherent visual system, readable cards, clear status badges, and a solid responsive shell. The largest gains now come from task structure rather than a visual restyle: make the candidate list responsive by default, reset scroll on route changes, split the job workspace from its very long edit form, and make the dashboard more actionable.

## Flow steps

1. Login final state - Healthy.
   - Clear single action, strong contrast, and a deliberate split-screen brand composition.
   - The animation resolves into a useful hierarchy: product name and positioning on the left, authentication on the right, and a supporting capability line at the bottom.
   - The remaining opportunity is to give the three repeated `Talent Lab` labels distinct jobs, for example a compact wordmark, a benefit-led hero line, and a form heading such as `Welcome back`.
   - Motion should respect `prefers-reduced-motion`, avoid delaying focus, and leave the key field usable immediately.
2. Dashboard - Needs refinement.
   - Summary metrics and recent uploads are easy to identify.
   - The screen repeats the page title and does not answer what needs attention next.
   - The chart region does not reflow comfortably at the captured desktop width.
3. Candidate list, desktop - Needs improvement.
   - Search, status, skills, sorting, view choice, and result count are all available.
   - The filter bar is dense and the table action column is clipped at the captured width.
   - Destructive actions are visually prominent in every row while the primary open-and-review action is only the candidate name.
4. Candidate detail arrival - Problematic.
   - Navigation preserved the previous page scroll position and opened the detail page 852 px down.
   - Candidate identity, status, and primary actions were hidden on arrival.
5. Candidate detail top - Generally healthy but dense.
   - Profile, status, job matching, score, and original PDF are brought together well.
   - The two-column layout makes the candidate profile and matching panel compete for attention.
   - Score explanations would scan faster with strengths, gaps, and next action separated.
6. Job list - Healthy.
   - Cards are easy to compare and the create action is clear.
   - Long descriptions are still too dominant; next step, priority, deadline, and latest activity would be more useful comparison fields.
7. Job editor - High friction.
   - The sticky save action is helpful and field groups are visually consistent.
   - Opening a job goes directly into a very long edit form that mixes job facts, requirements, compensation, application tracking, resume matching, and timeline work.
   - This should be a read-oriented job workspace with separate tabs or sections, with editing entered deliberately.
8. Upload, desktop - Healthy.
   - The drop zone, file limit, and empty queue are immediately understandable.
   - Add accepted file size, expected processing time, and privacy/storage reassurance near the drop zone.
9. Upload, mobile - Healthy.
   - The CTA and empty state reflow cleanly.
10. Mobile navigation - Healthy.
   - Clear labels, strong selected state, and a proper overlay reduce background distraction.
11. Candidate list, mobile table - Problematic.
   - The persisted table view shows only selection and name in the initial viewport, hiding score, status, and actions off-screen.
12. Candidate list, mobile cards - Workable.
   - Card view fits the screen and exposes the main candidate data.
   - Filters still occupy most of the first viewport, delaying access to candidates.

## Highest-impact recommendations

1. Make candidate browsing adaptive.
   - Default to cards below the tablet breakpoint and store table/card preference per breakpoint.
   - Move secondary filters into a filter sheet or collapsible panel on mobile.
   - Keep search, active filter chips, result count, and sort visible.
   - On desktop, give the table an intentional horizontal scroll container and keep name and actions sticky, or reduce visible columns.
2. Reset scroll on every route change.
   - New detail pages should start at the top unless explicit back-navigation restores a saved list position.
3. Turn a job into a workspace, not one form.
   - Use a read-only overview with tabs such as Overview, Requirements, Matches, Application, and Timeline.
   - Put editing behind an Edit action and use progressive disclosure for less common fields.
   - Keep the existing sticky save action only in edit mode.
4. Make the dashboard action-oriented.
   - Add an attention queue for failed parses, resumes still processing, upcoming follow-ups, and roles with no next step.
   - Add metric context such as change, completion rate, or clickable drill-down.
5. Remove repeated page titles.
   - On desktop, use the top bar for breadcrumbs and global controls, and keep one content heading.
   - On mobile, keep the compact top-bar title and reduce or remove the repeated content heading.
6. Tighten touch and accessible naming.
   - Captured mobile header icon buttons measured 36 x 36 px and skill chips measured 30 px high. Increase important touch targets toward 44 x 44 CSS px.
   - Give the job-status filter and other unnamed controls explicit accessible names.
   - Verify contrast, focus order, error announcement, zoom reflow, and screen-reader output with dedicated tests.

## Strengths worth preserving

- Consistent blue/slate palette, spacing, border radius, and component treatment.
- Text accompanies status colors, so state is not conveyed by color alone.
- Header icon controls expose accessible labels in the captured DOM.
- Drag handles describe a keyboard alternative.
- Visible focus treatment is clear in the job editor.
- Mobile navigation and upload reflow are already strong.

## Evidence limits

This review used current-run screenshots and DOM snapshots. It did not complete a full keyboard traversal, screen-reader test, automated contrast calculation, 200 percent zoom test, upload with real files, destructive actions, or state-changing save flows. It therefore identifies accessibility risks but does not claim WCAG compliance.
