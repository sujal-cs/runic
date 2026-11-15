Problem Page UI and Functionality Improvements
1. Problem Page Layout

Redesign the problem-solving route to closely resemble the official LeetCode Problem-Solving Interface.

Use the reference as inspiration for the overall layout, proportions, component placement, and user experience. Adapt the implementation to the existing application's design system rather than blindly copying LeetCode's UI.

The page should consist of two primary panels:

Left Panel – Problem Description
Display the problem statement.
Display examples and their explanations.
Display constraints and other problem-related information.
Ensure sufficient space to comfortably display longer problem statements.
Right Panel – Code Editor
Display the code editor.
Provide language selection.
Include Run and Submit buttons.
Display test cases and execution results.
2. Resizable Panels

Both panels must be independently resizable using a draggable divider between them.

Requirements
Allow users to increase or decrease the width of either panel.
Make the divider visually indicate that it is draggable.
Ensure resizing feels smooth and responsive.
Implement reasonable minimum and maximum width constraints so neither panel becomes unusable.
Maintain an appropriate layout across different screen sizes.
Ensure resizing does not interfere with code editor functionality.

The resizing experience should be similar to the split-pane interface used by LeetCode.

3. Actual Test Case Execution

Currently, clicking the Run button executes only one test case. Fix this behavior.

When the user clicks Run:

Execute the submitted solution against all available sample test cases associated with the selected problem.
Evaluate each test case independently.
Compare actual output with expected output.
Display the result of every executed test case.
Clearly distinguish between passed and failed test cases.
For failed test cases, display:
Input
Expected Output
Actual Output
Display an appropriate overall execution status, such as Accepted or Wrong Answer.

Important: Do not use arbitrary or hardcoded test cases as a replacement for the actual test cases associated with the problem.

Maintain a Clear Distinction Between Run and Submit
Run: Execute the solution against all available sample test cases.
Submit: Execute the solution against the complete test suite, including hidden test cases, if supported by the existing backend infrastructure.
4. Test Case Section UI

Currently, the test case section is displayed as an editable text area. Replace it with a properly structured, read-only test case viewer.

Requirements
Users must not be able to edit test case inputs or expected outputs.
Display each test case in a clean and organized format.
Separate input and expected output clearly.
Use a readable layout that makes test cases easy to inspect.
Example Structure

Test Case 1

Input: sdaf
Expected Output: 123a

Test Case 2

Input: Actual test case input.
Expected Output: Actual expected output.

Test Case 3

Input: Actual test case input.
Expected Output: Actual expected output.

Note: These values are illustrative only. Always use the actual test cases defined for the selected problem.

5. Test Case Navigation and Results

Implement an intuitive test case navigation and results interface.

Requirements
Display individual test cases as selectable tabs or another intuitive navigation element.
Allow users to switch between test cases.
After execution, visually indicate which test cases passed or failed.
Selecting a test case should display:
Input
Expected Output
Actual Output (when available)
Display an overall execution summary, such as 3/3 Test Cases Passed.
Handle runtime errors and compilation errors with appropriate messages.
Execution Status

Clearly communicate execution results using appropriate statuses:

Accepted: All executed test cases passed.
Wrong Answer: One or more test cases failed.
Compilation Error: The submitted code could not be compiled.
Runtime Error: The code encountered an execution error.
6. Important Implementation Considerations
Preserve the existing code editor functionality.
Preserve the existing programming language selection functionality.
Ensure resizing the panels does not interfere with editor functionality.
Avoid introducing unnecessary UI elements or duplicating existing functionality.
Use the existing backend execution and test-case infrastructure wherever possible.
Ensure test cases are correctly associated with their respective problems.
Maintain compatibility with the existing application architecture.
Avoid unnecessary changes to the backend or existing application structure.
Ensure