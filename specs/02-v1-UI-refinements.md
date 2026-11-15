# UI Improvements & Required Fixes
The overall UI implementation is decent and provides the minimum required functionality. However, there are several shortcomings that need to be addressed.
## 1. Problems to Fix — `/problems/*`
1. **Scrollbar Styling:** Both horizontal and vertical scrollbars currently look like default browser scrollbars and do not match the application's design. Customize them to match the overall UI and theme.
2. **Authentication for Run:** Unauthenticated users should be redirected to `/login` when clicking the Run button, accompanied by a notification stating "Login required for this activity".
3. **Editor Font:** Use JetBrains Mono Nerd Font in the code editor.
4. **Editor Width:** The code editor currently has insufficient width for comfortably reading and writing solutions. Increase its available space while maintaining a consistent layout and visual design across all application routes.
5. **Layout Breaking on Run:** Clicking Run currently breaks the workspace layout when an error occurs. The left problem-description panel collapses and shifts towards the far left of the viewport, becoming almost invisible. Fix this layout issue and ensure both panels retain their intended dimensions regardless of execution results, errors, or output content.
## 2. Landing Page
Implement an attractive, modern, and visually polished landing page for the platform.
You may explore the internet for suitable visual references and graphic assets where necessary. Ensure the landing page follows the application's existing design language, including its dark and light themes.
**Overall:** The existing UI meets the basic requirements, but the `/problems/*` workspace has significant usability and layout issues. Prioritize fixing these shortcomings while maintaining visual consistency throughout the application. Avoid unnecessary redesigns of already functional sections.