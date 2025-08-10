import React from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Mouse as CursorIcon,
  Add as AddIcon,
  Storage as DatabaseIcon,
  FileUpload as UploadIcon,
  Code as CodeIcon,
  Help as LegendIcon,
  FilterList as FilterIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import { ReactFlowInstance } from 'reactflow';
import ZoomControls from './ZoomControls';
import LayoutControls, { LayoutType } from './LayoutControls';

interface LeftSidebarProps {
  onUploadClick: () => void;
  onCodeClick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleLegend?: () => void;
  onToggleFilter?: () => void;
  onResetFocus?: () => void;
  showLegend?: boolean;
  showFilterPanel?: boolean;
  reactFlowInstance?: ReactFlowInstance | null | undefined;
  currentLayout?: LayoutType;
  spacing?: number;
  onLayoutChange?: (layout: LayoutType) => void;
  onSpacingChange?: (spacing: number) => void;
  onDistributeEvenly?: () => void;
  onResolveOverlaps?: () => void;
}

const SIDEBAR_WIDTH = 64;

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onUploadClick,
  onCodeClick,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleLegend,
  onToggleFilter,
  onResetFocus,
  showLegend = false,
  showFilterPanel = false,
  reactFlowInstance,
  currentLayout = 'hierarchical',
  spacing = 450,
  onLayoutChange,
  onSpacingChange,
  onDistributeEvenly,
  onResolveOverlaps,
}) => {
  const SidebarButton: React.FC<{
    icon: React.ReactNode;
    tooltip: string;
    onClick?: () => void;
    active?: boolean;
  }> = ({ icon, tooltip, onClick, active = false }) => (
    <Tooltip title={tooltip} placement="right">
      <IconButton
        onClick={onClick}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          color: active ? 'primary.main' : 'text.secondary',
          backgroundColor: active ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
        },
      }}
    >
      {/* Main tools */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <SidebarButton
          icon={<CursorIcon />}
          tooltip="Select"
          active={true}
        />
        {/* <SidebarButton
          icon={<AddIcon />}
          tooltip="Add Element"
        />
        <SidebarButton
          icon={<DatabaseIcon />}
          tooltip="Database Tools"
        /> */}
      </Box>

      <Divider sx={{ width: '60%', my: 2, borderColor: 'divider' }} />

      {/* File operations */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <SidebarButton
          icon={<UploadIcon />}
          tooltip="Upload SQL File"
          onClick={onUploadClick}
        />
        <SidebarButton
          icon={<CodeIcon />}
          tooltip="Show SQL Code"
          onClick={onCodeClick}
        />
        {onToggleFilter && (
          <SidebarButton
            icon={<FilterIcon />}
            tooltip={showFilterPanel ? "Hide Filters" : "Show Filters"}
            onClick={onToggleFilter}
            active={showFilterPanel}
          />
        )}
      </Box>

      <Divider sx={{ width: '60%', my: 2, borderColor: 'divider' }} />

      {/* Layout Controls */}
      {onLayoutChange && onSpacingChange && onDistributeEvenly && onResolveOverlaps && (
        <>
          <LayoutControls
            currentLayout={currentLayout}
            spacing={spacing}
            onLayoutChange={onLayoutChange}
            onSpacingChange={onSpacingChange}
            onDistributeEvenly={onDistributeEvenly}
            onResolveOverlaps={onResolveOverlaps}
          />
          
          <Divider sx={{ width: '60%', my: 2, borderColor: 'divider' }} />
        </>
      )}

      {/* Enhanced Zoom Controls */}
      <ZoomControls
        reactFlowInstance={reactFlowInstance}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitView={onFitView}
      />

      {/* Spacer to push bottom tools */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {onResetFocus && (
          <SidebarButton
            icon={<ResetIcon />}
            tooltip="Reset View (Ctrl+R) - Show all tables"
            onClick={onResetFocus}
          />
        )}
        {onToggleLegend && (
          <SidebarButton
            icon={<LegendIcon />}
            tooltip={showLegend ? "Hide Legend" : "Show Legend"}
            onClick={onToggleLegend}
            active={showLegend}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default LeftSidebar;