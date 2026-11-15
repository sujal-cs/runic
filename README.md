# CodeForge

A LeetCode-inspired online coding platform for practicing data structures and algorithms. Built with a React frontend, an Express + TypeScript backend, PostgreSQL, and Redis.

**Author:** [Sujal](https://github.com/sujal-cs/codeforge)  
**Repository:** https://github.com/sujal-cs/

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## Features

- Problem browsing with search, filters, sorting, and pagination
- Individual problem pages with descriptions, examples, and constraints
- Integrated Monaco code editor with multi-language support
- Run and Submit against real test cases
- In-house authentication with persistent sessions
- User profiles and submission history
- Dark and light themes

## Project Structure

```text
project/
├── backend/
├── frontend/
├── database/
├── specs/
├── docker-compose.yml
└── README.md
```

The `specs/` folder contains the project prompts, practices, and iteration notes used to build and refine the platform.

## Setup

1. Start infrastructure:
   ```bash
   docker compose up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```
4. Run migrations:
   ```bash
   npm run db:migrate -w backend
   ```
5. Ingest problems:
   ```bash
   npm run ingest -w backend
   ```
6. Start development servers:
   ```bash
   npm run dev
   ```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## License

This project is for educational and personal use.
EOF
echo done