# 01 — First Iteration: Frontend & Backend Foundation

Build the first iteration of a fully functional online coding platform inspired by LeetCode.

The objective is to create a modern, minimal, and professional coding platform where users can explore DSA problems, write code, run test cases, and submit solutions.

This is intended to become a complete platform, not just a UI clone or frontend demonstration.

## 1. Technology Stack

Mandatory technologies:

- Frontend: React
- Backend: Node.js + Express
- Language: TypeScript
- Database: PostgreSQL
- Cache: Redis
- Infrastructure: Docker

The database and authentication system must be implemented in-house. Do not depend on external authentication providers or hosted backend platforms.

You may independently choose the remaining technologies, libraries, and architectural patterns based on project requirements.

Use Docker Compose for PostgreSQL and Redis.

## 2. UI / UX Requirements

The design should be modern, minimal, clean, and developer-focused.

Use LeetCode as a reference for functionality and user experience, not as something to copy pixel by pixel.

Requirements:

- Proper dark and light themes with a theme switcher.
- Consistent design system and typography.
- Clean navigation and layouts.
- Responsive interface.
- Intuitive problem discovery and browsing.
- Professional coding workspace with an integrated code editor.
- Well-designed execution results and submission feedback.

Avoid generic dashboard designs, excessive gradients, unnecessary animations, and decorative UI elements.

Prioritize usability, visual consistency, and the coding experience.

## 3. First Iteration Scope

Focus primarily on building the frontend, along with the minimum backend required to make it functional.

Implement:

- Home / problems dashboard.
- Problem listing with search, filters, sorting, and pagination.
- Individual problem pages with descriptions, examples, constraints, and difficulty.
- Integrated code editor with language selection.
- Run and Submit functionality.
- Test case and execution result panels.
- User registration, login, and logout.
- Basic user profile and submission history.

### Problem Data

For the initial implementation, scrape approximately 25–30 problems directly from LeetCode.

Capture the necessary problem information, including descriptions, difficulty, examples, constraints, and relevant metadata.

Store the collected problem data in PostgreSQL and make it accessible through the backend APIs.

Create a reusable ingestion process so additional problems can be imported later without manually modifying the database.

## 4. Backend & Architecture

Build a proper backend foundation that will support the eventual complete platform.

Implement the necessary database schema, API endpoints, authentication, validation, and business logic required by the first iteration.

Authentication should include registration, login, logout, password hashing, and persistent sessions.

Email verification, OTP, and other account verification mechanisms are not required yet. They can be introduced later.

Use Redis for appropriate infrastructure requirements.

Code execution must be designed with security and isolation in mind. Never execute arbitrary user code directly inside the Express server process. Keep the execution engine modular so it can evolve into a dedicated judge service.

The backend should be extensible for future features without unnecessarily implementing them now.

## 5. Implementation Approach

Work incrementally rather than generating the entire application at once.

First inspect the existing repository and establish the project architecture.

Then implement the foundation, backend, frontend, and their integration in logical stages.

Make reasonable technical decisions independently. Do not ask for approval for every minor decision or unnecessarily overcomplicate the implementation.

Test actual functionality instead of considering a feature complete merely because its UI has been created.

## 6. Expected Outcome

At the end of this iteration, I expect a working application with:

- A polished React frontend.
- Functional dark and light themes.
- A working Express backend.
- PostgreSQL and Redis running through Docker.
- In-house authentication.
- An initial collection of 25–30 LeetCode problems.
- Functional problem browsing and individual problem pages.
- An integrated code editor.
- A working submission workflow to the extent supported by the implemented execution engine.

Keep the architecture clean, scalable, and maintainable.

**Build a solid foundation for a complete LeetCode-like platform. Focus on delivering a genuinely functional first iteration rather than implementing every future feature or overengineering the initial version.**