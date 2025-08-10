import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Paper, Typography, Tooltip, IconButton, Fade, Box } from '@mui/material';
import { Map as MapIcon, Close as CloseIcon } from '@mui/icons-material';
import { ReactFlowInstance, Node, Edge, Viewport } from 'reactflow';
import { Schema } from '../types';

interface MinimapProps {
  reactFlowInstance: ReactFlowInstance | null;
  schema: Schema;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: { width: number; height: number };
  showViewport?: boolean;
  onNavigate?: (position: { x: number; y: number }) => void;
}

const Minimap: React.FC<MinimapProps> = ({
  reactFlowInstance,
  schema,
  position = 'bottom-right',
  size = { width: 200, height: 150 },
  showViewport = true,
  onNavigate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate schema bounds
  const calculateBounds = useCallback((nodeList: Node[]) => {
    if (nodeList.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodeList.forEach(node => {
      const nodeWidth = node.width || 200;
      const nodeHeight = node.height || 100;
      
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // Add padding
    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  }, []);

  // Update nodes and edges from ReactFlow instance
  useEffect(() => {
    if (reactFlowInstance) {
      const currentNodes = reactFlowInstance.getNodes();
      const currentEdges = reactFlowInstance.getEdges();
      const currentViewport = reactFlowInstance.getViewport();
      
      setNodes(currentNodes);
      setEdges(currentEdges);
      setViewport(currentViewport);
      setBounds(calculateBounds(currentNodes));
    }
  }, [reactFlowInstance, schema, calculateBounds]);

  // Listen to viewport changes using polling approach
  useEffect(() => {
    if (!reactFlowInstance) return;

    const updateViewport = () => {
      const currentViewport = reactFlowInstance.getViewport();
      setViewport(currentViewport);
    };

    // Update viewport periodically
    const interval = setInterval(updateViewport, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, [reactFlowInstance]);

  // Draw minimap on canvas with proper visual styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { minX, minY, maxX, maxY } = bounds;
    const schemaWidth = maxX - minX;
    const schemaHeight = maxY - minY;

    // Calculate scale to fit schema in minimap
    const scaleX = size.width / schemaWidth;
    const scaleY = size.height / schemaHeight;
    const scale = Math.min(scaleX, scaleY);

    // Transform coordinates from schema space to minimap space
    const transformX = (x: number) => ((x - minX) * scale);
    const transformY = (y: number) => ((y - minY) * scale);

    // Draw edges first (behind nodes) with proper styling
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = Math.max(0.5, scale * 2);
    ctx.lineCap = 'round';
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceX = transformX(sourceNode.position.x + (sourceNode.width || 280) / 2);
        const sourceY = transformY(sourceNode.position.y + (sourceNode.height || 100) / 2);
        const targetX = transformX(targetNode.position.x + (targetNode.width || 280) / 2);
        const targetY = transformY(targetNode.position.y + (targetNode.height || 100) / 2);

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Draw connection points
        ctx.fillStyle = '#718096';
        const pointSize = Math.max(1, scale * 3);
        ctx.beginPath();
        ctx.arc(sourceX, sourceY, pointSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(targetX, targetY, pointSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw nodes with proper table styling
    nodes.forEach(node => {
      const x = transformX(node.position.x);
      const y = transformY(node.position.y);
      const width = (node.width || 280) * scale;
      const height = (node.height || 100) * scale;
      const cornerRadius = Math.max(1, scale * 6);

      // Check if this node is highlighted
      const isHighlighted = node.data?.isHighlighted;

      // Draw rounded rectangle background (table body)
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, cornerRadius);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isHighlighted ? '#4285f4' : '#3a3a3a';
      ctx.lineWidth = Math.max(0.5, scale * 1);
      ctx.stroke();

      // Draw table header
      const headerHeight = Math.max(2, height * 0.25);
      ctx.fillStyle = '#404040';
      ctx.beginPath();
      ctx.roundRect(x, y, width, headerHeight, [cornerRadius, cornerRadius, 0, 0]);
      ctx.fill();

      // Draw table name if scale is large enough
      if (scale > 0.1 && node.data?.table?.name) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(8, scale * 12)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textX = x + width / 2;
        const textY = y + headerHeight / 2;
        const maxWidth = width - 4;
        
        // Truncate text if too long
        let tableName = node.data.table.name;
        const textWidth = ctx.measureText(tableName).width;
        if (textWidth > maxWidth) {
          while (ctx.measureText(tableName + '...').width > maxWidth && tableName.length > 1) {
            tableName = tableName.slice(0, -1);
          }
          tableName += '...';
        }
        
        ctx.fillText(tableName, textX, textY);
      }

      // Draw column indicators if scale allows
      if (scale > 0.05 && node.data?.table?.columns) {
        const columns = node.data.table.columns;
        const columnAreaY = y + headerHeight + 2;
        const columnAreaHeight = height - headerHeight - 4;
        const columnHeight = Math.max(1, columnAreaHeight / Math.max(columns.length, 1));
        
        columns.slice(0, Math.floor(columnAreaHeight / Math.max(columnHeight, 1))).forEach((column: any, index: number) => {
          const colY = columnAreaY + index * columnHeight;
          const colHeight = Math.min(columnHeight - 1, columnAreaHeight - index * columnHeight);
          
          if (colHeight > 0) {
            // Column background
            ctx.fillStyle = column.isPrimary ? '#ffd700' : column.isForeign ? '#ff6b6b' : '#4a5568';
            ctx.fillRect(x + 2, colY, Math.max(1, width - 4), colHeight);
          }
        });
      }

      // Add glow effect for highlighted tables
      if (isHighlighted) {
        ctx.shadowColor = '#4285f4';
        ctx.shadowBlur = Math.max(2, scale * 10);
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = Math.max(1, scale * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Viewport indicator removed - was not working properly
  }, [nodes, edges, bounds, size, viewport, showViewport, reactFlowInstance]);

  // Handle click navigation
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!reactFlowInstance || !onNavigate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const { minX, minY, maxX, maxY } = bounds;
    const schemaWidth = maxX - minX;
    const schemaHeight = maxY - minY;
    const scaleX = size.width / schemaWidth;
    const scaleY = size.height / schemaHeight;
    const scale = Math.min(scaleX, scaleY);

    // Transform click coordinates back to schema space
    const schemaX = (clickX / scale) + minX;
    const schemaY = (clickY / scale) + minY;

    // Center the viewport on the clicked position
    reactFlowInstance.setCenter(schemaX, schemaY, { zoom: viewport.zoom, duration: 800 });
    
    if (onNavigate) {
      onNavigate({ x: schemaX, y: schemaY });
    }
  }, [reactFlowInstance, bounds, size, viewport.zoom, onNavigate]);

  // Position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 16, left: 16 };
      case 'top-right':
        return { ...baseStyles, top: 16, right: 16 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...baseStyles, bottom: 16, right: 16 };
    }
  };

  if (!reactFlowInstance || nodes.length === 0) {
    return null;
  }

  // Minimized state - just a corner button
  if (!isExpanded) {
    return (
      <Tooltip title="Show schema minimap" placement="left">
        <Paper
          elevation={2}
          sx={{
            ...getPositionStyles(),
            p: 0.5,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            cursor: 'pointer',
            minWidth: 'auto',
            '&:hover': {
              elevation: 4,
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => setIsExpanded(true)}
        >
          <IconButton 
            size="small" 
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <MapIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Tooltip>
    );
  }

  // Expanded state - full minimap
  return (
    <Fade in={isExpanded} timeout={300}>
      <Paper
        elevation={4}
        sx={{
          ...getPositionStyles(),
          p: 1,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          '&:hover': {
            elevation: 6,
          },
        }}
      >
        {/* Header with title and close button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            Schema Overview
          </Typography>
          <Tooltip title="Minimize minimap" placement="left">
            <IconButton 
              size="small" 
              onClick={() => setIsExpanded(false)}
              sx={{ 
                color: 'text.secondary',
                ml: 1,
                '&:hover': { color: 'primary.main' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Canvas */}
        <Tooltip title="Click to navigate to any part of the schema" placement="left">
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            onClick={handleCanvasClick}
            style={{
              display: 'block',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              backgroundColor: '#1a1a1a',
              cursor: 'pointer',
            }}
          />
        </Tooltip>

        {/* Footer with stats */}
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
          {nodes.length} tables • {edges.length} relationships
        </Typography>
      </Paper>
    </Fade>
  );
};

export default Minimap;
