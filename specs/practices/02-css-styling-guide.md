# UI Design System & Styling

Maintain a consistent design system across the application. Use `global.css` as the central source for design tokens, theme definitions, and shared styling.

Define colors, spacing, typography, border radius, shadows, and other recurring visual values as reusable CSS variables or design tokens rather than scattering arbitrary values throughout components.

For example:

```css
:root {
  --background: ...;
  --foreground: ...;
  --surface: ...;
  --muted: ...;
  --border: ...;

  --text-primary: ...;
  --text-secondary: ...;
  --text-subtle: ...;

  --brand: ...;
  --success: ...;
  --warning: ...;
  --danger: ...;

  --radius: ...;
  --spacing: ...;
}
```

Use semantic tokens instead of hardcoding colors and dimensions repeatedly. Components should consume these tokens through CSS variables or the existing Tailwind theme mapping.

Keep light and dark themes consistent by redefining the same semantic tokens, not by maintaining two unrelated sets of styles. Ensure text contrast, surface hierarchy, borders, and semantic colors remain appropriate in both themes.

Keep `global.css` focused on the shared design foundation. Component-specific styling belongs with the relevant components, while reusable UI patterns should follow the shared tokens and conventions.

Follow the existing visual language when extending the application. New pages and components should feel like part of the same product, not independently designed sections.

Before introducing new values or patterns, check whether an existing token or utility already serves the purpose. Extend the system when necessary instead of creating duplicate or conflicting definitions.

The goal is a coherent, maintainable design system where colors, sizing, themes, and shared visual behavior are defined centrally and applied consistently throughout the application.