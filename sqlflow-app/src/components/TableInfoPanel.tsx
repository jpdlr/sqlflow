import React, { useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Storage as TableIcon,
  Key as KeyIcon,
  Link as LinkIcon,
  ViewList as ColumnIcon,
  Speed as IndexIcon,
} from '@mui/icons-material';
import { Schema, Table } from '../types';

interface TableInfoPanelProps {
  open: boolean;
  onClose: () => void;
  table?: Table | null;
  schema: Schema;
  onNavigateToTable?: (tableName: string) => void;
}

const SIDEBAR_WIDTH = 420;

type ColumnFilter = 'all' | 'pk' | 'fk' | 'normal';

const TableInfoPanel: React.FC<TableInfoPanelProps> = ({ open, onClose, table, schema, onNavigateToTable }) => {
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>('all');

  const incomingRelations = useMemo(() => {
    if (!table) return [] as { from: string; fromColumn: string; toColumn: string }[];
    return schema.relationships
      .filter(r => r.to === table.name)
      .map(r => ({ from: r.from, fromColumn: r.fromColumn, toColumn: r.toColumn }));
  }, [schema.relationships, table]);

  const categorizeType = (type: string): { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'secondary' } => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('decimal') || t.includes('numeric') || t.includes('float') || t.includes('double')) return { label: 'NUM', color: 'primary' };
    if (t.includes('char') || t.includes('text') || t.includes('varchar')) return { label: 'TXT', color: 'success' };
    if (t.includes('time') || t.includes('date')) return { label: 'DATE', color: 'warning' };
    if (t.includes('bool')) return { label: 'BOOL', color: 'info' };
    if (t.includes('json')) return { label: 'JSON', color: 'secondary' };
    return { label: 'OTHER', color: 'default' };
  };

  const filteredColumns = useMemo(() => {
    if (!table) return [] as Table['columns'];
    switch (columnFilter) {
      case 'pk':
        return table.columns.filter(c => c.isPrimary);
      case 'fk':
        return table.columns.filter(c => c.isForeign);
      case 'normal':
        return table.columns.filter(c => !c.isPrimary && !c.isForeign);
      default:
        return table.columns;
    }
  }, [table, columnFilter]);

  if (!table) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          backgroundColor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TableIcon color="primary" fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Table Info</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Table Title */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>Table</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{table.name}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip size="small" label={`${table.columns.length} columns`} />
          <Chip size="small" color="warning" label={`${table.primaryKeys?.length || 0} PK`} />
          <Chip size="small" color="info" label={`${table.foreignKeys?.length || 0} FK`} />
          <Chip size="small" color="secondary" label={`${table.indexes?.length || 0} indexes`} />
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Columns */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <ColumnIcon sx={{ color: 'text.secondary' }} fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Columns</Typography>
            <Chip size="small" label={filteredColumns.length} />
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Chip size="small" variant={columnFilter === 'all' ? 'filled' : 'outlined'} label="All" onClick={() => setColumnFilter('all')} clickable />
              <Chip size="small" color="warning" variant={columnFilter === 'pk' ? 'filled' : 'outlined'} label="PK" onClick={() => setColumnFilter('pk')} clickable />
              <Chip size="small" color="info" variant={columnFilter === 'fk' ? 'filled' : 'outlined'} label="FK" onClick={() => setColumnFilter('fk')} clickable />
              <Chip size="small" variant={columnFilter === 'normal' ? 'filled' : 'outlined'} label="Normal" onClick={() => setColumnFilter('normal')} clickable />
            </Stack>
          </Stack>
          <List dense sx={{ bgcolor: 'surface.main', borderRadius: 1 }}>
            {filteredColumns.map((c, idx) => (
              <ListItem key={idx} sx={{ py: 0.5, borderBottom: idx < table.columns.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {c.isPrimary ? <KeyIcon sx={{ color: 'warning.main' }} fontSize="small" /> : c.isForeign ? <LinkIcon sx={{ color: 'info.main' }} fontSize="small" /> : <ColumnIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: c.isPrimary ? 700 : 500 }}>{c.name}</Typography>
                      {!c.nullable && <Chip size="small" label="NOT NULL" />}
                      <Chip size="small" variant="outlined" color={categorizeType(c.type).color} label={categorizeType(c.type).label} />
                      {c.isPrimary && <Chip size="small" color="warning" label="PK" />}
                      {c.isForeign && !c.isPrimary && <Chip size="small" color="info" label="FK" />}
                    </Stack>
                  }
                  secondary={<Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{c.type}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Primary Keys */}
        {table.primaryKeys && table.primaryKeys.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <KeyIcon sx={{ color: 'warning.main' }} fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Primary Key</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {table.primaryKeys.map((pk, i) => (
                <Chip key={i} size="small" color="warning" label={pk} />
              ))}
            </Stack>
          </Box>
        )}

        {/* Foreign Keys (Outgoing) */}
        {table.foreignKeys && table.foreignKeys.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LinkIcon color="info" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Foreign Keys</Typography>
              <Chip size="small" color="info" label={table.foreignKeys.length} />
            </Stack>
            <List dense sx={{ bgcolor: 'surface.main', borderRadius: 1 }}>
              {table.foreignKeys.map((fk, i) => (
                <ListItem key={i} sx={{ py: 0.5, borderBottom: i < table.foreignKeys.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <LinkIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fk.column}</Typography>
                        <Typography variant="body2">→</Typography>
                        <Chip
                          size="small"
                          color="info"
                          label={fk.referencedTable}
                          onClick={() => onNavigateToTable && onNavigateToTable(fk.referencedTable)}
                          clickable
                        />
                        <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'monospace' }}>.{fk.referencedColumn}</Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Incoming Relations (Referenced By) */}
        {incomingRelations.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LinkIcon sx={{ color: 'success.main' }} fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Referenced By</Typography>
              <Chip size="small" color="success" label={incomingRelations.length} />
            </Stack>
            <List dense sx={{ bgcolor: 'surface.main', borderRadius: 1 }}>
              {incomingRelations.map((rel, i) => (
                <ListItem key={i} sx={{ py: 0.5, borderBottom: i < incomingRelations.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <LinkIcon sx={{ color: 'success.main' }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          color="success"
                          label={rel.from}
                          onClick={() => onNavigateToTable && onNavigateToTable(rel.from)}
                          clickable
                        />
                        <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'monospace' }}>.{rel.fromColumn}</Typography>
                        <Typography variant="body2">→</Typography>
                        <Typography variant="body2">{table.name}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'monospace' }}>.{rel.toColumn}</Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Indexes */}
        {table.indexes && table.indexes.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IndexIcon sx={{ color: 'secondary.main' }} fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Indexes</Typography>
              <Chip size="small" color="secondary" label={table.indexes.length} />
            </Stack>
            <List dense sx={{ bgcolor: 'surface.main', borderRadius: 1 }}>
              {table.indexes.map((idx, i) => (
                <ListItem key={i} sx={{ py: 0.5, borderBottom: i < table.indexes.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IndexIcon sx={{ color: 'secondary.main' }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{idx.name}</Typography>
                        {idx.isUnique && <Chip size="small" label="UNIQUE" color="secondary" />}
                        <Chip size="small" variant="outlined" label={(idx.type || 'BTREE').toUpperCase()} />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        ({idx.columns.join(', ')})
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default TableInfoPanel;
