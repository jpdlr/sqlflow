import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Slider,
  Button,
} from '@mui/material';
import {
  AccountTree as HierarchicalIcon,
  RadioButtonUnchecked as CircularIcon,
  Apps as ModularIcon,
  ScatterPlot as ForceIcon,
  GridOn as LayoutIcon,
  Straighten as SpacingIcon,
  CenterFocusStrong as DistributeIcon,
  PanTool as AntiOverlapIcon,
} from '@mui/icons-material';

export type LayoutType = 'grid' | 'hierarchical' | 'circular' | 'modular' | 'force';

interface LayoutControlsProps {
  currentLayout: LayoutType;
  spacing: number;
  onLayoutChange: (layout: LayoutType) => void;
  onSpacingChange: (spacing: number) => void;
  onDistributeEvenly: () => void;
  onResolveOverlaps: () => void;
}

const LayoutControls: React.FC<LayoutControlsProps> = ({
  currentLayout,
  spacing,
  onLayoutChange,
  onSpacingChange,
  onDistributeEvenly,
  onResolveOverlaps,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [spacingMenuOpen, setSpacingMenuOpen] = useState<null | HTMLElement>(null);

  const handleLayoutMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLayoutMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSpacingMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSpacingMenuOpen(event.currentTarget);
  };

  const handleSpacingMenuClose = () => {
    setSpacingMenuOpen(null);
  };

  const layoutPresets = [
    {
      type: 'grid' as LayoutType,
      name: 'Grid',
      description: 'Organized grid layout',
      icon: <LayoutIcon />,
    },
    {
      type: 'hierarchical' as LayoutType,
      name: 'Hierarchical',
      description: 'Organize by dependencies',
      icon: <HierarchicalIcon />,
    },
    {
      type: 'circular' as LayoutType,
      name: 'Circular',
      description: 'Main tables in center',
      icon: <CircularIcon />,
    },
    {
      type: 'modular' as LayoutType,
      name: 'Modular',
      description: 'Group by table prefix',
      icon: <ModularIcon />,
    },
    {
      type: 'force' as LayoutType,
      name: 'Force-Directed',
      description: 'Physics-based positioning',
      icon: <ForceIcon />,
    },
  ];

  const currentLayoutPreset = layoutPresets.find(p => p.type === currentLayout);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Layout Preset Button */}
      <Tooltip title={`Current: ${currentLayoutPreset?.name || 'Grid'} Layout`} placement="right">
        <IconButton
          onClick={handleLayoutMenuOpen}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            color: 'primary.main',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {currentLayoutPreset?.icon || <LayoutIcon />}
        </IconButton>
      </Tooltip>

      {/* Spacing Controls Button */}
      <Tooltip title="Spacing Controls" placement="right">
        <IconButton
          onClick={handleSpacingMenuOpen}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <SpacingIcon />
        </IconButton>
      </Tooltip>

      {/* Layout Presets Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLayoutMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 280,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Layout Presets
        </Typography>
        <Divider />
        {layoutPresets.map((preset) => (
          <MenuItem
            key={preset.type}
            onClick={() => {
              onLayoutChange(preset.type);
              handleLayoutMenuClose();
            }}
            selected={currentLayout === preset.type}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <Box sx={{ color: 'primary.main' }}>{preset.icon}</Box>
            <Box>
              <Typography variant="subtitle2">{preset.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {preset.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Spacing Controls Menu */}
      <Menu
        anchorEl={spacingMenuOpen}
        open={Boolean(spacingMenuOpen)}
        onClose={handleSpacingMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 300,
            p: 2,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Spacing Controls
        </Typography>
        
        {/* Table Spacing Slider */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Table Spacing: {spacing}px
          </Typography>
          <Slider
            value={spacing}
            onChange={(_, newValue) => onSpacingChange(newValue as number)}
            min={200}
            max={800}
            step={50}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                backgroundColor: 'primary.main',
              },
              '& .MuiSlider-track': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Auto-Layout Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            onClick={() => {
              onDistributeEvenly();
              handleSpacingMenuClose();
            }}
            startIcon={<DistributeIcon />}
            variant="outlined"
            size="small"
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Distribute Evenly
          </Button>
          
          <Button
            onClick={() => {
              onResolveOverlaps();
              handleSpacingMenuClose();
            }}
            startIcon={<AntiOverlapIcon />}
            variant="outlined"
            size="small"
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Fix Overlaps
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default LayoutControls;