import { useState, useMemo, useCallback } from 'react';
import { Schema, Table } from '../types';
import { FilterState } from '../components/FilterPanel';

const defaultFilters: FilterState = {
  showPrimaryKeys: true,
  showForeignKeys: true,
  showIndexes: true,
  showRelationships: true,
  tableTypes: {
    coreTables: true,
    junctionTables: true,
    lookupTables: true,
  },
  dataTypes: {
    showNumbers: true,
    showStrings: true,
    showDates: true,
    showBooleans: true,
  },
};

export const useSchemaFilters = (schema: Schema) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Categorize tables based on their characteristics
  const categorizedTables = useMemo(() => {
    const coreTables: Table[] = [];
    const junctionTables: Table[] = [];
    const lookupTables: Table[] = [];

    schema.tables.forEach(table => {
      const columnCount = table.columns.length;
      const foreignKeyCount = table.columns.filter(col => col.isForeign).length;
      const hasMultipleForeignKeys = foreignKeyCount >= 2;
      const hasOnlyIdAndName = columnCount <= 3 && 
        table.columns.some(col => col.name.toLowerCase().includes('id')) &&
        table.columns.some(col => col.name.toLowerCase().includes('name'));

      // Junction tables: typically have multiple foreign keys and few columns
      if (hasMultipleForeignKeys && columnCount <= 5) {
        junctionTables.push(table);
      } 
      // Lookup tables: small tables with id/name pattern or specific naming conventions
      else if (hasOnlyIdAndName || 
               table.name.toLowerCase().includes('type') || 
               table.name.toLowerCase().includes('status') ||
               table.name.toLowerCase().includes('category') ||
               table.name.toLowerCase().includes('lookup')) {
        lookupTables.push(table);
      } 
      // Core tables: main business entities
      else {
        coreTables.push(table);
      }
    });

    return { coreTables, junctionTables, lookupTables };
  }, [schema.tables]);

  // Filter tables based on current filter state
  const filteredTables = useMemo(() => {
    let tables = schema.tables;

    // Filter by table types
    if (!filters.tableTypes.coreTables || !filters.tableTypes.junctionTables || !filters.tableTypes.lookupTables) {
      tables = tables.filter(table => {
        if (categorizedTables.coreTables.includes(table)) {
          return filters.tableTypes.coreTables;
        }
        if (categorizedTables.junctionTables.includes(table)) {
          return filters.tableTypes.junctionTables;
        }
        if (categorizedTables.lookupTables.includes(table)) {
          return filters.tableTypes.lookupTables;
        }
        return true;
      });
    }

    // Filter by data types (if any data type filter is disabled)
    if (!filters.dataTypes.showNumbers || !filters.dataTypes.showStrings || 
        !filters.dataTypes.showDates || !filters.dataTypes.showBooleans) {
      
      tables = tables.map(table => ({
        ...table,
        columns: table.columns.filter(column => {
          const type = column.type.toLowerCase();
          
          // Check if column type should be shown based on filters
          if (type.includes('int') || type.includes('number') || type.includes('decimal') || type.includes('float')) {
            return filters.dataTypes.showNumbers;
          }
          if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
            return filters.dataTypes.showStrings;
          }
          if (type.includes('timestamp') || type.includes('date') || type.includes('time')) {
            return filters.dataTypes.showDates;
          }
          if (type.includes('boolean') || type.includes('bool')) {
            return filters.dataTypes.showBooleans;
          }
          
          // Show unknown types by default
          return true;
        })
      })).filter(table => table.columns.length > 0); // Remove tables with no visible columns
    }

    // Filter columns by key types
    if (!filters.showPrimaryKeys || !filters.showForeignKeys) {
      tables = tables.map(table => ({
        ...table,
        columns: table.columns.filter(column => {
          if (column.isPrimary && !filters.showPrimaryKeys) {
            return false;
          }
          if (column.isForeign && !filters.showForeignKeys) {
            return false;
          }
          return true;
        })
      }));
    }

    return tables;
  }, [schema.tables, filters, categorizedTables]);

  // Filter relationships based on filter state
  const filteredRelationships = useMemo(() => {
    if (!filters.showRelationships) {
      return [];
    }
    return schema.relationships;
  }, [schema.relationships, filters.showRelationships]);

  // Create filtered schema
  const filteredSchema = useMemo(() => ({
    tables: filteredTables,
    relationships: filteredRelationships,
  }), [filteredTables, filteredRelationships]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Get filter statistics
  const filterStats = useMemo(() => {
    const totalTables = schema.tables.length;
    const visibleTables = filteredTables.length;
    const hiddenTables = totalTables - visibleTables;
    
    const totalRelationships = schema.relationships.length;
    const visibleRelationships = filteredRelationships.length;
    const hiddenRelationships = totalRelationships - visibleRelationships;

    return {
      tables: { total: totalTables, visible: visibleTables, hidden: hiddenTables },
      relationships: { total: totalRelationships, visible: visibleRelationships, hidden: hiddenRelationships },
    };
  }, [schema, filteredTables, filteredRelationships]);

  return {
    filters,
    filteredSchema,
    categorizedTables,
    filterStats,
    updateFilters,
    resetFilters,
  };
};

export default useSchemaFilters;
