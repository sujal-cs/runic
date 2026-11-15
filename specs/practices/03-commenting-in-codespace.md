## Code Commenting Guidelines

Maintain a consistent, intentional, and professional commenting style across the codebase. Comments should provide meaningful context about the application's architecture, design decisions, business logic, and non-obvious implementation details.

### 1. Where to Add Comments

Do not apply commenting guidelines indiscriminately to every file.

Prioritize files that implement or support the application's core functionality, such as:
- Core business logic and application services.
- Important React components and feature modules.
- API routes, controllers, middleware, and data-processing logic.
- Authentication, authorization, and security mechanisms.
- Database models, schemas, and important queries.
- Configuration files that define application-wide behavior.
- Design systems, theme tokens, and global styling.
- Build scripts, deployment configuration, and infrastructure-related code.

Avoid unnecessary comments in trivial components, simple utility functions, boilerplate, generated files, static assets, and other code that is already self-explanatory.

### 2. Commenting Style

Write comments that explain **why something exists, what purpose it serves, and how it relates to the broader application**.

- Prefer meaningful context over descriptions of individual statements.
- Explain architectural decisions, design constraints, dependencies, and important assumptions.
- Document relationships between related variables, functions, components, or configuration values when they are not immediately obvious.
- For CSS and design tokens, explain their intended usage, relationships, theme behavior, and design rationale.
- For complex logic, explain the reasoning behind the approach rather than documenting every implementation step.
- Comments can span multiple lines when the additional context genuinely helps.
- Keep the writing natural, concise, and technically accurate.

### 3. Examples of Expected Comments

**A. Design tokens and global styles**

```css
/*
  NEUTRALS - a consistent surface hierarchy across themes.

  background  - base application canvas
  primary     - raised surfaces such as cards and inputs
  muted       - subtle fills for hover states and secondary surfaces
  border      - visible separation between adjacent surfaces

  TEXT - use predefined opaque text tiers instead of arbitrary opacity
  values, ensuring consistent contrast across different backgrounds.

  ACCENTS - brand is decorative; semantic colors communicate status.
  success | warning | danger | info
*/
```

**B. Build scripts and architectural decisions**

```js
// Generates static HTML for marketing pages after the production build,
// allowing crawlers to access page content without executing the React app.
```

**C. Performance considerations**

```js
// The hero artwork is loaded as a CSS background, so the browser discovers
// it only after downloading the stylesheet. Preload it to prioritize the
// largest above-the-fold asset.
```

**D. Important business logic**

```js
// Reuse an existing analysis request for the same repository to avoid
// duplicate GitHub API calls when multiple components request it.
```

These examples illustrate the expected level of context. Comments should explain meaningful decisions, relationships, constraints, and consequences rather than simply narrating the code.

### 4. What to Avoid

- Obvious comments that repeat what the code already communicates.
- Comments on every function, variable, statement, or CSS property.
- Generic descriptions such as "This function handles authentication."
- Excessive JSDoc blocks or lengthy documentation for straightforward code.
- Artificial section dividers and rigid comment structures.
- Comments added solely to make files appear documented.
- Repeating the same architectural explanation across multiple files.
- Outdated comments that no longer reflect the implementation.

### 5. Consistency and Maintenance

- Follow the appropriate comment syntax and conventions for each language.
- Preserve existing useful comments.
- Update or remove comments when modifying the associated implementation.
- Keep comments close to the code they explain.
- Avoid duplicating documentation that already exists in a dedicated README or architecture document.
- Do not introduce comments into generated or third-party code.

### Final Expectation

Treat comments as lightweight technical documentation embedded within the codebase.

Focus on important files that carry the application's core features and architecture, rather than trying to achieve uniform comment coverage across every file.

The ideal comment should help another developer understand a design decision, architectural relationship, implementation constraint, or non-obvious behavior without having to investigate the entire codebase.

**Prioritize meaningful context over comment quantity. Write comments only when they genuinely improve understanding or maintainability.**