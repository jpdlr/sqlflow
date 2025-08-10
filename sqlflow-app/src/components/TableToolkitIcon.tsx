import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Visibility as ShowRelatedIcon,
  VisibilityOff as HideIcon,
  AccountTree as TraceIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface TableToolkitIconProps {
  tableName: string;
  isVisible: boolean;
  onShowRelatedOnly: (tableName: string) => void;
  onHideTable: (tableName: string) => void;
  onTraceRelationships: (tableName: string) => void;
  onCopyTableName: (tableName: string) => void;
  onShowTableInfo: (tableName: string) => void;
}

const TableToolkitIcon: React.FC<TableToolkitIconProps> = ({
  tableName,
  isVisible,
  onShowRelatedOnly,
  onHideTable,
  onTraceRelationships,
  onCopyTableName,
  onShowTableInfo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand immediately when visible for instant response
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsExpanded(true), 50); // Much faster
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Calculate circular positions around the center button
  const radius = 45; // Slightly smaller radius
  const startAngle = -135;
  const actions = [
    {
      icon: <ShowRelatedIcon fontSize="small" />,
      label: 'Show Related Only',
      angle: startAngle, // Top
      onClick: () => {
        onShowRelatedOnly(tableName);
        handleClose();
      },
    },
    {
      icon: <TraceIcon fontSize="small" />,
      label: 'Trace Relationships', 
      angle: startAngle + 45, // Top-right
      onClick: () => {
        onTraceRelationships(tableName);
        handleClose();
      },
    },
    {
      icon: <InfoIcon fontSize="small" />,
      label: 'Table Info',
      angle: startAngle + 90, // Right
      onClick: () => {
        onShowTableInfo(tableName);
        handleClose();
      },
    },
    {
      icon: <CopyIcon fontSize="small" />,
      label: 'Copy Name',
      angle: startAngle + 135, // Bottom-right
      onClick: () => {
        onCopyTableName(tableName);
        handleClose();
      },
    },
    {
      icon: <HideIcon fontSize="small" />,
      label: 'Hide Table',
      angle: startAngle + 180, // Bottom
      onClick: () => {
        onHideTable(tableName);
        handleClose();
      },
    },
  ].map(action => {
    const radian = (action.angle * Math.PI) / 180;
    return {
      ...action,
      position: {
        top: Math.sin(radian) * radius,
        right: -Math.cos(radian) * radius,
      }
    };
  });

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: -30, // Position at top-right corner
        right: -30, // Position outside the card
        zIndex: 50,
      }}
    >
      {/* Main Close Button - Always visible when toolkit is active */}
      <Fade in={isVisible} timeout={150}>
        <IconButton
          onClick={handleClose}
          sx={{
            backgroundColor: '#6B7280', // Gray color
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: '#4B5563',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Fade>

      {/* Floating Action Buttons */}
      {actions.map((action, index) => (
        <Fade
          key={index}
          in={isExpanded}
          timeout={200} // Faster animation
          style={{ transitionDelay: isExpanded ? `${index * 25}ms` : '0ms' }} // Faster stagger
        >
          <Box
            sx={{
              position: 'absolute',
              ...action.position,
            }}
          >
            <Tooltip title={action.label} placement="left">
              <IconButton
                onClick={action.onClick}
                sx={{
                  backgroundColor: '#6B7280', // Gray color like Pinterest
                  color: 'white',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: '#4B5563',
                    transform: 'scale(1.15)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

export default TableToolkitIcon;