import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Slider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as FitViewIcon,
  AspectRatio as FitBoundsIcon,
} from '@mui/icons-material';
import { ReactFlowInstance } from 'reactflow';

interface ZoomControlsProps {
  reactFlowInstance?: ReactFlowInstance | null | undefined;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  reactFlowInstance,
  onZoomIn,
  onZoomOut,
  onFitView,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  // Update zoom level when React Flow viewport changes
  useEffect(() => {
    if (!reactFlowInstance) return;

    const updateZoom = () => {
      const viewport = reactFlowInstance.getViewport();
      setZoomLevel(Math.round(viewport.zoom * 100));
    };

    // Initial update
    updateZoom();

    // Listen to viewport changes
    const handleViewportChange = () => updateZoom();
    
    // Note: React Flow doesn't have a direct viewport change event
    // We'll update this when zoom functions are called
    
    return () => {
      // Cleanup if needed
    };
  }, [reactFlowInstance]);

  const handleZoomIn = () => {
    onZoomIn?.();
    // Update zoom level after a short delay to get the new viewport
    setTimeout(() => {
      if (reactFlowInstance) {
        const viewport = reactFlowInstance.getViewport();
        setZoomLevel(Math.round(viewport.zoom * 100));
      }
    }, 100);
  };

  const handleZoomOut = () => {
    onZoomOut?.();
    setTimeout(() => {
      if (reactFlowInstance) {
        const viewport = reactFlowInstance.getViewport();
        setZoomLevel(Math.round(viewport.zoom * 100));
      }
    }, 100);
  };

  const handleFitView = () => {
    onFitView?.();
    setTimeout(() => {
      if (reactFlowInstance) {
        const viewport = reactFlowInstance.getViewport();
        setZoomLevel(Math.round(viewport.zoom * 100));
      }
    }, 300); // Longer delay for fit view animation
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (!reactFlowInstance) return;
    
    const zoom = (newValue as number) / 100;
    reactFlowInstance.setViewport({ 
      x: reactFlowInstance.getViewport().x, 
      y: reactFlowInstance.getViewport().y, 
      zoom 
    });
    setZoomLevel(newValue as number);
  };

  const ZoomButton: React.FC<{
    icon: React.ReactNode;
    tooltip: string;
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ icon, tooltip, onClick, disabled = false }) => (
    <Tooltip title={tooltip} placement="right">
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            color: disabled ? 'text.disabled' : 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary',
            },
            '&:disabled': {
              color: 'text.disabled',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
      <ZoomButton
        icon={<ZoomInIcon />}
        tooltip="Zoom In (Ctrl++)"
        onClick={handleZoomIn}
        disabled={zoomLevel >= 300}
      />
      
      <ZoomButton
        icon={<ZoomOutIcon />}
        tooltip="Zoom Out (Ctrl+-)"
        onClick={handleZoomOut}
        disabled={zoomLevel <= 25}
      />
      
      <ZoomButton
        icon={<FitViewIcon />}
        tooltip="Fit All Tables (Ctrl+0)"
        onClick={handleFitView}
      />

      <Divider sx={{ width: '60%', my: 1, borderColor: 'divider' }} />

      {/* Zoom Level Indicator */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 1,
        minHeight: 120,
        py: 1,
      }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: 'text.secondary',
            fontWeight: 500,
            minWidth: 40,
            textAlign: 'center',
            writingMode: 'vertical-lr',
            textOrientation: 'mixed',
          }}
        >
          {zoomLevel}%
        </Typography>
        
        <Slider
          value={zoomLevel}
          onChange={handleSliderChange}
          min={25}
          max={300}
          step={5}
          orientation="vertical"
          sx={{
            height: 80,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
            '& .MuiSlider-rail': {
              width: 3,
            },
            '& .MuiSlider-track': {
              width: 3,
            },
          }}
        />
        
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6rem',
            color: 'text.secondary',
            textAlign: 'center',
            writingMode: 'vertical-lr',
            textOrientation: 'mixed',
          }}
        >
          ZOOM
        </Typography>
      </Box>
    </Box>
  );
};

export default ZoomControls;