# React Spreadsheet Engine

**React Spreadsheet Engine** is a high-performance spreadsheet implementation built from scratch. It features a reactive calculation engine that handles formula parsing, cell dependencies, and automatic updates.

## Key Features

*   **Formula Engine**: Supports basic arithmetic (`+`, `-`, `*`, `/`) and cell references (e.g., `=A1+B2`).
*   **Dependency Tracking**: Intelligent graph-based recalculation ensures only affected cells update.
*   **Error Handling**: Detects and flags `#CIRCULAR` dependencies, division by zero (`#DIV/0!`), and syntax errors (`#ERROR`).
*   **Modern Tech Stack**: Built with React 19, TypeScript, Vite, and Tailwind CSS.
*   **Clean UI**: Responsive grid interface with optimistic updates and keyboard navigation.

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the app:
    ```bash
    npm run dev
    ```

## Live Demo (Local)

When running locally, you can use the "Load Demo" button to populate the grid with example data and formulas.
