import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,

  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Refresh as ResetIcon,
  Storage as TableIcon,
  Link as RelationIcon,
  Key as KeyIcon,
  Speed as IndexIcon,
} from '@mui/icons-material';
import { Table } from '../types';

export interface FilterState {
  showPrimaryKeys: boolean;
  showForeignKeys: boolean;
  showIndexes: boolean;
  showRelationships: boolean;
  tableTypes: {
    coreTables: boolean;
    junctionTables: boolean;
    lookupTables: boolean;
  };
  dataTypes: {
    showNumbers: boolean;
    showStrings: boolean;
    showDates: boolean;
    showBooleans: boolean;
  };
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  categorizedTables: {
    coreTables: Table[];
    junctionTables: Table[];
    lookupTables: Table[];
  };
  filterStats: {
    tables: { total: number; visible: number; hidden: number };
    relationships: { total: number; visible: number; hidden: number };
  };
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
  categorizedTables,
  filterStats,
}) => {
  const [expanded, setExpanded] = useState<string[]>(['relationships', 'tableTypes']);

  // Use the passed categorized tables
  const tableAnalysis = categorizedTables;

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const handleFilterChange = (filterPath: string, value: boolean) => {
    const pathParts = filterPath.split('.');
    const newFilters = { ...filters };
    
    if (pathParts.length === 1) {
      (newFilters as any)[pathParts[0]] = value;
    } else if (pathParts.length === 2) {
      (newFilters as any)[pathParts[0]][pathParts[1]] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const FilterToggle: React.FC<{
    label: string;
    count?: number;
    active: boolean;
    onChange: (value: boolean) => void;
    icon?: React.ReactNode;
  }> = ({ label, count, active, onChange, icon }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.5,
        px: 1,
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {label}
        </Typography>
        {count !== undefined && (
          <Chip
            label={count}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.7rem',
              backgroundColor: active ? 'primary.main' : 'action.hover',
              color: active ? 'primary.contrastText' : 'text.secondary',
              '& .MuiChip-label': { px: 0.8 },
            }}
          />
        )}
      </Box>
      <Switch
        size="small"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          '& .MuiSwitch-thumb': {
            width: 16,
            height: 16,
          },
          '& .MuiSwitch-track': {
            borderRadius: 10,
          },
        }}
      />
    </Box>
  );

  const totalFiltersActive = Object.values(filters).reduce((count: number, value) => {
    if (typeof value === 'boolean') {
      return count + (value ? 0 : 1); // Count inactive filters
    } else if (typeof value === 'object' && value !== null) {
      return count + Object.values(value).reduce((subCount: number, subValue: unknown) =>
        subCount + (typeof subValue === 'boolean' && subValue ? 0 : 1), 0
      );
    }
    return count;
  }, 0);

  return (
    <Paper
      elevation={2}
      sx={{
        width: 280,
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'surface.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            Smart Filters
          </Typography>
          {totalFiltersActive > 0 && (
            <Chip
              label={`${totalFiltersActive} hidden`}
              size="small"
              color="warning"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Box>
        <Tooltip title="Reset all filters">
          <IconButton size="small" onClick={onReset}>
            <ResetIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filter Groups */}
      <Box sx={{ p: 1 }}>
        {/* Relationships Filter */}
        <Accordion
          expanded={expanded.includes('relationships')}
          onChange={handleAccordionChange('relationships')}
          elevation={0}
          sx={{
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 40,
              '& .MuiAccordionSummary-content': { margin: '8px 0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RelationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Relationships
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1 }}>
            <FilterToggle
              label="Primary Keys"
              active={filters.showPrimaryKeys}
              onChange={(value) => handleFilterChange('showPrimaryKeys', value)}
              icon={<KeyIcon sx={{ fontSize: 14, color: '#FF9800' }} />}
            />
            <FilterToggle
              label="Foreign Keys"
              active={filters.showForeignKeys}
              onChange={(value) => handleFilterChange('showForeignKeys', value)}
              icon={<KeyIcon sx={{ fontSize: 14, color: '#2196F3' }} />}
            />
            <FilterToggle
              label="Relationships"
              active={filters.showRelationships}
              onChange={(value) => handleFilterChange('showRelationships', value)}
              icon={<RelationIcon sx={{ fontSize: 14, color: '#4CAF50' }} />}
            />
            <FilterToggle
              label="Indexes"
              active={filters.showIndexes}
              onChange={(value) => handleFilterChange('showIndexes', value)}
              icon={<IndexIcon sx={{ fontSize: 14, color: '#9C27B0' }} />}
            />
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1 }} />

        {/* Table Types Filter */}
        <Accordion
          expanded={expanded.includes('tableTypes')}
          onChange={handleAccordionChange('tableTypes')}
          elevation={0}
          sx={{
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 40,
              '& .MuiAccordionSummary-content': { margin: '8px 0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Table Types
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1 }}>
            <FilterToggle
              label="Core Tables"
              count={tableAnalysis.coreTables.length}
              active={filters.tableTypes.coreTables}
              onChange={(value) => handleFilterChange('tableTypes.coreTables', value)}
              icon={<TableIcon sx={{ fontSize: 14, color: '#4285F4' }} />}
            />
            <FilterToggle
              label="Junction Tables"
              count={tableAnalysis.junctionTables.length}
              active={filters.tableTypes.junctionTables}
              onChange={(value) => handleFilterChange('tableTypes.junctionTables', value)}
              icon={<RelationIcon sx={{ fontSize: 14, color: '#34A853' }} />}
            />
            <FilterToggle
              label="Lookup Tables"
              count={tableAnalysis.lookupTables.length}
              active={filters.tableTypes.lookupTables}
              onChange={(value) => handleFilterChange('tableTypes.lookupTables', value)}
              icon={<TableIcon sx={{ fontSize: 14, color: '#FBBC04' }} />}
            />
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1 }} />

        {/* Data Types Filter */}
        <Accordion
          expanded={expanded.includes('dataTypes')}
          onChange={handleAccordionChange('dataTypes')}
          elevation={0}
          sx={{
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 40,
              '& .MuiAccordionSummary-content': { margin: '8px 0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Data Types
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1 }}>
            <FilterToggle
              label="Numbers"
              active={filters.dataTypes.showNumbers}
              onChange={(value) => handleFilterChange('dataTypes.showNumbers', value)}
            />
            <FilterToggle
              label="Strings"
              active={filters.dataTypes.showStrings}
              onChange={(value) => handleFilterChange('dataTypes.showStrings', value)}
            />
            <FilterToggle
              label="Dates"
              active={filters.dataTypes.showDates}
              onChange={(value) => handleFilterChange('dataTypes.showDates', value)}
            />
            <FilterToggle
              label="Booleans"
              active={filters.dataTypes.showBooleans}
              onChange={(value) => handleFilterChange('dataTypes.showBooleans', value)}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};

export default FilterPanel;
