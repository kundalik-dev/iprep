# Task 01 — Drawer Framework & Shell

**Phase:** 3A  
**Priority:** 🔴 Critical (blocks all other drawer tasks)  
**Estimated Tokens:** ~12,000  
**Depends On:** Phase 2 ✅ COMPLETE  
**Ref:** [call-feature.md](../iprep/call-feature.md) §3.1–3.3, §5, §6, §7, §8

---

## Objective

Create the collapsible right-side drawer infrastructure: context, container component, segmented tab bar, CSS styles, and all animations. Wire into existing layout.

---

## Deliverables

### 1. `DrawerContext.jsx` — State Management

**Path:** `apps/web/src/context/DrawerContext.jsx`  
**Est. tokens:** ~1,200

```
State:
  isDrawerOpen: boolean (default: false)
  activeTab: 'documents' | 'ai-capability' | 'settings' (default: 'documents')

Actions:
  toggleDrawer()      — flip open/close
  openDrawer(tab?)    — open + optionally set tab
  closeDrawer()       — close
  setActiveTab(tab)   — switch tab without closing
```

- Follow existing pattern in `ChatContext.jsx` (createContext + Provider + useContext hook)
- Export `DrawerProvider` and `useDrawerContext`
- Keyboard: `Escape` key closes drawer when open

### 2. `RightDrawer.jsx` — Container Component

**Path:** `apps/web/src/components/Drawer/RightDrawer.jsx`  
**Est. tokens:** ~2,000

- Renders conditionally based on `isDrawerOpen`
- Fixed width `380px`, full height, positioned right of `.main-content`
- Includes `<DrawerTabs />` at top and tab content area below
- Slide-in animation: `transform: translateX(100%) → translateX(0)`
- ARIA: `role="complementary"`, `aria-label="Configuration panel"`
- Mobile (≤767px): full-width overlay with backdrop
- Close button visible on mobile

### 3. `DrawerTabs.jsx` — Segmented Tab Bar

**Path:** `apps/web/src/components/Drawer/DrawerTabs.jsx`  
**Est. tokens:** ~1,500

- Three tabs: `📁 Documents` | `🤖 AI Files` | `⚙️ Settings`
- Pill-shaped segmented control (inspired by reference image04)
- Active tab: `--color-primary` background, white text
- Inactive tab: transparent, `--text-secondary`, hover → `--bg-hover`
- ARIA: `role="tablist"`, each button `role="tab"`, `aria-selected`
- Renders corresponding tab panel component

### 4. Placeholder Tab Content

**Est. tokens:** ~1,200

Create stub components that render simple placeholder content:

- `DocumentsTab.jsx` — "📁 Documents will appear here"
- `AICapabilityTab.jsx` — "🤖 AI capability files will appear here"
- `SettingsTab.jsx` — "⚙️ Settings coming soon"

Each must:

- Wrap content in `<div role="tabpanel" aria-labelledby="tab-{name}">`
- Use `fadeIn` animation on mount

### 5. `drawer.css` — All Drawer Styles

**Path:** `apps/web/src/styles/drawer.css`  
**Est. tokens:** ~3,000

Styles needed:

- `.right-drawer` — container, positioning, width, animation
- `.right-drawer.open` — visible state
- `.drawer-header` — top section with close button
- `.drawer-tabs` — segmented tab bar wrapper
- `.drawer-tab` — individual tab button
- `.drawer-tab.active` — active state
- `.drawer-tab-content` — scrollable content area
- `.drawer-backdrop` — mobile overlay backdrop
- `.drawer-close-btn` — close button (mobile only by default)
- `@keyframes fadeIn` — tab content entrance
- `@media (max-width: 767px)` — full-width responsive override
- `@media (max-width: 1199px)` — overlay mode (not push)

### 6. CSS Token Additions

**Path:** `apps/web/src/styles/variables.css`  
**Est. tokens:** ~300

Add to `:root`:

```css
--drawer-w: 380px;
--drawer-bg: #111122;
--drawer-border: rgba(255, 255, 255, 0.06);
--drawer-tab-bg: rgba(255, 255, 255, 0.04);
--drawer-tab-active: var(--color-primary);
```

### 7. Modifications to Existing Files

**Est. tokens:** ~2,800

| File             | Change                                                                                   | Tokens |
| ---------------- | ---------------------------------------------------------------------------------------- | ------ |
| `App.jsx`        | Wrap in `<DrawerProvider>`, import `drawer.css`                                          | ~400   |
| `MainLayout.jsx` | Add `<RightDrawer />` after `.main-content`                                              | ~600   |
| `ChatHeader.jsx` | Add drawer toggle button (☰ icon) with `aria-expanded`, `aria-controls`                 | ~1,000 |
| `layout.css`     | Add transition on `.main-content` width when drawer open; add `.app-shell` flex handling | ~800   |

---

## Acceptance Criteria

- [x] Drawer toggles open/closed via header button
- [x] Three tabs render and switch without errors
- [x] Slide-in animation plays smoothly (no jank)
- [x] `Escape` key closes drawer
- [x] ARIA attributes present: `role`, `aria-label`, `aria-expanded`, `aria-selected`
- [x] Mobile: full-width overlay with backdrop
- [x] Desktop (≥1200px): push layout (center stage shrinks)
- [x] Tablet (768–1199px): overlay mode
- [x] No regressions in existing sidebar or chat window

## Status: ✅ COMPLETE — 2026-04-12

---

## Files Changed

| Action | File                                                               |
| ------ | ------------------------------------------------------------------ |
| CREATE | `apps/web/src/context/DrawerContext.jsx`                           |
| CREATE | `apps/web/src/components/Drawer/RightDrawer.jsx`                   |
| CREATE | `apps/web/src/components/Drawer/DrawerTabs.jsx`                    |
| CREATE | `apps/web/src/components/Drawer/DocumentsTab.jsx` (placeholder)    |
| CREATE | `apps/web/src/components/Drawer/AICapabilityTab.jsx` (placeholder) |
| CREATE | `apps/web/src/components/Drawer/SettingsTab.jsx` (placeholder)     |
| CREATE | `apps/web/src/styles/drawer.css`                                   |
| MODIFY | `apps/web/src/App.jsx`                                             |
| MODIFY | `apps/web/src/components/Layout/MainLayout.jsx`                    |
| MODIFY | `apps/web/src/components/Chat/ChatHeader.jsx`                      |
| MODIFY | `apps/web/src/styles/variables.css`                                |
| MODIFY | `apps/web/src/styles/layout.css`                                   |

**Total files:** 7 created, 5 modified
