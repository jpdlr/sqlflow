# SQLFlow - Database Schema Visualizer

A modern React-based application inspired by Eraser.io that allows users to upload SQL files or input SQL code and generates interactive Entity Relationship Diagrams (ERDs) to visualize database schemas with Material Design 3 aesthetics.

## ✨ Features

- **🌙 Modern Dark UI**: Sleek Eraser.io-inspired interface with Material Design 3
- **🔄 Multiple Input Methods**: Drag-and-drop SQL files or paste code directly in the sidebar
- **📊 Interactive ERD Canvas**: Beautiful visual representation of database tables and relationships
- **🛠️ Professional Toolbars**: Left sidebar with tools, right sidebar for SQL input (like AI Prompts)
- **🎯 Smart Templates**: Quick-start templates for common database schemas
- **🖱️ Interactive Tables**: Click tables to explore relationships with hover effects
- **📱 Responsive Design**: Fully responsive interface optimized for all devices
- **⚡ Real-time Parsing**: Instant ERD generation with advanced SQL parsing
- **🎨 Material Design 3**: Modern Google design system with custom theming
- **🚀 Performance Optimized**: Built with React Flow for smooth diagram interactions

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Usage

### 1. Input SQL Code

**Method 1: File Upload**
- Drag and drop an SQL file into the upload area
- Or click the upload area to browse and select an SQL file

**Method 2: Direct Input**
- Paste or type your SQL code directly into the text area

### 2. View the ERD

- The left pane displays an interactive Entity Relationship Diagram
- Tables are represented as nodes with their columns listed
- Relationships between tables are shown as connecting lines
- Primary keys are highlighted with a yellow "PK" indicator
- Foreign keys are highlighted with a blue "FK" indicator

### 3. Explore Relationships

- Click on any table in the ERD to highlight it
- Use the React Flow controls to zoom, pan, and navigate the diagram
- Hover over tables to see interaction effects

### 4. View SQL Code

- The right pane displays your SQL code with syntax highlighting
- The code maintains proper formatting for easy readability

## Supported SQL Features

- `CREATE TABLE` statements
- Primary key constraints
- Foreign key constraints
- Column definitions with data types
- Multi-table relationships
- Self-referencing relationships

## Example SQL

The application includes a sample SQL file (`public/sample.sql`) demonstrating an e-commerce database schema with:
- Users table
- Categories with self-referencing relationships
- Products linked to categories
- Orders and order items
- Reviews and shopping cart functionality

## 🛠️ Technologies Used

- **React 18**: Modern frontend framework with TypeScript
- **Material-UI (MUI)**: Material Design 3 component library
- **React Flow**: Advanced interactive diagram rendering
- **node-sql-parser**: Robust SQL parsing and AST generation
- **Prism.js**: Professional syntax highlighting
- **react-dropzone**: Elegant file upload functionality
- **Emotion**: CSS-in-JS styling solution
- **Inter Font**: Modern typography for better readability

## Project Structure

```
src/
├── components/
│   ├── ERDVisualization.tsx    # Interactive ERD component
│   ├── SQLDisplay.tsx          # SQL code display with highlighting
│   └── SQLInput.tsx            # File upload and text input
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   └── sqlParser.ts            # SQL parsing logic
├── App.tsx                     # Main application component
└── App.css                     # Styling and responsive design
```

## Available Scripts

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Future Enhancements

- Support for more SQL dialects
- Export ERD as image or PDF
- Database connection for direct schema import
- Advanced relationship visualization options
- Schema comparison tools
- Integration with popular databases
