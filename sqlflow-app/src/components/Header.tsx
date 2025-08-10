import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Share as ShareIcon,
  AccountCircle as AccountCircleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import SearchBar from './SearchBar';
import { Schema } from '../types';

interface SearchResult {
  type: 'table' | 'column';
  tableName: string;
  columnName?: string;
  match: string;
}

interface HeaderProps {
  onShare?: () => void;
  schema: Schema;
  onSearchResult?: (result: SearchResult | null) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

const Header: React.FC<HeaderProps> = ({ onShare, schema, onSearchResult, searchInputRef }) => {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        {/* Left section - Logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/favicon.png"
            alt="SQLFlow Logo"
            style={{
              width: 32,
              height: 32,
              marginLeft: 64,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            SQLFlow
          </Typography>
        </Box>

        {/* Center section - Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchBar 
            schema={schema} 
            onSearchResult={onSearchResult}
            placeholder="Search tables and columns..."
            inputRef={searchInputRef}
          />
        </Box>

        {/* Right section - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ffa62e 0%, #1d3246 100%)',
              borderRadius: 10,
              padding: '2px',
            }}
          >
            <Button
              variant="text"
              startIcon={<ShareIcon />}
              onClick={onShare}
              sx={{
                borderRadius: 8,
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                background: '#0A0A0A',
                color: '#ffa62e',
                width: '100%',
                '&:hover': {
                  background: 'rgba(255, 166, 46, 0.05)',
                },
              }}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;