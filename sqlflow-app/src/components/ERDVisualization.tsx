import React, { useCallback, useMemo, forwardRef, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  ReactFlowInstance,
} from 'reactflow';
import { Box, Typography, Chip, Card, IconButton, Collapse } from '@mui/material';
import TableToolkitIcon from './TableToolkitIcon';
import { 
  Key as KeyIcon, 
  Link as LinkIcon,
  Storage as TableIcon,
  Code as CodeIcon,
  Numbers as NumberIcon,
  TextFields as TextIcon,
  CalendarToday as DateIcon,
  ToggleOn as BooleanIcon,
  Speed as IndexIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import 'reactflow/dist/style.css';
import { Schema, Table } from '../types';
import Legend from './Legend';
import { LayoutEngine, LayoutType } from '../utils/layoutAlgorithms';
import { calculateAllOptimalConnections } from '../utils/edgeRouting';

interface TableNodeData {
  table: Table;
  isHighlighted?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (tableName: string) => void;
  focusedTable?: string | null;
  focusMode?: 'none' | 'related' | 'trace' | 'hide';
  isDimmed?: boolean;
  showToolkit?: boolean;
  onShowRelatedOnly?: (tableName: string) => void;
  onHideTable?: (tableName: string) => void;
  onTraceRelationships?: (tableName: string) => void;
  onCopyTableName?: (tableName: string) => void;
  onShowTableInfo?: (tableName: string) => void;
}

const TableNode: React.FC<{ data: TableNodeData }> = ({ data }) => {
  const { 
    table, 
    isHighlighted, 
    isCollapsed = false, 
    onToggleCollapse,
    focusedTable,
    isDimmed = false,
    showToolkit = false,
    onShowRelatedOnly,
    onHideTable,
    onTraceRelationships,
    onCopyTableName,
    onShowTableInfo
  } = data;

  const getColumnIcon = (columnType: string) => {
    const type = columnType.toLowerCase();
    if (type.includes('int') || type.includes('number') || type.includes('decimal') || type.includes('float')) {
      return <NumberIcon sx={{ fontSize: 14, color: '#2196F3' }} />;
    }
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
      return <TextIcon sx={{ fontSize: 14, color: '#4CAF50' }} />;
    }
    if (type.includes('timestamp') || type.includes('date') || type.includes('time')) {
      return <DateIcon sx={{ fontSize: 14, color: '#FF9800' }} />;
    }
    if (type.includes('boolean') || type.includes('bool')) {
      return <BooleanIcon sx={{ fontSize: 14, color: '#9C27B0' }} />;
    }
    if (type.includes('json')) {
      return <CodeIcon sx={{ fontSize: 14, color: '#E91E63' }} />;
    }
    return <CodeIcon sx={{ fontSize: 14, color: '#757575' }} />;
  };

  return (
    <>
      <Card
        sx={{
          position: 'relative', // Enable absolute positioning for toolkit icon
          minWidth: 280,
          maxWidth: 320,
          backgroundColor: '#2A2A2A',
          border: '1px solid',
          borderColor: isHighlighted ? '#4285F4' : '#3A3A3A',
          borderRadius: 1.5,
          overflow: 'hidden', // Keep rounded corners
          opacity: isDimmed ? 0.4 : 1, // Dim unfocused tables
          boxShadow: isHighlighted 
            ? '0 0 0 2px #4285F4, 0 0 20px rgba(66, 133, 244, 0.4), 0 6px 20px rgba(66, 133, 244, 0.3)' // Growing glow effect
            : isDimmed
            ? '0 1px 3px rgba(0, 0, 0, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', // Much faster, smoother transition
          transform: focusedTable === table.name ? 'scale(1.02)' : 'scale(1)', // Slight scale for focused table
          '&:hover': {
            borderColor: '#4285F4',
            transform: focusedTable === table.name ? 'scale(1.02) translateY(-1px)' : 'translateY(-1px)',
            boxShadow: '0 4px 16px rgba(66, 133, 244, 0.2)',
            opacity: 1, // Remove dimming on hover
          },
        }}
      >
      {/* Multi-directional handles for better connectivity */}
      <Handle 
        id={`${table.name}-target-top`}
        type="target" 
        position={Position.Top}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-target-left`}
        type="target" 
        position={Position.Left}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-target-right`}
        type="target" 
        position={Position.Right}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-target-bottom`}
        type="target" 
        position={Position.Bottom}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      
      {/* Table Header */}
      <Box
        sx={{
          backgroundColor: '#353535',
          borderBottom: '2px solid #4285F4',
          color: 'white',
          px: 2,
          py: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TableIcon sx={{ fontSize: 18, color: '#4285F4' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}>
            {typeof table.name === 'string' ? table.name : String(table.name || '')}
          </Typography>
          {focusedTable === table.name && (
            <Chip
              label="FOCUSED"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 600,
                backgroundColor: '#4285F4',
                color: 'white',
                '& .MuiChip-label': { px: 0.6 },
              }}
            />
          )}
        </Box>
        
        {/* Collapse/Expand Button */}
        {onToggleCollapse && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(table.name);
            }}
            sx={{
              color: '#4285F4',
              '&:hover': {
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
              },
            }}
          >
            {isCollapsed ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ExpandLessIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Table Columns - Collapsible */}
      <Collapse in={!isCollapsed} timeout={300}>
        <Box sx={{ p: 0 }}>
          {table.columns.map((column, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.8,
                px: 1.5,
                borderBottom: index < table.columns.length - 1 ? '1px solid #3A3A3A' : 'none',
                backgroundColor: column.isPrimary 
                  ? 'rgba(255, 193, 7, 0.1)' 
                  : column.isForeign 
                  ? 'rgba(33, 150, 243, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(66, 133, 244, 0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1 }}>
                {/* Column Type Icon */}
                {getColumnIcon(typeof column.type === 'string' ? column.type : String(column.type || ''))}
                
                {/* Key Icon */}
                {column.isPrimary && (
                  <KeyIcon sx={{ fontSize: 14, color: '#FFC107' }} />
                )}
                {column.isForeign && !column.isPrimary && (
                  <LinkIcon sx={{ fontSize: 14, color: '#2196F3' }} />
                )}
                
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: column.isPrimary ? 600 : 500,
                      color: column.isPrimary ? '#FFC107' : column.isForeign ? '#2196F3' : '#FFFFFF',
                      fontSize: '0.85rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {typeof column.name === 'string' ? column.name : String(column.name || '')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#A0A0A0',
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {typeof column.type === 'string' ? column.type : String(column.type || '')}
                    {!column.nullable && ' NOT NULL'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {column.isPrimary && (
                  <Chip
                    label="PK"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      backgroundColor: '#FFC107',
                      color: '#333',
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                  />
                )}
                {column.isForeign && !column.isPrimary && (
                  <Chip
                    label="FK"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      backgroundColor: '#2196F3',
                      color: 'white',
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Primary Key Summary Section - Collapsible */}
      {table.primaryKeys && table.primaryKeys.length > 0 && (
        <Collapse in={!isCollapsed} timeout={300}>
          <Box
            sx={{
              backgroundColor: '#1F1F1F',
              borderTop: '1px solid #3A3A3A',
              px: 1.5,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon sx={{ fontSize: 14, color: '#FFC107' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#A0A0A0',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  PRIMARY KEY
                </Typography>
              </Box>
              <Chip
                label={table.primaryKeys.length > 1 ? 'Composite PK' : 'PK'}
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  backgroundColor: '#FFC107',
                  color: '#333',
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: '#FFC107',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                mt: 0.5,
                display: 'block',
              }}
            >
              ({table.primaryKeys.join(', ')})
            </Typography>
          </Box>
        </Collapse>
      )}

      {/* Relationships Section - Collapsible */}
      {table.foreignKeys && table.foreignKeys.length > 0 && (
        <Collapse in={!isCollapsed} timeout={300}>
          <Box
            sx={{
              backgroundColor: '#1F1F1F',
              borderTop: '1px solid #3A3A3A',
              px: 1.5,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon sx={{ fontSize: 14, color: '#2196F3' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#A0A0A0',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  RELATIONSHIPS
                </Typography>
              </Box>
              <Chip
                label={`${table.foreignKeys.length}`}
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  backgroundColor: '#2196F3',
                  color: '#FFFFFF',
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            </Box>
            <Box sx={{ mt: 0.5 }}>
              {table.foreignKeys.slice(0, 2).map((fk, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: '#2196F3',
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    display: 'block',
                    mb: 0.2,
                  }}
                >
                  {fk.column} → {fk.referencedTable}
                  <span style={{ color: '#A0A0A0' }}>.{fk.referencedColumn}</span>
                </Typography>
              ))}
              {table.foreignKeys.length > 2 && (
                <Typography
                  variant="caption"
                  sx={{ color: '#7A7A7A', fontSize: '0.6rem' }}
                >
                  +{table.foreignKeys.length - 2} more...
                </Typography>
              )}
            </Box>
          </Box>
        </Collapse>
      )}

      {/* Indexes Section - Collapsible */}
      {table.indexes && table.indexes.length > 0 && (
        <Collapse in={!isCollapsed} timeout={300}>
          <Box
            sx={{
              backgroundColor: '#1F1F1F',
              borderTop: '1px solid #3A3A3A',
              px: 1.5,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IndexIcon sx={{ fontSize: 14, color: '#9C27B0' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#A0A0A0',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  INDEXES
                </Typography>
              </Box>
              <Chip
                label={`${table.indexes.length}`}
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  backgroundColor: '#9C27B0',
                  color: '#FFFFFF',
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            </Box>
            <Box sx={{ mt: 0.5 }}>
              {table.indexes.slice(0, 2).map((index, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: '#9C27B0',
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    display: 'block',
                    mb: 0.2,
                  }}
                >
                  {index.isUnique && '🔒'} {index.name}
                  <span style={{ color: '#A0A0A0' }}> ({index.columns.join(', ')})</span>
                </Typography>
              ))}
              {table.indexes.length > 2 && (
                <Typography
                  variant="caption"
                  sx={{ color: '#7A7A7A', fontSize: '0.6rem' }}
                >
                  +{table.indexes.length - 2} more...
                </Typography>
              )}
            </Box>
          </Box>
        </Collapse>
      )}

      {/* Multi-directional source handles */}
      <Handle 
        id={`${table.name}-source-top`}
        type="source" 
        position={Position.Top}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-source-left`}
        type="source" 
        position={Position.Left}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-source-right`}
        type="source" 
        position={Position.Right}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle 
        id={`${table.name}-source-bottom`}
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#4285F4',
          width: 6,
          height: 6,
          border: 'none',
          borderRadius: '50%',
        }}
      />
      </Card>
      
      {/* Table Toolkit Icon - Outside the card */}
      {showToolkit && onShowRelatedOnly && onHideTable && onTraceRelationships && onCopyTableName && onShowTableInfo && (
        <TableToolkitIcon
          tableName={table.name}
          isVisible={showToolkit}
          onShowRelatedOnly={onShowRelatedOnly}
          onHideTable={onHideTable}
          onTraceRelationships={onTraceRelationships}
          onCopyTableName={onCopyTableName}
          onShowTableInfo={onShowTableInfo}
        />
      )}
    </>
  );
};

// Move nodeTypes outside component to prevent recreation on every render
const nodeTypes = {
  tableNode: TableNode,
};

interface ERDVisualizationProps {
  schema: Schema;
  onTableClick?: (tableName: string) => void;
  onTableDoubleClick?: (tableName: string, event?: { clientX: number; clientY: number }) => void;
  reactFlowInstance?: ReactFlowInstance | null;
  onInit?: (instance: ReactFlowInstance) => void;
  showLegend?: boolean;
  highlightedTable?: string | null;
  focusedTable?: string | null;
  focusMode?: 'none' | 'related' | 'trace' | 'hide';
  hiddenTables?: Set<string>;
  highlightedRelationships?: string[];
  onShowRelatedOnly?: (tableName: string) => void;
  onHideTable?: (tableName: string) => void;
  onTraceRelationships?: (tableName: string) => void;
  onCopyTableName?: (tableName: string) => void;
  onShowTableInfo?: (tableName: string) => void;
  onResetFocus?: () => void;
  currentLayout?: LayoutType;
  spacing?: number;
  onLayoutChange?: (layout: LayoutType) => void;
  onSpacingChange?: (spacing: number) => void;
  onDistributeEvenly?: () => void;
  onResolveOverlaps?: () => void;
}

const ERDVisualization = forwardRef<ReactFlowInstance, ERDVisualizationProps>(({
  schema,
  onTableClick,
  onTableDoubleClick,
  onInit,
  showLegend = true,
  highlightedTable,
  focusedTable,
  focusMode = 'none',
  hiddenTables = new Set(),
  highlightedRelationships = [],
  onShowRelatedOnly,
  onHideTable,
  onTraceRelationships,
  onCopyTableName,
  onShowTableInfo,
  onResetFocus,
  currentLayout = 'hierarchical',
  spacing = 450,
  onLayoutChange,
  onSpacingChange,
  onDistributeEvenly,
  onResolveOverlaps,
}, ref) => {
  // State for collapsed tables
  const [collapsedTables, setCollapsedTables] = useState<Set<string>>(new Set());

  // Handle table collapse/expand
  const handleToggleCollapse = useCallback((tableName: string) => {
    setCollapsedTables((prev: Set<string>) => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(tableName)) {
        newCollapsed.delete(tableName);
      } else {
        newCollapsed.add(tableName);
      }
      return newCollapsed;
    });
  }, []);

  // Layout engine for advanced positioning
  const layoutEngine = useMemo(() => 
    new LayoutEngine(schema, { spacing, padding: 100 }), 
    [schema, spacing]
  );

  // Separate base nodes (heavy computation) from focus-dependent data (light computation)
  const baseNodes = useMemo(() => {
    const filteredTables = schema.tables.filter(table => !hiddenTables.has(table.name));
    if (filteredTables.length === 0) return [];

    // Use the layout engine to calculate positions
    const positions = layoutEngine.applyLayout(currentLayout, filteredTables);

    return filteredTables.map(table => ({
      id: table.name,
      type: 'tableNode',
      position: positions.get(table.name) || { x: 0, y: 0 },
      table, // Store table data separately
    }));
  }, [schema.tables, hiddenTables, currentLayout, layoutEngine]); // Depend on layout and spacing

  // Light computation: add focus-dependent data to base nodes
  const initialNodes: Node[] = useMemo(() => {
    return baseNodes.map(baseNode => {
      const table = baseNode.table;
      
      // Fast dimming calculation
      let isDimmed = false;
      if (focusMode === 'related' && focusedTable && table.name !== focusedTable) {
        isDimmed = !schema.relationships.some(rel => 
          (rel.from === focusedTable && rel.to === table.name) ||
          (rel.to === focusedTable && rel.from === table.name)
        );
      }
      
      return {
        ...baseNode,
        data: {
          table,
          isHighlighted: highlightedTable === table.name,
          isCollapsed: collapsedTables.has(table.name),
          onToggleCollapse: handleToggleCollapse,
          focusedTable,
          focusMode,
          isDimmed,
          showToolkit: focusedTable === table.name,
          onShowRelatedOnly,
          onHideTable,
          onTraceRelationships,
          onCopyTableName,
          onShowTableInfo
        },
      };
    });
  }, [baseNodes, highlightedTable, collapsedTables, handleToggleCollapse, focusedTable, focusMode, schema.relationships, onShowRelatedOnly, onHideTable, onTraceRelationships, onCopyTableName, onShowTableInfo]);

  const initialEdges: Edge[] = useMemo(() => {
    const filteredRelationships = schema.relationships.filter(rel => 
      !hiddenTables.has(rel.from) && !hiddenTables.has(rel.to)
    );
    
    // Calculate optimal connection points using initialNodes (which have the correct structure)
    const optimalConnections = calculateAllOptimalConnections(initialNodes, filteredRelationships);
    
    return filteredRelationships.map((rel, index) => {
      const edgeId = `${rel.from}-${rel.to}-${index}`;
      const isHighlighted = highlightedRelationships.includes(edgeId);
      const connection = optimalConnections.get(edgeId);
      
      return {
        id: edgeId,
        source: rel.from,
        target: rel.to,
        sourceHandle: connection?.sourceHandle || `${rel.from}-source-bottom`,
        targetHandle: connection?.targetHandle || `${rel.to}-target-top`,
        label: `${rel.fromColumn} → ${rel.toColumn}`,
        type: 'smoothstep',
        animated: isHighlighted, // Animate highlighted relationships
        style: {
          stroke: isHighlighted ? '#4285F4' : '#66BB6A', // Blue for highlighted, green for normal
          strokeWidth: isHighlighted ? 3 : 2, // Thicker stroke for highlighted
          strokeDasharray: isHighlighted ? 'none' : '5,5', // Solid line for highlighted
          opacity: focusMode === 'related' && !isHighlighted ? 0.3 : 1, // Dim non-highlighted in focus mode
        },
        labelStyle: {
          fontSize: 11,
          fontWeight: isHighlighted ? 600 : 500,
          fill: '#FFFFFF',
        },
        labelBgStyle: {
          fill: isHighlighted ? '#4285F4' : '#1A1A1A',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 8],
        labelBgBorderRadius: 4,
      };
    });
  }, [schema.relationships, hiddenTables, highlightedRelationships, focusMode, initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when schema changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when relationships change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Track click timing for double-click detection
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      clickCountRef.current += 1;
      
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          // Single click
          if (onTableClick) {
            onTableClick(node.id);
          }
        } else if (clickCountRef.current === 2) {
          // Double click with coordinates
          if (onTableDoubleClick) {
            onTableDoubleClick(node.id, { clientX: event.clientX, clientY: event.clientY });
          }
        }
        clickCountRef.current = 0;
      }, 250); // 250ms delay to distinguish single vs double click
    },
    [onTableClick, onTableDoubleClick]
  );

  if (schema.tables.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          color: 'text.secondary',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
            No Database Schema Found
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            Upload a SQL file or paste CREATE TABLE statements to visualize your database schema
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, height: '100%', backgroundColor: 'background.default', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <Controls
          style={{
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            border: '1px solid #333333',
            borderRadius: '8px',
          }}
        />
        <Background 
          color="#333333" 
          gap={20}
          style={{ backgroundColor: '#0A0A0A' }}
        />
      </ReactFlow>
      
      {/* Legend */}
      {schema.tables.length > 0 && showLegend && <Legend />}
    </Box>
  );
});

export default ERDVisualization;