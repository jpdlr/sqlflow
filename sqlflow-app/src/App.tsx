import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { ReactFlowInstance } from 'reactflow';

import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import TableInfoPanel from './components/TableInfoPanel';
import FilterPanel from './components/FilterPanel';
import Minimap from './components/Minimap';
import ERDVisualization from './components/ERDVisualization';
import { SQLParser } from './utils/sqlParser';
import { Schema } from './types';
import { eraserTheme } from './theme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSchemaFilters } from './hooks/useSchemaFilters';
import { LayoutEngine, LayoutType } from './utils/layoutAlgorithms';

interface SearchResult {
  type: 'table' | 'column';
  tableName: string;
  columnName?: string;
  match: string;
}

function App() {
  const [sqlCode, setSqlCode] = useState<string>('');
  const [highlightedTable, setHighlightedTable] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [tableInfoOpen, setTableInfoOpen] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });
  
  // Focus system state
  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<'none' | 'related' | 'trace' | 'hide'>('none');
  const [hiddenTables, setHiddenTables] = useState<Set<string>>(new Set());
  const [highlightedRelationships, setHighlightedRelationships] = useState<string[]>([]);
  
  // Layout system state
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('hierarchical');
  const [spacing, setSpacing] = useState(450);
  
  // Toolkit state (now handled by TableNode component)
  
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const sqlParser = useMemo(() => new SQLParser(), []);

  const schema: Schema = useMemo(() => {
    if (!sqlCode.trim()) {
      return { tables: [], relationships: [] };
    }
    try {
      return sqlParser.parseSQL(sqlCode);
    } catch (error) {
      console.error('SQL parsing error:', error);
      return { tables: [], relationships: [] };
    }
  }, [sqlCode, sqlParser]);

  // Initialize schema filters
  const {
    filters,
    filteredSchema,
    categorizedTables,
    filterStats,
    updateFilters,
    resetFilters,
  } = useSchemaFilters(schema);

  const handleSQLChange = useCallback((newSQL: string) => {
    setSqlCode(newSQL);
    setHighlightedTable(null);
  }, []);

  const handleTableClick = useCallback((tableName: string) => {
    if (focusedTable === tableName) {
      // If already focused, exit focus mode
      setFocusedTable(null);
      setFocusMode('none');
      setHighlightedRelationships([]);
      setHighlightedTable(null);
    } else {
      // Immediate state updates - React 18 will batch these automatically
      setFocusedTable(tableName);
      setHighlightedTable(tableName);
      setFocusMode('related');
      
      // Find relationships immediately (this is fast for most schemas)
      const relatedRelationships: string[] = [];
      schema.relationships.forEach((rel, index) => {
        if (rel.from === tableName || rel.to === tableName) {
          relatedRelationships.push(`${rel.from}-${rel.to}-${index}`);
        }
      });
      
      setHighlightedRelationships(relatedRelationships);
    }
  }, [focusedTable, schema.relationships]);

  const handleTableDoubleClick = useCallback((tableName: string) => {
    // Double-click can be used for other actions or do nothing
    console.log('Double-clicked table:', tableName);
  }, []);

  const handleShowRelatedOnly = useCallback((tableName: string) => {
    const relatedTables = new Set<string>();
    relatedTables.add(tableName); // Include the focused table itself
    
    schema.relationships.forEach(rel => {
      if (rel.from === tableName || rel.to === tableName) {
        relatedTables.add(rel.from);
        relatedTables.add(rel.to);
      }
    });
    
    // Hide all tables except related ones
    const tablesToHide = new Set<string>();
    schema.tables.forEach(table => {
      if (!relatedTables.has(table.name)) {
        tablesToHide.add(table.name);
      }
    });
    
    setHiddenTables(tablesToHide);
    setFocusMode('related');
    
    // Auto fit view after showing related tables only
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2 });
    }, 100);
    
    setSnackbar({
      open: true,
      message: `Showing ${relatedTables.size} related tables, hiding ${tablesToHide.size} others`,
      severity: 'success',
    });
  }, [schema]);

  const handleHideTable = useCallback((tableName: string) => {
    setHiddenTables(prev => {
      const newHidden = new Set(prev);
      newHidden.add(tableName);
      return newHidden;
    });
    if (highlightedTable === tableName) {
      setHighlightedTable(null);
    }
    if (focusedTable === tableName) {
      setFocusedTable(null);
      setFocusMode('none');
    }
    
    setSnackbar({
      open: true,
      message: `Hidden table: ${tableName}`,
      severity: 'info',
    });
  }, [highlightedTable, focusedTable]);

  const handleTraceRelationships = useCallback((tableName: string) => {
    // Find all direct and indirect relationships
    const visited = new Set<string>();
    const toVisit = [tableName];
    const allRelatedRelationships: string[] = [];
    
    while (toVisit.length > 0) {
      const currentTable = toVisit.pop()!;
      if (visited.has(currentTable)) continue;
      visited.add(currentTable);
      
      schema.relationships.forEach((rel, index) => {
        if (rel.from === currentTable || rel.to === currentTable) {
          const relationshipId = `${rel.from}-${rel.to}-${index}`;
          if (!allRelatedRelationships.includes(relationshipId)) {
            allRelatedRelationships.push(relationshipId);
          }
          
          // Add connected tables to visit queue
          if (rel.from === currentTable && !visited.has(rel.to)) {
            toVisit.push(rel.to);
          }
          if (rel.to === currentTable && !visited.has(rel.from)) {
            toVisit.push(rel.from);
          }
        }
      });
    }
    
    setHighlightedRelationships(allRelatedRelationships);
    setFocusMode('trace');
    
    setSnackbar({
      open: true,
      message: `Tracing ${allRelatedRelationships.length} relationships from ${tableName}`,
      severity: 'info',
    });
  }, [schema.relationships]);

  const handleResetFocus = useCallback(() => {
    setFocusedTable(null);
    setFocusMode('none');
    setHiddenTables(new Set());
    setHighlightedRelationships([]);
    setHighlightedTable(null);
    
    setSnackbar({
      open: true,
      message: 'Focus mode reset - showing all tables',
      severity: 'success',
    });
  }, []);

  const handleCopyTableName = useCallback((tableName: string) => {
    navigator.clipboard.writeText(tableName);
    setSnackbar({
      open: true,
      message: `Copied "${tableName}" to clipboard`,
      severity: 'success',
    });
  }, []);

  const handleShowTableInfo = useCallback((tableName: string) => {
    setSelectedTableName(tableName);
    setTableInfoOpen(true);
    setRightSidebarOpen(false); // avoid overlapping drawers
  }, []);

  // Layout handler functions
  const handleLayoutChange = useCallback((layout: LayoutType) => {
    setCurrentLayout(layout);
    setSnackbar({
      open: true,
      message: `Layout changed to ${layout}`,
      severity: 'success',
    });
    // Auto-fit view after layout change
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2 });
    }, 100);
  }, []);

  const handleSpacingChange = useCallback((newSpacing: number) => {
    setSpacing(newSpacing);
  }, []);

  const handleDistributeEvenly = useCallback(() => {
    if (!reactFlowInstanceRef.current) return;
    
    const nodes = reactFlowInstanceRef.current.getNodes();
    const filteredTables = schema.tables.filter(table => !hiddenTables.has(table.name));
    
    const layoutEngine = new LayoutEngine(schema, { spacing, padding: 100 });
    const currentPositions = new Map(nodes.map(node => [node.id, node.position]));
    const newPositions = layoutEngine.distributeEvenly(filteredTables, currentPositions);
    
    const updatedNodes = nodes.map(node => ({
      ...node,
      position: newPositions.get(node.id) || node.position,
    }));
    
    reactFlowInstanceRef.current.setNodes(updatedNodes);
    
    setSnackbar({
      open: true,
      message: 'Tables distributed evenly',
      severity: 'success',
    });
    
    setTimeout(() => reactFlowInstanceRef.current?.fitView({ padding: 0.2 }), 100);
  }, [schema, spacing, hiddenTables]);

  const handleResolveOverlaps = useCallback(() => {
    if (!reactFlowInstanceRef.current) return;
    
    const nodes = reactFlowInstanceRef.current.getNodes();
    const filteredTables = schema.tables.filter(table => !hiddenTables.has(table.name));
    
    const layoutEngine = new LayoutEngine(schema, { spacing, padding: 100 });
    const currentPositions = new Map(nodes.map(node => [node.id, node.position]));
    const newPositions = layoutEngine.resolveOverlaps(filteredTables, currentPositions);
    
    const updatedNodes = nodes.map(node => ({
      ...node,
      position: newPositions.get(node.id) || node.position,
    }));
    
    reactFlowInstanceRef.current.setNodes(updatedNodes);
    
    setSnackbar({
      open: true,
      message: 'Table overlaps resolved',
      severity: 'success',
    });
  }, [schema, spacing, hiddenTables]);


  const handleShare = useCallback(() => {
    if (sqlCode) {
      navigator.clipboard.writeText(sqlCode);
      setSnackbar({
        open: true,
        message: 'SQL code copied to clipboard!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No SQL code to share',
        severity: 'info',
      });
    }
  }, [sqlCode]);

  const handleUploadClick = useCallback(() => {
    setRightSidebarOpen(true);
  }, []);

  const handleCodeClick = useCallback(() => {
    setRightSidebarOpen(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    reactFlowInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    reactFlowInstanceRef.current?.zoomOut();
  }, []);

  const handleFitView = useCallback(() => {
    reactFlowInstanceRef.current?.fitView({ padding: 0.2 });
  }, []);

  const handleToggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  const handleReactFlowInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  const handleSearchResult = useCallback((result: SearchResult | null) => {
    setSearchResult(result);
    if (result) {
      // Highlight the table containing the search result
      setHighlightedTable(result.tableName);
      
      // Show success message
      setSnackbar({
        open: true,
        message: result.type === 'table' 
          ? `Found table: ${result.tableName}`
          : `Found column: ${result.columnName} in ${result.tableName}`,
        severity: 'success',
      });

      // Center the view on the found table
      if (reactFlowInstanceRef.current) {
        const nodes = reactFlowInstanceRef.current.getNodes();
        const targetNode = nodes.find(node => node.id === result.tableName);
        
        if (targetNode) {
          // Pan to the node with smooth animation
          reactFlowInstanceRef.current.setCenter(
            targetNode.position.x + (targetNode.width || 300) / 2,
            targetNode.position.y + (targetNode.height || 200) / 2,
            { zoom: 1.2, duration: 800 }
          );
        }
      }
    } else {
      setHighlightedTable(null);
    }
  }, []);

  const handleEscape = useCallback(() => {
    setHighlightedTable(null);
    setSearchResult(null);
  }, []);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFitView: handleFitView,
    onToggleLegend: handleToggleLegend,
    onEscape: handleEscape,
    onResetFocus: handleResetFocus,
    searchInputRef,
  });

  const handleGenerate = useCallback(() => {
    if (!sqlCode.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter SQL code first',
        severity: 'warning',
      });
      return;
    }
    
    const parsedSchema = sqlParser.parseSQL(sqlCode);
    if (parsedSchema.tables.length === 0) {
      setSnackbar({
        open: true,
        message: 'No valid CREATE TABLE statements found',
        severity: 'warning',
      });
    } else {
      setSnackbar({
        open: true,
        message: `Generated ERD with ${parsedSchema.tables.length} tables`,
        severity: 'success',
      });
      setTimeout(() => handleFitView(), 100);
    }
  }, [sqlCode, sqlParser, handleFitView]);

  const navigateToTable = useCallback((tableName: string) => {
    // Focus/highlight like clicking a table
    handleTableClick(tableName);
    // Center the view on the table
    if (reactFlowInstanceRef.current) {
      const nodes = reactFlowInstanceRef.current.getNodes();
      const targetNode = nodes.find(n => n.id === tableName);
      if (targetNode) {
        reactFlowInstanceRef.current.setCenter(
          targetNode.position.x + (targetNode.width || 300) / 2,
          targetNode.position.y + (targetNode.height || 200) / 2,
          { zoom: 1.2, duration: 600 }
        );
      }
    }
  }, [handleTableClick]);

  return (
    <ThemeProvider theme={eraserTheme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        backgroundColor: 'background.default',
      }}>
        {/* Header */}
        <Header 
          onShare={handleShare} 
          schema={schema}
          onSearchResult={handleSearchResult}
          searchInputRef={searchInputRef}
        />

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <LeftSidebar
            onUploadClick={handleUploadClick}
            onCodeClick={handleCodeClick}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onToggleLegend={handleToggleLegend}
            onToggleFilter={() => setShowFilterPanel(!showFilterPanel)}
            onResetFocus={handleResetFocus}
            showLegend={showLegend}
            showFilterPanel={showFilterPanel}
            reactFlowInstance={reactFlowInstanceRef.current}
            currentLayout={currentLayout}
            spacing={spacing}
            onLayoutChange={handleLayoutChange}
            onSpacingChange={handleSpacingChange}
            onDistributeEvenly={handleDistributeEvenly}
            onResolveOverlaps={handleResolveOverlaps}
          />

          {/* Filter Panel */}
          {showFilterPanel && (
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <FilterPanel
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                categorizedTables={categorizedTables}
                filterStats={filterStats}
              />
            </Box>
          )}

          {/* Main Canvas */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <ERDVisualization
              schema={filteredSchema}
              onTableClick={handleTableClick}
              onTableDoubleClick={handleTableDoubleClick}
              onInit={handleReactFlowInit}
              showLegend={showLegend}
              highlightedTable={highlightedTable}
              focusedTable={focusedTable}
              focusMode={focusMode}
              hiddenTables={hiddenTables}
              highlightedRelationships={highlightedRelationships}
              onShowRelatedOnly={handleShowRelatedOnly}
              onHideTable={handleHideTable}
              onTraceRelationships={handleTraceRelationships}
              onCopyTableName={handleCopyTableName}
              onShowTableInfo={handleShowTableInfo}
              onResetFocus={handleResetFocus}
              currentLayout={currentLayout}
              spacing={spacing}
              onLayoutChange={handleLayoutChange}
              onSpacingChange={handleSpacingChange}
              onDistributeEvenly={handleDistributeEvenly}
              onResolveOverlaps={handleResolveOverlaps}
            />
            
            {/* Minimap for canvas navigation */}
            <Minimap
              reactFlowInstance={reactFlowInstanceRef.current}
              schema={filteredSchema}
              position="bottom-right"
              size={{ width: 200, height: 150 }}
              showViewport={true}
              onNavigate={(position) => {
                console.log('Navigating to:', position);
              }}
            />
          </Box>

          {/* Right Sidebar - SQL Input */}
          <RightSidebar
            open={rightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
            sqlCode={sqlCode}
            onSQLChange={handleSQLChange}
            onRun={handleGenerate}
          />

          {/* Table Info Panel */}
          <TableInfoPanel
            open={tableInfoOpen}
            onClose={() => setTableInfoOpen(false)}
            table={selectedTableName ? schema.tables.find(t => t.name === selectedTableName) || null : null}
            schema={schema}
            onNavigateToTable={navigateToTable}
          />
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
