# Project Summary
The **Nielsen's Heuristics Analyzer** is a web application designed to evaluate websites against Jakob Nielsen's 10 usability heuristics. It provides users with the ability to input a URL for analysis, offering visual feedback and actionable insights aimed at enhancing user experience. This tool is crucial for web developers and designers who strive to create user-friendly web applications, helping them identify usability issues and improve overall site performance.

# Project Module Description
- **Heuristics Analyzer**: Analyzes a URL against usability heuristics.
- **Score Visualization**: Displays results with visual indicators and detailed evaluations.
- **Responsive Design**: Fully responsive application adhering to modern design principles.
- **Deterministic Scoring**: Consistent scoring algorithm ensuring repeatable analysis results.
- **Detailed Explanations**: Each score includes detailed alerts, findings, and tailored recommendations.
- **Enhanced Input Handling**: Users can enter URLs without specifying the protocol; https:// is added by default if omitted.
- **Optional Email Input**: Users can submit an email to receive analysis results.
- **Email Sending Feature**: Users can send analysis results to their email with a dedicated button.
- **Improved Navigation**: Status Chips now correctly navigate to the "Fix these issues" tab and scroll to the relevant issue details.
- **Sample URL Testing Buttons**: Quick testing buttons for popular websites (Google, Amazon, Facebook, Twitter) to facilitate easy analysis.
- **Export as PDF Button**: Allows users to simulate exporting analysis results as a PDF, accompanied by a toast notification.

# Directory Tree
```plaintext
shadcn-ui/
├── README.md
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── components/
│   │   ├── HeuristicScoreCard.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       └── toggle.tsx
│   ├── data/
│   │   └── heuristics.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── index.css
│   ├── lib/
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── vite-env.d.ts
│   ├── tailwind.config.ts
│   ├── template_config.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── ...
```

# File Description Inventory
- **README.md**: Project documentation and overview.
- **index.html**: Main HTML file for the application.
- **App.tsx**: Main application component integrating routing and context providers.
- **Index.tsx**: Page component for the heuristic analysis interface, featuring centered content, updated navigation functionality, email sending capabilities, and new sample URL buttons.
- **NotFound.tsx**: Component displayed when a route is not found.
- **HeuristicScoreCard.tsx**: Component for displaying individual heuristic analysis results with enhanced descriptions.
- **heuristics.ts**: Data file containing Nielsen's heuristics and related information.
- **progress.tsx**: Component for displaying progress bars, now color-coded based on score percentage.

# Technology Stack
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Build tool for modern web applications.
- **React Router**: Library for routing in React applications.
- **TanStack Query**: For data fetching and state management.

# Usage
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Build the application:
   ```bash
   pnpm run build
   ```
3. Run the application:
   ```bash
   pnpm run start
   ```
