# Project Directory Structure & Organization

Maintain a clean, consistent, and scalable directory structure throughout the entire project.

Follow this preferred structure as the baseline:

```text
project/
├── public/
│   ├── img/
│   ├── audio/
│   ├── logo/
│   ├── favicon.ico
│   └── sitemap.xml
│
├── src/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── pages/
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   └── settings/
│   ├── styles/
│   └── types/
│
├── docs/
├── tests/
├── scripts/
├── database/
├── infra/
├── .github/
│
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── configuration files
```

### Guidelines

- Treat this structure as a convention, not a rigid requirement. Create directories only when they are actually needed.
- Place every file in the directory that best represents its responsibility.
- Keep reusable application code separate from feature-specific code.
- Organize components into meaningful feature-based subdirectories rather than keeping everything in one flat directory.
- Keep related functionality together and avoid unnecessary directory nesting.
- Reuse existing modules and avoid duplicate implementations.
- Keep the root directory clean and organized.
- Respect framework and tooling conventions. Keep configuration files in locations where their respective tools expect them.
- Keep generated files, build artifacts, temporary files, and coverage reports separate from application source code.
- Maintain clear boundaries between frontend, backend, infrastructure, and supporting resources when applicable.
- Preserve the existing architecture when making small changes. Do not restructure unrelated parts of the project unnecessarily.
- Introduce additional directories when the application's architecture genuinely requires them.

### Final Expectation

Maintain an intuitive project structure that is easy to navigate, understand, and extend.

The structure should evolve naturally with the application. Avoid unnecessary abstractions, redundant directories, and overengineering.

**Prioritize logical organization and consistency over rigid folder conventions.**