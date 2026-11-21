# Runic Frontend

The frontend is a React, TypeScript, Vite, and Tailwind CSS application. Route
components compose shared UI primitives and feature-specific components.

## Structure

- `src/pages/` contains route-level page components.
- `src/components/ui/` contains reusable controls, cards, badges, and tables.
- `src/components/<feature>/` contains feature-specific pieces for auth, landing,
  problems, the coding workspace, and profiles.
- `src/context/` contains shared authentication and theme state.
- `src/lib/` contains the API client and small utilities.
- `src/styles/theme.css` defines design tokens and base styles. Rich problem
  descriptions have scoped styles in `src/styles/problem-content.css`.

## Development

Run `npm run dev -w frontend` from the repository root. Vite listens on
`0.0.0.0:5173` and proxies `/api` requests to the backend on port `4000`, so
another device on the same network can open `http://<your-computer-ipv4>:5173`.

Run `npm run build -w frontend` to type-check and create a production build.
