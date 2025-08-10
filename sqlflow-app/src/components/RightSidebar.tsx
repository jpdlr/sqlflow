import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  PlayArrow as RunIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
  sqlCode: string;
  onSQLChange: (sql: string) => void;
  onRun?: () => void;
}

const SIDEBAR_WIDTH = 400;

const RightSidebar: React.FC<RightSidebarProps> = ({
  open,
  onClose,
  sqlCode,
  onSQLChange,
  onRun,
}) => {

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onSQLChange(content);
      };
      reader.readAsText(file);
    }
  }, [onSQLChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.sql', '.txt'],
      'application/sql': ['.sql']
    },
    multiple: false,
  });

  const sampleTemplates = [
    {
      name: 'E-commerce',
      sql: `-- E-commerce Database Schema
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`
    },
    {
      name: 'Blog System',
      sql: `-- Blog Database Schema
CREATE TABLE authors (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    post_id INTEGER NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);`
    },
    {
      name: 'User Auth',
      sql: `-- User Authentication Schema
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`
    },
    {
      name: 'PostgreSQL',
      sql: `-- PostgreSQL Example Schema
CREATE TABLE IF NOT EXISTS public.users (
    id bigserial PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role INT NOT NULL,
    enabled BOOLEAN NOT NULL,
    create_date TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.projects (
    id bigserial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    documentation JSONB
);

CREATE TABLE IF NOT EXISTS public.tech_blogs (
    id bigserial PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES public.users(id),
    create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_video BOOLEAN DEFAULT FALSE
);`
    }
  ];

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
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SQL Input
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* File Upload Section */}
        <Card sx={{ backgroundColor: 'surface.main' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Upload SQL File
            </Typography>
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                backgroundColor: isDragActive ? 'action.hover' : 'transparent',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isDragActive ? 'Drop the SQL file here' : 'Drag & drop or click to select'}
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* SQL Input Section */}
        <Card sx={{ backgroundColor: 'surface.main', flex: 1 }}>
          <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                SQL Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={() => onSQLChange('')}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  Clear
                </Button>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #ffa62e 0%, #1d3246 100%)',
                    borderRadius: 10,
                    padding: '2px',
                  }}
                >
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<RunIcon />}
                    onClick={onRun}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 2,
                      borderRadius: 8,
                      background: '#2A2A2A',
                      color: '#ffa62e',
                      width: '100%',
                      '&:hover': {
                        background: 'rgba(255, 166, 46, 0.05)',
                      },
                    }}
                  >
                    Generate
                  </Button>
                </Box>
              </Box>
            </Box>
            
            <TextField
              multiline
              rows={20}
              value={sqlCode}
              onChange={(e) => onSQLChange(e.target.value)}
              placeholder="Paste your SQL CREATE TABLE statements here..."
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '0.875rem',
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ backgroundColor: 'surface.main' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Templates
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sampleTemplates.map((template, index) => (
                <Chip
                  key={index}
                  label={template.name}
                  size="small"
                  onClick={() => onSQLChange(template.sql)}
                  sx={{
                    backgroundColor: 'surface.light',
                    color: 'text.primary',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Drawer>
  );
};

export default RightSidebar;