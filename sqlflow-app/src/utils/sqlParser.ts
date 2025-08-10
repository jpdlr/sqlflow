import { Parser } from 'node-sql-parser';
import { Table, Column, ForeignKey, Relationship, Schema, Index } from '../types';

export class SQLParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  parseSQL(sql: string): Schema {
    try {
      // Extract indexes separately before preprocessing
      const indexes = this.extractIndexes(sql);
      
      // Preprocess PostgreSQL SQL to be more compatible
      const preprocessedSQL = this.preprocessPostgreSQL(sql);
      
      // Force regex parsing for better PostgreSQL support
      // The AST parser doesn't handle inline PRIMARY KEY and REFERENCES properly
      console.log('Forcing regex parsing for better PostgreSQL support');
      throw new Error('Forcing regex parsing for PostgreSQL schema');
    } catch (error) {
      console.error('Error parsing SQL:', error);
      console.error('Original SQL:', sql);
      console.log('Falling back to regex parsing...');
      
      // Fallback: try to extract tables using regex as last resort
      return this.fallbackRegexParsing(sql);
    }
  }

  private preprocessPostgreSQL(sql: string): string {
    // First, extract only CREATE TABLE statements and ignore everything else
    const createTableStatements = this.extractCreateTableStatements(sql);
    let processed = createTableStatements.join('\n\n');

    if (!processed.trim()) {
      // If no CREATE TABLE statements found, fall back to original processing
      processed = sql;
    }

    // Remove PostgreSQL-specific syntax that might cause issues
    processed = processed.replace(/IF NOT EXISTS/gi, '');
    processed = processed.replace(/public\./gi, '');
    
    // Convert PostgreSQL data types to more standard ones
    processed = processed.replace(/\bbigserial\b/gi, 'BIGINT AUTO_INCREMENT');
    processed = processed.replace(/\bserial\b/gi, 'INT AUTO_INCREMENT');
    processed = processed.replace(/\bTEXT\b/gi, 'VARCHAR(65535)');
    processed = processed.replace(/\bJSONB\b/gi, 'JSON');
    processed = processed.replace(/\bTIMESTAMP WITH TIME ZONE\b/gi, 'TIMESTAMP');
    processed = processed.replace(/\bTIMESTAMP WITHOUT TIME ZONE\b/gi, 'TIMESTAMP');
    
    // Keep REFERENCES syntax for foreign key detection
    // Don't comment out REFERENCES - we need them for relationship parsing
    // processed = processed.replace(/\bREFERENCES\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/gi, 
    //   '/* REFERENCES $1($2) */');

    // Clean up extra whitespace and comments
    processed = processed.replace(/--[^\r\n]*/g, '');
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, '');
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  private extractCreateTableStatements(sql: string): string[] {
    const statements: string[] = [];
    
    // More robust regex to match CREATE TABLE statements, handling multiline and complex content
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = createTableRegex.exec(sql)) !== null) {
      const fullStatement = match[0];
      // Only include complete statements (those that end with );)
      if (fullStatement.trim().endsWith(');')) {
        statements.push(fullStatement);
        console.log(`Extracted CREATE TABLE for: ${match[1]}`);
      }
    }
    
    console.log(`Found ${statements.length} complete CREATE TABLE statements`);
    return statements;
  }

  private extractIndexes(sql: string): Array<{ tableName: string; index: Index }> {
    const indexes: Array<{ tableName: string; index: Index }> = [];
    
    // Match CREATE INDEX statements
    const indexRegex = /CREATE\s+(?:(UNIQUE)\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(?:public\.)?(\w+)\s*\(\s*([^)]+)\s*\)/gi;
    let match;
    
    while ((match = indexRegex.exec(sql)) !== null) {
      const isUnique = !!match[1];
      const indexName = match[2];
      const tableName = match[3];
      const columnsStr = match[4];
      
      const columns = columnsStr.split(',').map(col => col.trim().replace(/["`']/g, ''));
      
      indexes.push({
        tableName,
        index: {
          name: indexName,
          columns,
          isUnique,
          type: 'BTREE' // Default type
        }
      });
      
      console.log(`Found index ${indexName} on table ${tableName} for columns: ${columns.join(', ')}`);
    }
    
    return indexes;
  }

  private associateIndexesWithTables(tables: Table[], indexes: Array<{ tableName: string; index: Index }>): void {
    indexes.forEach(({ tableName, index }) => {
      const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (table) {
        if (!table.indexes) {
          table.indexes = [];
        }
        table.indexes.push(index);
      }
    });
  }

  private basicSQLPreprocessing(sql: string): string {
    let processed = sql;
    
    // Very basic preprocessing - just handle the most common issues
    processed = processed.replace(/\bbigserial\b/gi, 'BIGINT');
    processed = processed.replace(/\bserial\b/gi, 'INT');
    processed = processed.replace(/IF NOT EXISTS/gi, '');
    processed = processed.replace(/public\./gi, '');
    
    return processed;
  }

  private fallbackRegexParsing(sql: string): Schema {
    const tables: Table[] = [];
    const relationships: Relationship[] = [];

    try {
      // Extract indexes before parsing tables
      const indexes = this.extractIndexes(sql);
      console.log(`Fallback parsing: Found ${indexes.length} indexes`);

      // Extract table definitions using regex
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;
      let match;

      while ((match = createTableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const tableDefinition = match[2];
        
        const table = this.parseTableDefinitionRegex(tableName, tableDefinition);
        if (table) {
          tables.push(table);
          this.extractRelationshipsRegex(table, relationships, tableDefinition);
        }
      }

      // Also parse ALTER TABLE statements that add foreign keys
      this.parseAlterTableForeignKeys(sql, tables, relationships);

      // Associate indexes with tables in fallback mode too
      this.associateIndexesWithTables(tables, indexes);
      
      console.log(`Fallback parsing complete: ${tables.length} tables, ${relationships.length} relationships`);
    } catch (error) {
      console.error('Error in fallback regex parsing:', error);
    }

    return { tables, relationships };
  }

  private parseTableDefinitionRegex(tableName: string, definition: string): Table | null {
    try {
      console.log(`\n=== Regex Parsing table: ${tableName} ===`);
      const columns: Column[] = [];
      const primaryKeys: string[] = [];
      const foreignKeys: ForeignKey[] = [];

      // Split by comma, but respect parentheses (don't split commas inside parentheses)
      const lines = this.splitByCommaRespectingParentheses(definition);
      
      for (const line of lines) {
        if ((line.includes('CONSTRAINT') && line.includes('PRIMARY KEY')) || 
            (line.match(/^\s*PRIMARY\s+KEY\s*\(/i))) {
          // Extract primary key constraint - support composite keys
          const pkMatch = line.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
          if (pkMatch) {
            // Split multiple columns and add each to primaryKeys
            const columns = pkMatch[1].split(',').map(col => col.trim().replace(/["`']/g, ''));
            primaryKeys.push(...columns);
          }
        } else if (line.includes('REFERENCES')) {
          // Extract foreign key reference - handle various patterns
          // Pattern 1: column_name TYPE REFERENCES [schema.]table(column)
          let fkMatch = line.match(/(\w+)\s+[^,]*REFERENCES\s+(?:\w+\.)?(\w+)\s*\(\s*(\w+)\s*\)/i);
          if (fkMatch) {
            foreignKeys.push({
              column: fkMatch[1],
              referencedTable: fkMatch[2],
              referencedColumn: fkMatch[3]
            });
            console.log(`Found FK: ${fkMatch[1]} -> ${fkMatch[2]}(${fkMatch[3]})`);
          } else {
            // Pattern 2: [CONSTRAINT name] FOREIGN KEY (column) REFERENCES [schema.]table(column)
            const tableLevelFkMatch = line.match(/(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s+REFERENCES\s+(?:\w+\.)?(\w+)\s*\(\s*(\w+)\s*\)/i);
            if (tableLevelFkMatch) {
              foreignKeys.push({
                column: tableLevelFkMatch[1],
                referencedTable: tableLevelFkMatch[2],
                referencedColumn: tableLevelFkMatch[3]
              });
              console.log(`Found table-level FK: ${tableLevelFkMatch[1]} -> ${tableLevelFkMatch[2]}(${tableLevelFkMatch[3]})`);
            }
          }
        } else if (!line.includes('CONSTRAINT')) {
          // Regular column definition - simpler approach that captures everything after column name
          const columnMatch = line.match(/^(\w+)\s+(.+)$/i);
          if (columnMatch) {
            const columnName = columnMatch[1];
            const rest = columnMatch[2].trim();

            // Check for constraints anywhere in the rest of the line
            const hasPrimaryKey = /PRIMARY\s+KEY/i.test(rest);
            const hasNotNull = /NOT\s+NULL/i.test(rest);
            const hasUnique = /UNIQUE/i.test(rest);

            // Extract the data type (everything before the first constraint keyword)
            let columnType = rest.replace(/\s*(PRIMARY\s+KEY|NOT\s+NULL|NULL|UNIQUE|DEFAULT\s+[^,\s]*|REFERENCES\s+\w+\s*\([^)]+\)[^,]*).*/gi, '').trim();
            
            // If no constraints were found, the whole rest is the type
            if (columnType === rest) {
              columnType = rest.replace(/\s+/g, ' ');
            }

            // Handle serial types
            if (columnType.toLowerCase().includes('bigserial')) {
              columnType = 'BIGINT';
              primaryKeys.push(columnName);
            } else if (columnType.toLowerCase().includes('serial')) {
              columnType = 'INT';
              primaryKeys.push(columnName);
            }

            // Check if this column is a primary key
            const isPrimary = hasPrimaryKey || primaryKeys.includes(columnName);
            if (isPrimary && !primaryKeys.includes(columnName)) {
              primaryKeys.push(columnName);
            }

            // Check for inline REFERENCES in the column definition
            const referencesMatch = rest.match(/REFERENCES\s+(?:\w+\.)?(\w+)\s*\(\s*(\w+)\s*\)/i);
            if (referencesMatch) {
              foreignKeys.push({
                column: columnName,
                referencedTable: referencesMatch[1],
                referencedColumn: referencesMatch[2]
              });
              console.log(`Found inline FK: ${columnName} -> ${referencesMatch[1]}(${referencesMatch[2]})`);
            }

            const isForeign = foreignKeys.some(fk => fk.column === columnName);

            console.log(`✓ Column ${columnName}: ${columnType}${isPrimary ? ' [PK]' : ''}${isForeign ? ' [FK]' : ''}`);

            columns.push({
              name: columnName,
              type: columnType,
              nullable: !hasNotNull,
              isPrimary,
              isForeign
            });
          }
        }
      }

      // Mark primary and foreign key columns
      columns.forEach(column => {
        if (primaryKeys.includes(column.name)) {
          column.isPrimary = true;
        }
        if (foreignKeys.some(fk => fk.column === column.name)) {
          column.isForeign = true;
        }
      });

      console.log(`✅ Table ${tableName}: ${columns.length} columns, PK: [${primaryKeys.join(', ')}], ${foreignKeys.length} FKs`);

      return {
        name: tableName,
        columns,
        primaryKeys,
        foreignKeys,
        indexes: [] // Will be populated by associateIndexesWithTables
      };
    } catch (error) {
      console.error('Error parsing table definition with regex:', error);
      return null;
    }
  }

  private extractRelationshipsRegex(table: Table, relationships: Relationship[], definition: string): void {
    table.foreignKeys.forEach((fk, index) => {
      const relationshipId = `${table.name}-${fk.referencedTable}-${relationships.length}`;
      const relationship = {
        id: relationshipId,
        from: table.name,
        to: fk.referencedTable,
        fromColumn: fk.column,
        toColumn: fk.referencedColumn
      };
      relationships.push(relationship);
      console.log(`🔗 ${relationship.from}.${relationship.fromColumn} -> ${relationship.to}.${relationship.toColumn}`);
    });
  }

  private processStatement(statement: any, tables: Table[], relationships: Relationship[]): void {
    if (statement.type === 'create' && statement.keyword === 'table') {
      const table = this.parseCreateTable(statement);
      if (table) {
        tables.push(table);
        this.extractRelationships(table, relationships);
      }
    }
  }

  private parseCreateTable(statement: any): Table | null {
    // This method is not used anymore since we force regex parsing
    return null;
  }

  private splitByCommaRespectingParentheses(text: string): string[] {
    const result: string[] = [];
    let current = '';
    let parenthesesCount = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '(') {
        parenthesesCount++;
      } else if (char === ')') {
        parenthesesCount--;
      } else if (char === ',' && parenthesesCount === 0) {
        // Only split on comma when we're not inside parentheses
        result.push(current.trim());
        current = '';
        continue;
      }
      
      current += char;
    }
    
    // Don't forget the last part
    if (current.trim()) {
      result.push(current.trim());
    }
    
    return result;
  }

  private extractStringValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      // Handle AST objects that might have nested values
      if (value.expr) {
        return this.extractStringValue(value.expr);
      }
      if (value.value !== undefined) {
        return String(value.value);
      }
      if (value.name) {
        return this.extractStringValue(value.name);
      }
      if (value.table) {
        return this.extractStringValue(value.table);
      }
      if (value.column) {
        return this.extractStringValue(value.column);
      }
    }
    return String(value || '');
  }

  private extractRelationships(table: Table, relationships: Relationship[]): void {
    table.foreignKeys.forEach((fk, index) => {
      const relationshipId = `${table.name}-${fk.referencedTable}-${relationships.length}`;
      relationships.push({
        id: relationshipId,
        from: table.name,
        to: fk.referencedTable,
        fromColumn: fk.column,
        toColumn: fk.referencedColumn
      });
    });
  }

  private parseAlterTableForeignKeys(sql: string, tables: Table[], relationships: Relationship[]): void {
    try {
      // Pattern 1: ALTER TABLE [schema.]table ADD CONSTRAINT name FOREIGN KEY (col[, ...]) REFERENCES [schema.]refTable(refCol[, ...]) ...;
      const alterFkRegex = /ALTER\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\w+\.)?(\w+)\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*([^\)]+)\s*\)\s+REFERENCES\s+(?:\w+\.)?(\w+)\s*\(\s*([^\)]+)\s*\)/gi;
      let match;
      while ((match = alterFkRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const fromCols = match[2].split(',').map(c => c.trim().replace(/["`']/g, ''));
        const refTable = match[3];
        const toCols = match[4].split(',').map(c => c.trim().replace(/["`']/g, ''));

        const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) continue;

        // Pair columns by index when counts match; otherwise relate each fromCol to first toCol
        const count = Math.min(fromCols.length, toCols.length);
        for (let i = 0; i < count; i++) {
          const fromColumn = fromCols[i];
          const toColumn = toCols[i];
          table.foreignKeys.push({ column: fromColumn, referencedTable: refTable, referencedColumn: toColumn });

          // Mark column as foreign in table definition when present
          const col = table.columns.find(c => c.name.toLowerCase() === fromColumn.toLowerCase());
          if (col) col.isForeign = true;

          // Add relationship edge
          const relationshipId = `${table.name}-${refTable}-${relationships.length}`;
          relationships.push({
            id: relationshipId,
            from: table.name,
            to: refTable,
            fromColumn,
            toColumn
          });
          console.log(`Found ALTER FK: ${table.name}.${fromColumn} -> ${refTable}.${toColumn}`);
        }
      }

      // Pattern 2: ALTER TABLE [schema.]table ADD FOREIGN KEY ... (without CONSTRAINT name explicitly)
      const alterFkRegex2 = /ALTER\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\w+\.)?(\w+)\s+ADD\s+FOREIGN\s+KEY\s*\(\s*([^\)]+)\s*\)\s+REFERENCES\s+(?:\w+\.)?(\w+)\s*\(\s*([^\)]+)\s*\)/gi;
      while ((match = alterFkRegex2.exec(sql)) !== null) {
        const tableName = match[1];
        const fromCols = match[2].split(',').map(c => c.trim().replace(/["`']/g, ''));
        const refTable = match[3];
        const toCols = match[4].split(',').map(c => c.trim().replace(/["`']/g, ''));

        const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) continue;

        const count = Math.min(fromCols.length, toCols.length);
        for (let i = 0; i < count; i++) {
          const fromColumn = fromCols[i];
          const toColumn = toCols[i];
          table.foreignKeys.push({ column: fromColumn, referencedTable: refTable, referencedColumn: toColumn });
          const col = table.columns.find(c => c.name.toLowerCase() === fromColumn.toLowerCase());
          if (col) col.isForeign = true;
          const relationshipId = `${table.name}-${refTable}-${relationships.length}`;
          relationships.push({ id: relationshipId, from: table.name, to: refTable, fromColumn, toColumn });
          console.log(`Found ALTER FK: ${table.name}.${fromColumn} -> ${refTable}.${toColumn}`);
        }
      }
    } catch (e) {
      console.error('Error parsing ALTER TABLE foreign keys:', e);
    }
  }
}
