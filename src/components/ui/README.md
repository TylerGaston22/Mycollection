# components/ui/

Radix UI primitives wrapped with Tailwind CSS classes. These are low-level building blocks used throughout the app's dialogs, forms, and layout. Generally not modified directly — edit the app-level components in `components/` instead.

## Primitives

| File | Radix Primitive | Purpose |
|------|----------------|---------|
| `accordion.tsx` | `@radix-ui/react-accordion` | Collapsible content sections |
| `alert-dialog.tsx` | `@radix-ui/react-alert-dialog` | Confirmation dialogs (e.g. "Delete tab?") |
| `alert.tsx` | — | Inline status/error message banner |
| `aspect-ratio.tsx` | `@radix-ui/react-aspect-ratio` | Enforces a fixed aspect ratio on child content |
| `avatar.tsx` | `@radix-ui/react-avatar` | User avatar with image and fallback initials |
| `badge.tsx` | — | Small status label (e.g. "Watched", "Want to See") |
| `breadcrumb.tsx` | — | Navigation breadcrumb trail |
| `button.tsx` | — | Styled button with variants (default, outline, ghost, destructive) |
| `calendar.tsx` | `react-day-picker` | Date picker calendar |
| `card.tsx` | — | Bordered content card with header, body, and footer slots |
| `carousel.tsx` | `embla-carousel-react` | Horizontal scrolling carousel |
| `chart.tsx` | `recharts` | Chart wrapper for data visualizations |
| `checkbox.tsx` | `@radix-ui/react-checkbox` | Accessible checkbox input |
| `collapsible.tsx` | `@radix-ui/react-collapsible` | Toggle-show/hide content block |
| `command.tsx` | `cmdk` | Command palette / search menu |
| `context-menu.tsx` | `@radix-ui/react-context-menu` | Right-click context menu (used on custom tabs) |
| `dialog.tsx` | `@radix-ui/react-dialog` | Modal dialog with overlay |
| `drawer.tsx` | `vaul` | Bottom-sheet drawer for mobile |
| `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Dropdown action menu |
| `form.tsx` | `react-hook-form` | Form field wrappers with validation and error display |
| `hover-card.tsx` | `@radix-ui/react-hover-card` | Popover shown on hover |
| `input-otp.tsx` | `input-otp` | One-time password / PIN input |
| `input.tsx` | — | Styled text input |
| `label.tsx` | `@radix-ui/react-label` | Accessible form label |
| `menubar.tsx` | `@radix-ui/react-menubar` | Horizontal application menubar |
| `navigation-menu.tsx` | `@radix-ui/react-navigation-menu` | Accessible navigation links with dropdowns |
| `pagination.tsx` | — | Page number navigation controls |
| `popover.tsx` | `@radix-ui/react-popover` | Floating popover panel |
| `progress.tsx` | `@radix-ui/react-progress` | Progress bar |
| `radio-group.tsx` | `@radix-ui/react-radio-group` | Accessible radio button group |
| `resizable.tsx` | `react-resizable-panels` | Draggable resizable panel layout |
| `scroll-area.tsx` | `@radix-ui/react-scroll-area` | Custom scrollbar container |
| `select.tsx` | `@radix-ui/react-select` | Dropdown select input |
| `separator.tsx` | `@radix-ui/react-separator` | Horizontal or vertical divider line |
| `sheet.tsx` | `@radix-ui/react-dialog` | Side-panel drawer (slides in from edge) |
| `sidebar.tsx` | — | Sidebar layout primitive used by `SidebarLayout.tsx` |
| `skeleton.tsx` | — | Loading placeholder shimmer |
| `slider.tsx` | `@radix-ui/react-slider` | Range/value slider input |
| `sonner.tsx` | `sonner` | Toast notification container |
| `switch.tsx` | `@radix-ui/react-switch` | Toggle switch input |
| `table.tsx` | — | Styled HTML table with head, body, row, and cell slots |
| `tabs.tsx` | `@radix-ui/react-tabs` | Tabbed panel navigation |
| `textarea.tsx` | — | Styled multi-line text input |
| `toggle-group.tsx` | `@radix-ui/react-toggle-group` | Group of mutually exclusive toggle buttons (used for grid/list view switcher) |
| `toggle.tsx` | `@radix-ui/react-toggle` | Single on/off toggle button |
| `tooltip.tsx` | `@radix-ui/react-tooltip` | Hover tooltip label |
