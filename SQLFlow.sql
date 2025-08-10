# SQLFlow - React

## Overview

The SQLFlow Application allows users to upload SQL files or input SQL code, displaying the entire code in one pane and generating an interactive flow diagram (ERD) on the other. The diagram visualizes the database schema, showing tables and their relationships, similar to platforms like [Eraser.io](https://www.eraser.io).

## Features

### 1. **Upload SQL Files or Input Code**
   - Users can upload an SQL file or paste SQL code directly into the app.
   
### 2. **SQL Code Display (Right Pane)**
   - Display the full SQL code in a scrollable text box on the right pane.
   - Maintain the formatting of the uploaded or inputted SQL code for easy readability.
   
### 3. **Flow Diagram / ERD Visualization (Left Pane)**
   - Generate a comprehensive **Entity Relationship Diagram (ERD)** showing the relationships between tables.
   - Tables will be represented as nodes, with lines connecting them to indicate foreign key relationships.
   - The diagram should be interactive and allow users to explore tables and their linkages dynamically.

### 4. **Interactive Design**
   - Users can click on tables in the ERD to see more details or highlight specific relationships.
   - Dynamic layout adjustments for the diagram based on the uploaded SQL code.

## Technical Requirements

- **Frontend Framework**: React
- **Diagram Library**: Consider using libraries like [React Flow](https://reactflow.dev/) or [D3.js](https://d3js.org/) for flow diagram rendering.
- **File Parsing**: Use libraries such as [sql-parser](https://www.npmjs.com/package/sql-parser) to parse SQL code and generate table relationships.

## Conclusion

This application will provide users with a user-friendly interface to visualize complex database schemas directly from SQL code. The integration of code display and dynamic ERD creation will make database design and analysis more intuitive and accessible.
