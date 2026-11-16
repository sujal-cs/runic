# Implement Docker-Based Isolated Judge Worker

I want to move code execution completely outside the Express application server and implement a dedicated, Docker-based Judge Worker.

Currently, submitted code is executed through the server-side process using `sandbox.ts` and Bubblewrap. This needs to be replaced with a properly isolated execution architecture.

## 1. Architecture

Implement the following workflow:

1. The React frontend sends a Run or Submit request to the Express API.
2. Express validates the request, creates a submission record, and pushes an execution job into a Redis-backed queue.
3. A separate Judge Worker consumes jobs from the queue.
4. The worker creates a short-lived, isolated Docker container for execution.
5. The submitted code is compiled and executed inside that container.
6. The worker evaluates the results against the appropriate test cases.
7. The execution results and final verdict are persisted in PostgreSQL.
8. The frontend receives the updated submission status and displays the results.

The Express server must never execute untrusted user code directly.

## 2. Docker Security Requirements

Treat all submitted code as completely untrusted.

Every execution must happen inside an isolated, disposable container with appropriate restrictions:

- Run as a non-root user.
- Disable network access.
- Apply CPU and memory limits.
- Enforce execution timeouts.
- Restrict process creation using PID limits.
- Drop unnecessary Linux capabilities.
- Enable no-new-privileges.
- Use a read-only root filesystem wherever practical.
- Provide only the minimum writable temporary storage required.
- Restrict output size to prevent resource exhaustion.
- Ensure containers are terminated and removed after execution, including on failures and timeouts.

Never expose the Docker socket, host filesystem, application secrets, database credentials, or other sensitive resources to untrusted execution containers.

The trusted worker may communicate with the Docker daemon, but submitted code must never have access to that interface.

## 3. Judge Worker

Implement the worker as a separate service/process, independent of Express.

It should:

- Consume execution jobs from Redis.
- Support multiple programming languages.
- Handle compilation and execution.
- Enforce execution limits.
- Evaluate actual outputs against expected results.
- Return standardized execution results and verdicts.
- Handle worker crashes, failed jobs, timeouts, and cleanup.
- Support concurrent submissions without exhausting server resources.

Keep language-specific execution configurations modular so additional languages can be introduced easily.

## 4. Integration

Integrate the new execution architecture with the existing application.

Preserve the distinction between:

- Run: Execute against user-provided or selected test cases.
- Submit: Execute against the problem's evaluation test cases, including hidden cases.

Maintain the existing API contracts and frontend experience wherever possible.

Support submission lifecycle statuses such as Pending, Processing, Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error, and Compilation Error.

Ensure submission results are persisted and can be retrieved even if the user refreshes the page or disconnects.

## 5. Existing Codebase

Before implementation, inspect the existing execution pipeline, including `sandbox.ts`, submission services, Redis configuration, database schema, and related API endpoints.

Reuse suitable existing components, but remove or replace unsafe execution paths.

Avoid maintaining two independent execution systems.

Update Docker Compose, environment configuration, development scripts, and documentation as required.

## 6. Validation

Test the implementation with:

- Correct and intentionally incorrect solutions.
- Compilation errors.
- Runtime errors.
- Infinite loops and execution timeouts.
- Excessive memory allocation.
- Attempts to access the filesystem.
- Attempts to access the network.
- Excessive process creation.
- Concurrent submissions.
- Worker failures and interrupted jobs.

Verify that execution containers are cleaned up reliably.

Do not consider the implementation complete merely because Docker successfully executes a program.

**Final objective:** Establish a secure, isolated, scalable code execution architecture using a dedicated Judge Worker and disposable Docker containers, without unnecessarily complicating the existing application architecture. The Express API must remain completely separate from untrusted code execution.