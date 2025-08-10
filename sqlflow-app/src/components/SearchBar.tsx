import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popper,
  ClickAwayListener,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
} from '@mui/icons-material';
import { Schema } from '../types';

interface SearchResult {
  type: 'table' | 'column';
  tableName: string;
  columnName?: string;
  match: string;
}

interface SearchBarProps {
  schema: Schema;
  onSearchResult?: (result: SearchResult | null) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  schema,
  onSearchResult,
  placeholder = "Search tables and columns...",
  inputRef: externalInputRef
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const anchorRef = useRef<HTMLDivElement>(null);

  // Search logic
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Search through tables and columns
    schema.tables.forEach(table => {
      const tableName = table.name.toLowerCase();
      
      // Match table names
      if (tableName.includes(lowercaseQuery)) {
        searchResults.push({
          type: 'table',
          tableName: table.name,
          match: table.name
        });
      }

      // Match column names
      table.columns.forEach(column => {
        const columnName = column.name.toLowerCase();
        if (columnName.includes(lowercaseQuery)) {
          searchResults.push({
            type: 'column',
            tableName: table.name,
            columnName: column.name,
            match: `${table.name}.${column.name}`
          });
        }
      });
    });

    // Sort results: tables first, then columns, then by relevance
    searchResults.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'table' ? -1 : 1;
      }
      // Exact matches first
      const aExact = a.match.toLowerCase() === lowercaseQuery;
      const bExact = b.match.toLowerCase() === lowercaseQuery;
      if (aExact !== bExact) {
        return aExact ? -1 : 1;
      }
      // Then by alphabetical order
      return a.match.localeCompare(b.match);
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [schema]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);
    performSearch(query);
    setShowResults(query.trim().length > 0);
  }, [performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  }, [showResults, results, selectedIndex]);

  // Handle result selection
  const handleResultClick = useCallback((result: SearchResult) => {
    setSearchQuery(result.match);
    setShowResults(false);
    onSearchResult?.(result);
    inputRef.current?.blur();
  }, [onSearchResult]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    onSearchResult?.(null);
    inputRef.current?.focus();
  }, [onSearchResult]);

  // Close results when clicking away
  const handleClickAway = useCallback(() => {
    setShowResults(false);
    setSelectedIndex(-1);
  }, []);

  // Keyboard shortcut (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          // For Material-UI InputBase, we need to select the underlying input element
          const inputElement = inputRef.current.querySelector('input');
          if (inputElement) {
            inputElement.select();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 400,
            backgroundColor: 'surface.light',
            borderRadius: 2,
            border: '1px solid',
            borderColor: showResults ? 'primary.main' : 'divider',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <IconButton sx={{ p: 1, color: 'text.secondary' }}>
            <SearchIcon fontSize="small" />
          </IconButton>
          
          <InputBase
            ref={inputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              px: 1,
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                color: 'text.primary',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7,
                },
              },
            }}
          />

          {searchQuery && (
            <IconButton 
              onClick={handleClear}
              sx={{ p: 1, color: 'text.secondary' }}
              size="small"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}

          {!searchQuery && (
            <Chip
              label="Ctrl+F"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                mr: 1,
                backgroundColor: 'action.hover',
                color: 'text.secondary',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          )}
        </Paper>

        {/* Search Results Dropdown */}
        <Popper
          open={showResults && results.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: 1300, minWidth: 400 }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 0.5,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'hidden',
            }}
          >
            <List sx={{ py: 0 }}>
              {results.map((result, index) => (
                <ListItem key={`${result.type}-${result.match}`} disablePadding>
                  <ListItemButton
                    selected={index === selectedIndex}
                    onClick={() => handleResultClick(result)}
                    sx={{
                      py: 1,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {result.type === 'table' ? (
                      <TableIcon sx={{ fontSize: 16, color: 'inherit', opacity: 0.7 }} />
                    ) : (
                      <ColumnIcon sx={{ fontSize: 16, color: 'inherit', opacity: 0.7 }} />
                    )}
                    
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {result.type === 'table' ? result.tableName : result.columnName}
                        </Typography>
                      }
                      secondary={
                        result.type === 'column' && (
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            in {result.tableName}
                          </Typography>
                        )
                      }
                    />
                    
                    <Chip
                      label={result.type === 'table' ? 'Table' : 'Column'}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        backgroundColor: result.type === 'table' ? 'info.main' : 'success.main',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.8 },
                      }}
                     />
                   </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;