# Website audit — 21 September 2026

## Scope

Reviewed the desktop shell, all seven apps, shared window geometry/focus behavior, camera and animation lifecycles, public assets, package configuration, accessibility, and documentation. Verification used local production builds, Chromium browser tests, a simulated camera, and an axe-core 4.10.3 WCAG 2 A/AA + WCAG 2.1 AA scan of the desktop and each app's initial view.

## Findings addressed

| Finding | Change |
| --- | --- |
| Every app and the window manager were eagerly imported on the desktop route. | Load window/app components on demand with `next/dynamic`; provide app-loading status text. Verified that additional Terminal/window scripts load only after launching the app. |
| The wallpaper downloaded an 891,991-byte PNG as a CSS background. | Use a decorative, prioritized `next/image` with responsive sizes. Keep the original PNG as the source; Next serves optimized derivatives. |
| Date and minute-only clock rerendered every second. | Added a precision-aware clock hook: next midnight for the date, next minute for desktop time, seconds only for the active Terminal clock. Timers suspend when the tab is hidden. |
| All seven taskbar buttons could collide with centered header content at medium widths. | Use the separate taskbar row below 1024px, matching the workspace reservation. Added overlap/visibility coverage at 320, 640, 800, 1024, and 1280px. |
| Desktop icons could overflow on very short screens outside the previous narrow-screen exception. | Compact the icon grid on short screens, including 320×256 and 640×320. All seven launchers remain on screen without scrolling. |
| BlockStack's small labels and keyboard hints failed text contrast checks. | Brightened the muted text while retaining the compact layout. |
| ASCII-Cam redrew unchanged video frames and repeated solid-color assignments for every cell. | Skip duplicate media timestamps, omit blank glyphs, and set solid ink once per frame. |
| Five unused Next.js starter SVGs remained in `public/`. | Removed the unreferenced files. These were repository clutter, not active network requests. |
| README still described removed game touch controls and an obsolete bottom taskbar. | Corrected those descriptions and documented the camera sidebar. |

## Measurements

| Metric | Before | After |
| --- | ---: | ---: |
| Next build `/` route size | 29.7 KB | 11.3 KB |
| Next build first-load JavaScript estimate | 143 KB | 125 KB |
| Wallpaper response body, Chromium at 1366×768, DPR 1 | 891,991 bytes (PNG source) | 72,266 bytes (`image/webp`, optimizer request `w=1920&q=75`) |

The image comparison is approximately **92% fewer bytes**; the first-load JS estimate is approximately **13% smaller**. Image response size varies with viewport, device pixel ratio, and negotiated format. These are local build/network measurements, not a Lighthouse score or field Core Web Vitals assessment. Opening apps still downloads their deferred code.

## Verification

- Production build, lint/type validation, and 16 unit tests passed.
- All 38 browser tests passed against the production server, covering the desktop, Terminal/effects, BlockStack, and ASCII-Cam.
- New regressions cover additional small screens, header/taskbar overlap, and clocks crossing midnight.
- Full `pnpm audit`, including development dependencies, reported no known vulnerabilities at audit time.
- Accessibility scan initially found only BlockStack text-contrast violations; those colors were corrected and rechecked.
- Camera permission errors, late permission resolution after close, track cleanup, minimize/restore, appearance changes, and narrow-screen preview behavior are covered by simulated-camera tests.

## Remaining considerations

1. **Search indexing / shareable content:** portfolio content is behind client-side app launchers on a single route. Dedicated résumé/project URLs or a server-rendered text view would improve direct linking and crawler access, but require a navigation/content decision.
2. **BlockStack on touch-only devices:** the intentionally minimal version uses keyboard gameplay. Mobile layout support does not make it playable without a keyboard; gesture controls would be a separate feature.
3. **Small text:** the compact game labels remain intentionally small. Contrast is improved, but a larger-text mode would improve readability if the minimal layout requirement changes.
4. **Node test warnings:** direct Node execution of the TypeScript engine tests emits `MODULE_TYPELESS_PACKAGE_JSON` warnings. Tests pass; adopting package-wide ESM would also require reviewing the Next configuration's `__dirname` usage.
5. **Validation limits:** automated accessibility scans do not establish complete WCAG conformance. Real webcam/device testing, Safari/Firefox testing, external-profile link availability, and deployed-site field performance were not verified by this local audit.

No new runtime dependencies were added. The original wallpaper, working features, and intentional visual effects were retained.
